const { validationResult, check } = require('express-validator');
const validator = require('validator');

exports.validateRegistration = [
  check('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  check('email').trim().isEmail().withMessage('Please enter a valid email'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.validateLogin = [
  check('email').trim().isEmail().withMessage('Please enter a valid email'),
  check('password').exists().withMessage('Password is required'),
];

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

exports.validateUsername = (username) => {
  if (!username) return null;
  
  // Username should be 3-30 characters long and contain only alphanumeric characters and underscores
  if (!validator.isLength(username, { min: 3, max: 30 })) {
    return 'Username must be between 3 and 30 characters long';
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  
  return null;
};

exports.validateEmail = (email) => {
  if (!email) return null;
  
  if (!validator.isEmail(email)) {
    return 'Please provide a valid email address';
  }
  
  return null;
};

exports.validatePassword = (password) => {
  if (!password) return null;
  
  if (!validator.isLength(password, { min: 8 })) {
    return 'Password must be at least 8 characters long';
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return 'Password must contain at least one special character (@$!%*?&)';
  }
  
  return null;
};