const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  releaseYear: Number,
  description: String,
  genre: String,
  voteAverage: Number,
  image: {
    fileId: mongoose.Types.ObjectId,
    filename: String,
    contentType: String
  }

}, { timestamps: true });


module.exports = mongoose.model('Movie', movieSchema);