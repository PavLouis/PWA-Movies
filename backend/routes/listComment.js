const express = require('express');
const router = express.Router();
const commentController = require('../controllers/listCommentController');
const auth = require('../middleware/authMiddleware');

router.post('/:recMovieListId', auth, commentController.addComment);
router.get('/:recMovieListId', auth, commentController.getComments);
router.put('/:recMovieListId/comments/:commentId', auth, commentController.editComment);
router.delete('/:recMovieListId/comments/:commentId', auth, commentController.deleteComment);

module.exports = router;
