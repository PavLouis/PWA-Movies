const router = require('express').Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin, validate } = require('../middleware/validator');

router.post('/register', validateRegistration, validate, authController.register);
router.post('/login', validateLogin, validate, authController.login);

module.exports = router;