const express = require('express');
const router = express.Router();
const {
  getAllMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuByCanteen,
  getMenuByCategory,
  searchMenu
} = require('../controllers/menu.controller');
const { protect, authorize } = require('../middleware/auth');
const { menuItemValidation, validate } = require('../middleware/validation');

// Public routes
router.get('/', getAllMenuItems);
router.get('/search', searchMenu);
router.get('/canteen/:canteen', getMenuByCanteen);
router.get('/category/:category', getMenuByCategory);
router.get('/:id', getMenuItem);

// Protected routes - Admin/Canteen Owner only
router.post('/', protect, authorize('admin', 'canteen_owner'), menuItemValidation, validate, createMenuItem);
router.put('/:id', protect, authorize('admin', 'canteen_owner'), updateMenuItem);
router.delete('/:id', protect, authorize('admin', 'canteen_owner'), deleteMenuItem);

module.exports = router;

