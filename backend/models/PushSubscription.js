const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionData: { 
      endpoint: { type: String, required: true, unique: true }, // Each endpoint is unique
      keys: {
        p256dh: String,
        auth: String
      }
    }
  
  }, { timestamps: true });
  
  module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
  