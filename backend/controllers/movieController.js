const Movie = require('../models/Movie');
const User = require('../models/User');
const Favourite = require('../models/Favourite')
const ListMovie = require('../models/ListMovie')
const sharp = require('sharp');
const { getBucket } = require('../config/db');
const { sendPushNotificationToAll } = require('../utils/pushSubscription')

const sendNotificationToAllUser = async (title, movieId, userId) => {
  const notification = {
    title: 'New movies!',
    type: "MOVIES",
    body: `A new movie was added to the website : "${title}"`,
    data: {
      url: `/information-film/${movieId}`,
      movieId: movieId
    }
  };
  return sendPushNotificationToAll(userId.toString(), notification);
}

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const userId = req.user.userId;
    const { title, releaseYear, description, genre, voteAverage } = req.body;

    if (!title || !releaseYear || !description || !genre || !voteAverage) {
      return res.status(400).json({ error: "Missing fields" })
    }

    const filename = `${Date.now()}-${req.file.originalname}`;
    const uploadStream = getBucket().openUploadStream(filename, {
      contentType: req.file.mimetype
    });

    uploadStream.on('finish', async (uploadResult) => {
      const movie = new Movie({
        title,
        releaseYear,
        description,
        genre,
        voteAverage,
        image: {
          fileId: uploadResult._id,
          filename: filename,
          contentType: req.file.mimetype
        }
      });

      await movie.save();
      await sendNotificationToAllUser(title, movie._id, userId)
      res.status(201).json(movie);
    });

    uploadStream.write(req.file.buffer);
    uploadStream.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find()

    res.json({ movies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMovieImage = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie || !movie.image) {
      return res.status(404).json({ error: 'Movie or image not found' });
    }

    // Create download stream
    const downloadStream = getBucket().openDownloadStream(movie.image.fileId);
    
    // Convert stream to buffer for sharp processing
    const chunks = [];
    // Put event to see if a chunk of data appear or not, if it appear put inside our array
    // Its like we let the water flow little by little and not dump everyhting
    downloadStream.on('data', chunk => chunks.push(chunk));
    downloadStream.on('error', error => {
      console.error('Download stream error:', error);
      res.status(500).json({ error: 'Error processing image' });
    });

    // End event when all chunk are downloaded
    downloadStream.on('end', async () => {
      try {
        // Concat all chunks together because they are stocked in array now
        const buffer = Buffer.concat(chunks);
        
        // Process image with sharp
        const processedImage = await sharp(buffer)
          // Fixed size for all images
          .resize(500, null, {
            withoutEnlargement: true,
            fit: 'inside'
          })
          // Convert to WebP for better compression
          .webp({ 
            quality: 80,
            effort: 4
          })
          .toBuffer();

        // Set response headers
        res.set({
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000'
        });

        // Send processed image
        res.send(processedImage);

      } catch (error) {
        console.error('Sharp processing error:', error);
        res.status(500).json({ error: 'Error processing image' });
      }
    });

  } catch (error) {
    console.error('General error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    if (movie.image) {
      await getBucket().delete(movie.image.fileId);
    }

    // Delete associated favorites and list entries
    await Favourite.deleteMany({ movieId: req.params.id });
    await ListMovie.deleteMany({ movieId: req.params.id });

    const result = await Movie.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Movie could not be deleted' });
    }

    res.json({ message: 'Movie and image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json({ movie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};