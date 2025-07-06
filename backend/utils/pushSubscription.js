const PushSubscription = require('../models/PushSubscription');
const webpush = require('web-push')

exports.sendPushNotification = async (userId, payload) => {
    try {
      const subscriptions = await PushSubscription.find({ userId });
      
      const notifications = subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            subscription.subscriptionData,
            JSON.stringify(payload)
          );
        } catch (error) {
          if (error.statusCode === 410) {
            // Remove invalid subscription
            await PushSubscription.deleteOne({ _id: subscription._id });
          }
          console.error('Push notification error:', error);
        }
      });
  
      await Promise.all(notifications);
    } catch (error) {
      console.error('Send notification error:', error);
    }
  }
  

  exports.sendPushNotificationToAll = async (creatorId, payload) => {
    try {
      // Récupérer toutes les subscriptions SAUF celles du créateur
      const subscriptions = await PushSubscription.find({ 
        userId: { $ne: creatorId } 
      });
  
      const notifications = subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            subscription.subscriptionData,
            JSON.stringify(payload)
          );
        } catch (error) {
          if (error.statusCode === 410) {
            await PushSubscription.deleteOne({ _id: subscription._id });
          }
          console.error('Push notification error:', error);
        }
      });
      
      await Promise.all(notifications);
    } catch (error) {
      console.error('Send notification error:', error);
    }
  }