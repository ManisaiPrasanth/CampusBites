const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  getPaymentStatus
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Create Razorpay order
router.post('/create-order', createRazorpayOrder);

// Verify payment
router.post('/verify', verifyPayment);

// Get payment status
router.get('/status/:orderId', getPaymentStatus);

module.exports = router;


