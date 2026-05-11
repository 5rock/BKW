const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, firebaseAuth } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerRules, loginRules, forgotPasswordRules, handleValidation } = require('../middleware/validate');

// All auth routes get the strict rate limiter
router.use(authLimiter);

// Email / Password
router.post('/register', registerRules, handleValidation, register);
router.post('/login',    loginRules,    handleValidation, login);

// Token management
router.post('/refresh', refresh);
router.post('/logout',  logout);

// Firebase OAuth (Google, Facebook, GitHub)
router.post('/firebase', firebaseAuth);

module.exports = router;
