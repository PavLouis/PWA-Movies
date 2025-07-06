const ListLike = require('../models/ListLike');
const RecMovieList = require('../models/RecMovieList');
const { sendPushNotification } = require('../utils/pushSubscription')

const sendNotificationToUser = async (title, recMovieListId, userId, firstTime="") => {
  const notification = {
    title: 'New Like!',
    type: "LIKE",
    body: `Someone liked your movie list "${title}" ${firstTime}`,
    data: {
      url: `/reclist/${recMovieListId}`,
      listId: recMovieListId
    }
  };
  return sendPushNotification(userId.toString(), notification);
}

const likeController = {
  // Toggle like status
  async toggleLike(req, res) {
    try {
      const { recMovieListId } = req.params;
      const userId = req.user.userId;

      let like = await ListLike.findOne({ userId, recMovieListId })
      .populate({ path: 'recMovieListId' });


      if (like) {
        // Toggle existing like
        like.liked = !like.liked;
        await like.save();
        if (like.recMovieListId.userId.toString() !== userId)
          await sendNotificationToUser(like.recMovieListId.title, recMovieListId, like.recMovieListId.userId);
      } else {
        // Create new like
        like = await ListLike.create({
          userId,
          recMovieListId,
          liked: true
        });

        let recMovieList = await RecMovieList.findOne({ _id: recMovieListId })

        if (recMovieList && recMovieList.userId.toString() !== userId) {
          await sendNotificationToUser(recMovieList.title, recMovieListId, recMovieList.userId, "for the first time !")
        }
      }

      res.json({ liked: like.liked });
    } catch (error) {
      res.status(500).json({ message: 'Error toggling like', error: error.message });
    }
  },

  // Get like status for a list
  async getLikeStatus(req, res) {
    try {
      const { recMovieListId } = req.params;
      const userId = req.user.userId;

      const like = await ListLike.findOne({ userId, recMovieListId });

      res.json({ liked: like ? like.liked : false });
    } catch (error) {
      res.status(500).json({ message: 'Error getting like status', error: error.message });
    }
  },

  // Get like count for a list
  async getLikeCount(req, res) {
    try {
      const { recMovieListId } = req.params;

      const likeCount = await ListLike.countDocuments({
        recMovieListId,
        liked: true
      });

      res.json({ count: likeCount });
    } catch (error) {
      res.status(500).json({ message: 'Error getting like count', error: error.message });
    }
  },

  // Get liked lists for a user
  async getUserLikedLists(req, res) {
    try {
      const userId = req.user.userId;

      const likedLists = await ListLike.find({
        userId,
        liked: true
      })
        .populate({
          path: 'recMovieListId',
          populate: { path: 'userId', select: 'username' }
        });

      const formattedLists = likedLists.map((like) => {
        if (like.recMovieListId.isPublic) {
          return ({
            list: like.recMovieListId,
            likedAt: like.createdAt
          })
        }
        return null
      }).filter(Boolean);

      res.json(formattedLists);
    } catch (error) {
      res.status(500).json({ message: 'Error getting liked lists', error: error.message });
    }
  }
};

module.exports = likeController;