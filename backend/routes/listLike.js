const express = require('express');
const router = express.Router();
const likeController = require('../controllers/listLikeController');
const auth = require('../middleware/authMiddleware');

router.post('/:recMovieListId', auth, likeController.toggleLike);
router.get('/:recMovieListId', auth, likeController.getLikeStatus);
router.get('/:recMovieListId/count', likeController.getLikeCount);
router.get('/me/liked-lists', auth, likeController.getUserLikedLists);

module.exports = router;
