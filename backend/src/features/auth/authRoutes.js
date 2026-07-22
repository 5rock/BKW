const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  firebaseAuth,
  forgotPassword,
  resetPassword,
} = require('./authController');
const { authLimiter } = require('../../middleware/rateLimiter');
const { requireMongo } = require('../../utils/connectDB');
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  handleValidation,
} = require('../../middleware/validate');

router.use(authLimiter);
router.use(requireMongo);

router.post('/register', registerRules, handleValidation, register);
router.post('/login', loginRules, handleValidation, login);
router.post('/firebase', firebaseAuth);
router.post('/social', firebaseAuth);
router.post('/forgot-password', forgotPasswordRules, handleValidation, forgotPassword);
router.patch('/reset-password/:token', resetPasswordRules, handleValidation, resetPassword);

router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;
