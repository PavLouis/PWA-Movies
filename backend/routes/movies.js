const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const movieController = require('../controllers/movieController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, upload.single('image'), movieController.uploadImage);
router.get('/', movieController.getAllMovies);
router.get('/:id/image', movieController.getMovieImage);
router.delete('/:id', auth, movieController.deleteMovie);
router.get('/:id', movieController.getMovie);

module.exports = router;
