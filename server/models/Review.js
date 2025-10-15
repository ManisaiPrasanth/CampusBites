const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    default: ''
  },
  
  images: [{
    type: String
  }],
  
  isVerifiedPurchase: {
    type: Boolean,
    default: true
  },
  
  helpfulCount: {
    type: Number,
    default: 0
  },
  
  reportCount: {
    type: Number,
    default: 0
  },
  
  isVisible: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

// One review per user per menu item
reviewSchema.index({ user: 1, menuItem: 1 }, { unique: true });
reviewSchema.index({ menuItem: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });

// Update menu item rating after review is saved
reviewSchema.post('save', async function() {
  const MenuItem = mongoose.model('MenuItem');
  
  const stats = await this.constructor.aggregate([
    { $match: { menuItem: this.menuItem, isVisible: true } },
    {
      $group: {
        _id: '$menuItem',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await MenuItem.findByIdAndUpdate(this.menuItem, {
      'rating.average': Math.round(stats[0].averageRating * 10) / 10,
      'rating.count': stats[0].reviewCount
    });
  }
});

// Update menu item rating after review is removed
reviewSchema.post('remove', async function() {
  const MenuItem = mongoose.model('MenuItem');
  
  const stats = await this.constructor.aggregate([
    { $match: { menuItem: this.menuItem, isVisible: true } },
    {
      $group: {
        _id: '$menuItem',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await MenuItem.findByIdAndUpdate(this.menuItem, {
      'rating.average': Math.round(stats[0].averageRating * 10) / 10,
      'rating.count': stats[0].reviewCount
    });
  } else {
    await MenuItem.findByIdAndUpdate(this.menuItem, {
      'rating.average': 0,
      'rating.count': 0
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);

