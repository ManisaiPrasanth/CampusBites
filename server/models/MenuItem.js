const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide item name'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  
  price: {
    type: Number,
    required: [true, 'Please provide item price'],
    min: [0, 'Price cannot be negative']
  },
  
  category: {
    type: String,
    required: [true, 'Please provide item category'],
    enum: [
      'Main Course',
      'Snacks',
      'Beverages',
      'Desserts',
      'Street Food',
      'Bread',
      'Side Dish',
      'Breakfast',
      'Lunch',
      'Dinner'
    ]
  },
  
  canteen: {
    type: String,
    required: [true, 'Please specify the canteen'],
    enum: [
      'Anandam cool down shop',
      'Healthy Hotel',
      'Madurai lee corner',
      'Mercely\'s ice cream',
      'Kunafa street',
      'Aasife',
      'Raja resturant',
      'Mr soda',
      'Namus cake shop',
      'Velamal',
      'Kerala cafe',
      'Namma ooru Jigarthanda',
      'Sai fast food',
      'The essence',
      'Hill view kerala mess',
      'Godavari ruchulu',
      'Vasu\'s cafe',
      'Nalabagam canteen'
    ]
  },
  
  image: {
    type: String,
    default: 'assets/images/default-food.jpg'
  },
  
  calories: {
    type: String,
    default: 'N/A'
  },
  
  isVegetarian: {
    type: Boolean,
    default: true
  },
  
  isVegan: {
    type: Boolean,
    default: false
  },
  
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  preparationTime: {
    type: Number,  // in minutes
    default: 15
  },
  
  ingredients: [{
    type: String
  }],
  
  allergens: [{
    type: String,
    enum: ['Nuts', 'Dairy', 'Eggs', 'Soy', 'Gluten', 'Shellfish', 'None']
  }],
  
  spiceLevel: {
    type: String,
    enum: ['None', 'Mild', 'Medium', 'Hot', 'Very Hot'],
    default: 'None'
  },
  
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  soldCount: {
    type: Number,
    default: 0
  },
  
  discount: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    validUntil: Date
  },
  
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discounted price
menuItemSchema.virtual('discountedPrice').get(function() {
  if (this.discount.percentage > 0 && 
      (!this.discount.validUntil || this.discount.validUntil > Date.now())) {
    return this.price - (this.price * this.discount.percentage / 100);
  }
  return this.price;
});

// Virtual for reviews
menuItemSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'menuItem',
  justOne: false
});

// Indexes for efficient queries
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ canteen: 1, category: 1 });
menuItemSchema.index({ isAvailable: 1 });
menuItemSchema.index({ price: 1 });
menuItemSchema.index({ 'rating.average': -1 });
menuItemSchema.index({ soldCount: -1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);

