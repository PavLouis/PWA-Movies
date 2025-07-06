const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

module.exports = router;