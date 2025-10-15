/**
 * Admin Controller
 * Admin-specific operations
 */

const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create canteen owner account
// @route   POST /api/admin/canteen-owners
// @access  Private (Admin)
exports.createCanteenOwner = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber, assignedCanteen } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !phoneNumber || !assignedCanteen) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Check if canteen exists
    const canteenExists = await MenuItem.findOne({ canteen: assignedCanteen });
    if (!canteenExists) {
      return res.status(400).json({
        success: false,
        message: 'Canteen not found. Please create menu items for this canteen first.'
      });
    }

    // Create canteen owner
    const user = await User.create({
      fullName,
      email,
      password,
      phoneNumber,
      role: 'canteen_owner',
      assignedCanteen
    });

    res.status(201).json({
      success: true,
      message: 'Canteen owner created successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        assignedCanteen: user.assignedCanteen
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all canteen owners
// @route   GET /api/admin/canteen-owners
// @access  Private (Admin)
exports.getAllCanteenOwners = async (req, res, next) => {
  try {
    const canteenOwners = await User.find({ role: 'canteen_owner' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: canteenOwners.length,
      canteenOwners
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update canteen owner
// @route   PUT /api/admin/canteen-owners/:id
// @access  Private (Admin)
exports.updateCanteenOwner = async (req, res, next) => {
  try {
    const { fullName, phoneNumber, assignedCanteen, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'canteen_owner') {
      return res.status(404).json({
        success: false,
        message: 'Canteen owner not found'
      });
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (assignedCanteen) {
      // Verify canteen exists
      const canteenExists = await MenuItem.findOne({ canteen: assignedCanteen });
      if (!canteenExists) {
        return res.status(400).json({
          success: false,
          message: 'Canteen not found'
        });
      }
      updateData.assignedCanteen = assignedCanteen;
    }
    if (typeof isActive !== 'undefined') updateData.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete canteen owner
// @route   DELETE /api/admin/canteen-owners/:id
// @access  Private (Admin)
exports.deleteCanteenOwner = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'canteen_owner') {
      return res.status(404).json({
        success: false,
        message: 'Canteen owner not found'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Canteen owner deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available canteens
// @route   GET /api/admin/canteens
// @access  Private (Admin)
exports.getAllCanteens = async (req, res, next) => {
  try {
    // Get unique canteen names from menu items
    const canteens = await MenuItem.distinct('canteen');

    // Get stats for each canteen
    const canteenStats = await Promise.all(
      canteens.map(async (canteen) => {
        const menuItemCount = await MenuItem.countDocuments({ canteen });
        const owner = await User.findOne({ role: 'canteen_owner', assignedCanteen: canteen });

        return {
          name: canteen,
          menuItemCount,
          hasOwner: !!owner,
          owner: owner ? {
            id: owner._id,
            fullName: owner.fullName,
            email: owner.email
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      count: canteens.length,
      canteens: canteenStats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;

