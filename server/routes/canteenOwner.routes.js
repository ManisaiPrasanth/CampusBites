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

// Create menu item for canteen owner
router.post('/menu', protect, authorize('canteen_owner'), async (req, res, next) => {
  try {
    const canteen = req.user.assignedCanteen;
    
    if (!canteen) {
      return res.status(400).json({
        success: false,
        message: 'No canteen assigned to this account'
      });
    }

    // Set canteen and addedBy automatically
    req.body.canteen = canteen;
    req.body.addedBy = req.user.id;
    req.body.isAvailable = req.body.available !== undefined ? req.body.available : true;

    const menuItem = await MenuItem.create(req.body);

    res.status(201).json({
      success: true,
      menuItem
    });
  } catch (error) {
    next(error);
  }
});

// Update menu item for canteen owner
router.put('/menu/:id', protect, authorize('canteen_owner'), async (req, res, next) => {
  try {
    const canteen = req.user.assignedCanteen;
    
    if (!canteen) {
      return res.status(400).json({
        success: false,
        message: 'No canteen assigned to this account'
      });
    }

    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Verify the menu item belongs to this canteen owner
    if (menuItem.canteen !== canteen) {
      return res.status(403).json({
        success: false,
        message: 'You can only update items from your assigned canteen'
      });
    }

    // Map available to isAvailable
    if (req.body.available !== undefined) {
      req.body.isAvailable = req.body.available;
      delete req.body.available;
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      menuItem: updatedItem
    });
  } catch (error) {
    next(error);
  }
});

// Delete menu item for canteen owner
router.delete('/menu/:id', protect, authorize('canteen_owner'), async (req, res, next) => {
  try {
    const canteen = req.user.assignedCanteen;
    
    if (!canteen) {
      return res.status(400).json({
        success: false,
        message: 'No canteen assigned to this account'
      });
    }

    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Verify the menu item belongs to this canteen owner
    if (menuItem.canteen !== canteen) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete items from your assigned canteen'
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
});

module.exports = router;
