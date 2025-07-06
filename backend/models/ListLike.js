const mongoose = require('mongoose');

const listLikeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recMovieListId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecMovieList', required: true },
    liked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

listLikeSchema.index({ userId: 1, recMovieListId: 1 }, { unique: true });
  
module.exports = mongoose.model('ListLike', listLikeSchema);
  