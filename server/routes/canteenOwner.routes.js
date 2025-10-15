const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// Get canteen owner dashboard stats
router.get('/dashboard', protect, authorize('canteen_owner'), async (req, res, next) => {
  try {
    const canteen = req.user.assignedCanteen;
    
    if (!canteen) {
      return res.status(400).json({
        success: false,
        message: 'No canteen assigned to this account'
      });
    }

    // Get menu items count for this canteen
    const menuItemsCount = await MenuItem.countDocuments({ canteen });

    // Get orders containing items from this canteen
    const allOrders = await Order.find()
      .populate('items.menuItem')
      .sort({ createdAt: -1 });

    const canteenOrders = allOrders.filter(order =>
      order.items.some(item => item.menuItem?.canteen === canteen)
    );

    // Calculate stats - ONLY for this restaurant's items
    const totalOrders = canteenOrders.length;
    const pendingOrders = canteenOrders.filter(o => o.status === 'pending').length;
    
    // Calculate revenue from ONLY this canteen's items (not full order totals)
    let totalRevenue = 0;
    canteenOrders.forEach(order => {
      if (order.status !== 'cancelled') {
        order.items.forEach(item => {
          if (item.menuItem?.canteen === canteen) {
            totalRevenue += item.subtotal;  // Only add this restaurant's items
          }
        });
      }
    });

    res.json({
      success: true,
      canteen,
      stats: {
        totalOrders,
        pendingOrders,
        totalRevenue,
        menuItemsCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get canteen owner's menu items
router.get('/menu', protect, authorize('canteen_owner'), async (req, res, next) => {
  try {
    const canteen = req.user.assignedCanteen;
    
    const menuItems = await MenuItem.find({ canteen })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      canteen,
      count: menuItems.length,
      menuItems
    });
  } catch (error) {
    next(error);
  }
});

// Get canteen owner's orders
router.get('/orders', protect, authorize('canteen_owner'), async (req, res, next) => {
  try {
    const canteen = req.user.assignedCanteen;
    
    // Get all orders and filter for ones containing canteen items
    const allOrders = await Order.find()
      .populate('user', 'fullName email phoneNumber')
      .populate('items.menuItem')
      .sort({ createdAt: -1 });

    const canteenOrders = allOrders.filter(order =>
      order.items.some(item => item.menuItem?.canteen === canteen)
    );

    res.json({
      success: true,
      canteen,
      count: canteenOrders.length,
      orders: canteenOrders
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
