const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const { createPaymentIntent, stripeWebhook } = require('./paymentController');

const router = express.Router();

router.post('/create-payment-intent', protect, createPaymentIntent);

module.exports = router;
