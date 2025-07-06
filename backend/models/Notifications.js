const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listTriggerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    listTriggerType: { type: String, required: true }, // COMMENT, LIKE
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
  
module.exports = mongoose.model('Notification', notificationSchema);
  