const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviewsByMenuItem,
  getMyReviews,
  updateReview,
  deleteReview
} = require('../controllers/review.controller');
const { protect } = require('../middleware/auth');
const { reviewValidation, validate } = require('../middleware/validation');

// Public routes
router.get('/item/:menuItemId', getReviewsByMenuItem);

// Protected routes
router.post('/', protect, reviewValidation, validate, createReview);
router.get('/my-reviews', protect, getMyReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;

