
const PushSubscription = require('../models/PushSubscription');

exports.addPushSubscription = async (req, res) => {
  try {
    // Check if this exact endpoint already exists
    const existing = await PushSubscription.findOne({
      userId: req.user.userId
    });

    console.log(existing)
    if (existing) {
      // Update if exists
      existing.subscriptionData = req.body;
      await existing.save();
    } else {
      // Create new if doesn't exist
      await PushSubscription.create({
        userId: req.user.userId,
        subscriptionData: req.body
      });
    }

    res.status(201).json({ message: 'Subscription saved' });
  } catch (error) {
    res.status(500).json({ error: 'Subscription failed' });
  }
};