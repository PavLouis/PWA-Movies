const mongoose = require('mongoose');

const listMovieSchema = new mongoose.Schema({
    recMovieListId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecMovieList', required: true },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    addedAt: { type: Date, default: Date.now }
  });
  
// Create indexes for better query performance
listMovieSchema.index({ recMovieListId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('ListMovie', listMovieSchema);