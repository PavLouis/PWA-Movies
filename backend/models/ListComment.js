const mongoose = require('mongoose');

const listCommentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recMovieListId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecMovieList', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ListComment', listCommentSchema);
