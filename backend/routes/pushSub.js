const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const pushSubController = require('../controllers/pushSub')

router.post('/push-subscription', auth, pushSubController.addPushSubscription)

module.exports = router;