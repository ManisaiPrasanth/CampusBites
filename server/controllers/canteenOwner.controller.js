/**
 * Canteen Owner Controller
 * Handles canteen-specific operations for canteen owners
 */

const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get canteen owner dashboard stats
// @route   GET /api/canteen-owner/dashboard
// @access  Private (Canteen Owner)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const canteen = req.user.assignedCanteen;

    if (!canteen) {
      return res.status(400).json({
        success: false,
        message: 'No canteen assigned to your account'
      });
    }

    // Get menu items count
    const totalMenuItems = await MenuItem.countDocuments({ canteen });
    const availableItems = await MenuItem.countDocuments({ canteen, available: true });

    // Get orders for this canteen
    const orders = await Order.find({
      'items.menuItem': { 
        $in: await MenuItem.find({ canteen }).distinct('_id')
      }
    });

    // Calculate statistics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;

    // Calculate revenue (only from delivered orders)
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today).length;

    res.status(200).json({
      success: true,
      stats: {
        canteen,
        totalMenuItems,
        availableItems,
        totalOrders,
        pendingOrders,
        completedOrders,
        todayOrders,
        totalRevenue: totalRevenue.toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get menu items for canteen owner's canteen
// @route   GET /api/canteen-owner/menu
// @access  Private (Canteen Owner)
exports.getMyMenuItems = async (req, res, next) => {
  try {
    const canteen = req.user.assignedCanteen;

    if (!canteen) {
      return res.status(400).json({
        success: false,
        message: 'No canteen assigned to your account'
      });
    }

    const menuItems = await MenuItem.find({ canteen }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      canteen,
      menuItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create menu item for canteen owner's canteen
// @route   POST /api/canteen-owner/menu
// @access  Private (Canteen Owner)
exports.createMenuItem = async (req, res, next) => {
  try {
    const canteen = req.user.assignedCanteen;

    if (!canteen) {
      return res.status(400).json({
        success: false,
        message: 'No canteen assigned to your account'
      });
    }

    // Force the canteen to be the owner's assigned canteen
    req.body.canteen = canteen;

    const menuItem = await MenuItem.create(req.body);

    res.status(201).json({
      success: true,
      menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item for canteen owner's canteen
// @route   PUT /api/canteen-owner/menu/:id
// @access  Private (Canteen Owner)
exports.updateMenuItem = async (req, res, next) => {
  try {
    const canteen = req.user.assignedCanteen;

    // Find item and verify it belongs to this canteen
    let menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    if (menuItem.canteen !== canteen) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    // Prevent changing canteen
    delete req.body.canteen;

    menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item for canteen owner's canteen
// @route   DELETE /api/canteen-owner/menu/:id
// @access  Private (Canteen Owner)
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const canteen = req.user.assignedCanteen;

    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    if (menuItem.canteen !== canteen) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }

    await menuItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders for canteen owner's canteen
// @route   GET /api/canteen-owner/orders
// @access  Private (Canteen Owner)
exports.getMyOrders = async (req, res, next) => {
  try {
    const canteen = req.user.assignedCanteen;

    if (!canteen) {
      return res.status(400).json({
        success: false,
        message: 'No canteen assigned to your account'
      });
    }

    // Get all menu item IDs for this canteen
    const menuItemIds = await MenuItem.find({ canteen }).distinct('_id');

    // Find orders that contain items from this canteen
    const orders = await Order.find({
      'items.menuItem': { $in: menuItemIds }
    })
      .populate('user', 'fullName email phoneNumber')
      .populate('items.menuItem', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      canteen,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/canteen-owner/orders/:id/status
// @access  Private (Canteen Owner)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const canteen = req.user.assignedCanteen;

    // Find order
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order contains items from this canteen
    const menuItemIds = await MenuItem.find({ canteen }).distinct('_id');
    const hasCanteenItems = order.items.some(item =>
      menuItemIds.some(id => id.equals(item.menuItem))
    );

    if (!hasCanteenItems) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Update status
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status} by ${req.user.fullName}`
    });

    await order.save();

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;

