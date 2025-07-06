const Favourite = require('../models/Favourite');
const Movie = require('../models/Movie');

exports.addFavourite = async (req, res) => {
  try {
    const { movieId } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const existingFavourite = await Favourite.findOne({
      userId: req.user.userId,
      movieId
    });

    if (existingFavourite) {
      return res.status(400).json({ message: 'Movie already in favourites' });
    }

    const favourite = new Favourite({
      userId: req.user.userId,
      movieId
    });

    await favourite.save();
    res.status(201).json(favourite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},

  exports.removeFavourite = async (req, res) => {
    try {
      const favourite = await Favourite.findOneAndDelete({
        userId: req.user.userId,
        movieId: req.params.movieId
      });

      if (!favourite) {
        return res.status(404).json({ message: 'Favourite not found' });
      }

      res.json({ message: 'Favourite removed successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  exports.getFavourites = async (req, res) => {
    try {
      const favourites = await Favourite.find({ userId: req.user.userId })
        .populate('movieId')
        .sort({ createdAt: -1 });

      const movies = favourites.map(fav => fav.movieId);
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  exports.getFavouriteById = async (req, res) => {
    try {
      const favourites = await Favourite.findOne({ userId: req.user.userId, movieId: req.params.movieId })

      if (!favourites) {
        res.json({ state: false })
        return;
      }

      res.json({ state: true })
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  exports.getFavouriteCount = async (req, res) => {
    try {
      const count = await Favourite.countDocuments({ userId: req.user.userId });
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }