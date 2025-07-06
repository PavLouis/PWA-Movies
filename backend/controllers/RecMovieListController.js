const RecMovieList = require('../models/RecMovieList');
const ListMovie = require('../models/ListMovie');
const { isValidObjectId } = require('mongoose');

exports.getAllLists = async (req, res) => {
  try {
    const lists = await RecMovieList.find({ isPublic: true })
      .populate('userId', 'username');
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
};

exports.getUserLists = async (req, res) => {
  try {
    const lists = await RecMovieList.find({ userId: req.user.userId })
      .populate('userId', 'username');
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user lists' });
  }
};

exports.createList = async (req, res) => {
  try {
    const { title, description, isPublic } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Missing fields!!' });
    }

    const list = new RecMovieList({
      userId: req.user.userId,
      title,
      description,
      isPublic
    });
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create list' });
  }
};

exports.getList = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid list ID' });
    }

    const list = await RecMovieList.findById(req.params.id)
      .populate('userId', 'username');

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (!list.isPublic && list.userId._id.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const movies = await ListMovie.find({ recMovieListId: list._id })
      .populate('movieId')
      .sort({ addedAt: -1 });
    
    const formatedMovies = movies.map((movie) => {
      return {
        _id: movie.movieId._id,
        title: movie.movieId.title,
        releaseYear: movie.movieId.releaseYear,
        description: movie.movieId.description,
        voteAverage: movie.movieId.voteAverage,
        genre: movie.movieId.genre,
      }
    });

    res.json({ ...list.toObject(), movies: formatedMovies });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch list' });
  }
};

exports.updateList = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid list ID' });
    }

    const list = await RecMovieList.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, description, isPublic } = req.body;

    if (title) list.title = title;
    if (description !== undefined) list.description = description;
    if (isPublic !== undefined) list.isPublic = isPublic;

    await list.save();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update list' });
  }
};

exports.deleteList = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid list ID' });
    }

    const list = await RecMovieList.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Promise.all([
      list.deleteOne(),
      ListMovie.deleteMany({ recMovieListId: list.userId })
    ]);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete list' });
  }
};

exports.addMovie = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id) || !isValidObjectId(req.body.movieId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const list = await RecMovieList.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const listMovie = new ListMovie({
      recMovieListId: list._id.toString(),
      movieId: req.body.movieId
    });

    await listMovie.save();

    res.status(201).json({msg: "Movied added to the list !"});
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Movie already in list' });
    }
    res.status(500).json({ error: 'Failed to add movie to list' });
  }
};

exports.removeMovie = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id) || !isValidObjectId(req.params.movieId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const list = await RecMovieList.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await ListMovie.deleteOne({
      recMovieListId: list._id,
      movieId: req.params.movieId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Movie not found in list' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove movie from list' });
  }
};