/**
 * Admin Routes
 * Admin-specific operations
 */

const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createCanteenOwner,
  getAllCanteenOwners,
  updateCanteenOwner,
  deleteCanteenOwner,
  getAllCanteens
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleAuth');

// All routes require authentication and admin role
router.use(protect, isAdmin);

// User management
router.get('/users', getAllUsers);

// Canteen owner management
router.route('/canteen-owners')
  .get(getAllCanteenOwners)
  .post(createCanteenOwner);

router.route('/canteen-owners/:id')
  .put(updateCanteenOwner)
  .delete(deleteCanteenOwner);

// Canteen management
router.get('/canteens', getAllCanteens);

module.exports = router;

