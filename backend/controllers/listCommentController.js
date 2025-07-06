const ListComment = require('../models/ListComment');
const RecMovieList = require('../models/RecMovieList');
const { sendPushNotification } = require('../utils/pushSubscription')

const sendNotificationToUser = async (title, recMovieListId, userId, firstTime="") => {
  const notification = {
    title: 'New Comment!',
    type: "COMMENT",
    body: `Someone commented your movie list "${title}" ${firstTime}`,
    data: {
      url: `/reclist/${recMovieListId}`,
      listId: recMovieListId
    }
  };
  return sendPushNotification(userId.toString(), notification);
}


const commentController = {
    // Add a new comment
    async addComment(req, res) {
        try {
            const { recMovieListId } = req.params;
            const { content } = req.body;
            const userId = req.user.userId;

            if (!content || content.trim().length === 0) {
                return res.status(400).json({ message: 'Comment content is required' });
            }

            const comment = await ListComment.create({
                userId,
                recMovieListId,
                content
            });

            const populatedComment = await ListComment.findById(comment._id)
                .populate('userId', 'username')
                .populate('recMovieListId');

            // Send notification to the list owner
            if (populatedComment.recMovieListId.userId.toString() !== userId) {
                await sendNotificationToUser(
                    populatedComment.recMovieListId.title,
                    recMovieListId,
                    populatedComment.recMovieListId.userId
                );
            }

            res.status(201).json(populatedComment);
        } catch (error) {
            res.status(500).json({ message: 'Error adding comment', error: error.message });
        }
    },

    // Get all comments for a list
    async getComments(req, res) {
        try {
            const { recMovieListId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const comments = await ListComment.find({ recMovieListId })
                .populate('userId', 'username')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(Number(limit));

            const total = await ListComment.countDocuments({ recMovieListId });

            res.json({
                comments,
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalComments: total
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching comments', error: error.message });
        }
    },

    // Edit a comment
    async editComment(req, res) {
        try {
            const { commentId } = req.params;
            const { content } = req.body;
            const userId = req.user.userId;

            if (!content || content.trim().length === 0) {
                return res.status(400).json({ message: 'Comment content is required' });
            }

            const comment = await ListComment.findOne({ _id: commentId, userId });

            if (!comment) {
                return res.status(404).json({ message: 'Comment not found or unauthorized' });
            }

            comment.content = content;
            await comment.save();

            const updatedComment = await ListComment.findById(commentId)
                .populate('userId', 'username')
                .populate('recMovieListId');

            res.json(updatedComment);
        } catch (error) {
            res.status(500).json({ message: 'Error updating comment', error: error.message });
        }
    },

    // Delete a comment
    async deleteComment(req, res) {
        try {
            const { commentId } = req.params;
            const userId = req.user.userId;

            const comment = await ListComment.findOne({ _id: commentId });

            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            // Check if user is comment owner or list owner
            const movieList = await RecMovieList.findById(comment.recMovieListId);
            if (comment.userId.toString() !== userId && movieList.userId.toString() !== userId) {
                return res.status(403).json({ message: 'Unauthorized to delete this comment' });
            }

            await comment.deleteOne();
            res.json({ message: 'Comment deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting comment', error: error.message });
        }
    }
};

module.exports = commentController;
