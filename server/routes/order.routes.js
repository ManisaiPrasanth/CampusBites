const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateItemStatus,
  cancelOrder,
  getOrderStats
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth');
const { createOrderValidation, validate } = require('../middleware/validation');

// Protected routes - User
router.post('/', protect, createOrderValidation, validate, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

// Protected routes - Admin/Canteen Owner only
router.get('/', protect, authorize('admin', 'canteen_owner'), getAllOrders);
router.put('/:id/status', protect, authorize('admin', 'canteen_owner'), updateOrderStatus);
router.put('/:id/items/status', protect, authorize('admin', 'canteen_owner'), updateItemStatus);
router.get('/stats/dashboard', protect, authorize('admin', 'canteen_owner'), getOrderStats);

module.exports = router;

