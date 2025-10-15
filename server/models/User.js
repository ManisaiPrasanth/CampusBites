const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@klu\.ac\.in$/,
      'Only KLU college email addresses (@klu.ac.in) are allowed for registration'
    ],
    validate: {
      validator: function(email) {
        return email.toLowerCase().endsWith('@klu.ac.in');
      },
      message: 'Email must be a valid KLU college email address ending with @klu.ac.in'
    },
    index: true
  },
  
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not using Google OAuth
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false  // Don't return password by default
  },

  // Google OAuth fields
  googleId: {
    type: String,
    sparse: true, // Allows multiple documents with null googleId
    unique: true
  },
  
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  
  phoneNumber: {
    type: String,
    required: function() {
      return this.provider === 'local'; // Phone required only for local users
    },
    match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
  },
  
  role: {
    type: String,
    enum: ['user', 'admin', 'canteen_owner'],
    default: 'user'
  },
  
  // For canteen owners - reference to their canteen
  assignedCanteen: {
    type: String,
    default: null,
    // This will be the canteen name from MenuItem schema
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  profileImage: {
    type: String,
    default: null
  },
  
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  
  preferences: {
    dietaryRestrictions: [String],
    favoriteItems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    }]
  },
  
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  lastLogin: {
    type: Date,
    default: null
  },
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: Date

}, {
  timestamps: true,  // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's orders
userSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'user',
  justOne: false
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Check if user account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 }
  });
};

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);

