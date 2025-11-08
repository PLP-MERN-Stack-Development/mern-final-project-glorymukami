const express = require('express');
const {
  createCheckoutSession,
  handleWebhook,
  verifyPayment
} = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Webhook needs raw body, so it comes before body parser
router.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);

// Protected routes
router.use(auth);
router.post('/create-checkout-session', createCheckoutSession);
router.get('/verify/:orderId', verifyPayment);

module.exports = router;