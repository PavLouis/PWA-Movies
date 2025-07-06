const express = require('express');
const router = express.Router();
const favouriteController = require('../controllers/favouritesController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, favouriteController.addFavourite);
router.delete('/:movieId', auth, favouriteController.removeFavourite);
router.get('/', auth, favouriteController.getFavourites);
router.get('/count', auth, favouriteController.getFavouriteCount);
router.get('/:movieId', auth, favouriteController.getFavouriteById);

module.exports = router;