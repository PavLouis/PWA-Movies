const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true }
  }, { timestamps: true });
  
module.exports = mongoose.model('Favourite', favouriteSchema);
  