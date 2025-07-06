const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const RecMovieListController = require('../controllers/RecMovieListController');

// Public routes
router.get('/all', RecMovieListController.getAllLists);

// Protected routes
router.get('/self', auth, RecMovieListController.getUserLists);
router.post('/', auth, RecMovieListController.createList);
router.get('/:id', auth, RecMovieListController.getList);
router.put('/:id', auth, RecMovieListController.updateList);
router.delete('/:id', auth, RecMovieListController.deleteList);
router.post('/:id/movies', auth, RecMovieListController.addMovie);
router.delete('/:id/movies/:movieId', auth, RecMovieListController.removeMovie);

module.exports = router;
