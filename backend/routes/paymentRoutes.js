const express = require('express');
const router = express.Router();
const { initiatePaystackPayment, paystackWebhook, verifyPaystackPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Paystack payment routes
router.post('/paystack/initiate', protect, initiatePaystackPayment);
router.post('/paystack/webhook', paystackWebhook); // Public - called by Paystack server
router.get('/paystack/verify/:reference', protect, verifyPaystackPayment);

module.exports = router;