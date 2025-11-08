const express = require('express');
const {
  createOrder,
  getOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  updateOrderToPaid,
  cancelOrder
} = require('../controllers/orderController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(auth);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrder);
router.put('/:id/pay', updateOrderToPaid);
router.put('/:id/cancel', cancelOrder);

// Admin only routes
router.get('/', authorize('admin'), getOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatus);

module.exports = router;