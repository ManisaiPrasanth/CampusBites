const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { sendOrderStatusEmail } = require('../services/emailService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { items, deliveryType, tableNumber, specialInstructions } = req.body;

    // Validate and calculate totals
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item ${item.menuItem} not found`
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently unavailable`
        });
      }

      const subtotal = menuItem.discountedPrice * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.discountedPrice,
        quantity: item.quantity,
        subtotal,
        canteen: menuItem.canteen,  // Add canteen for multi-restaurant support
        status: 'pending'  // Each item has its own status
      });

      // Update sold count
      menuItem.soldCount += item.quantity;
      await menuItem.save();
    }

    // Calculate estimated ready time (average of all items' prep times + 5 min buffer)
    const prepTimes = await MenuItem.find({
      _id: { $in: items.map(i => i.menuItem) }
    }).select('preparationTime');
    
    const avgPrepTime = prepTimes.reduce((sum, item) => sum + item.preparationTime, 0) / prepTimes.length;
    const estimatedReadyTime = new Date(Date.now() + (avgPrepTime + 5) * 60000);

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      deliveryType,
      tableNumber,
      specialInstructions,
      estimatedReadyTime,
      statusHistory: [{
        status: 'pending',
        timestamp: new Date()
      }]
    });

    // Populate order details
    await order.populate('user', 'fullName email phoneNumber');
    await order.populate('items.menuItem');

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user.id };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.menuItem');

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'fullName email phoneNumber')
      .populate('items.menuItem');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user is order owner or admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const { 
      status, 
      paymentStatus,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'fullName email phoneNumber')
      .populate('items.menuItem');

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status
    order.status = status;
    
    if (note) {
      order.statusHistory[order.statusHistory.length - 1].note = note;
    }

    await order.save();

    await order.populate('user', 'fullName email phoneNumber');
    await order.populate('items.menuItem');

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item status for a specific restaurant
// @route   PUT /api/orders/:id/items/status
// @access  Private/Admin/CanteenOwner
exports.updateItemStatus = async (req, res, next) => {
  try {
    const { canteen, status } = req.body;

    if (!canteen || !status) {
      return res.status(400).json({
        success: false,
        message: 'Canteen and status are required'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status for items belonging to this canteen only
    let itemsUpdated = 0;
    order.items.forEach(item => {
      if (item.canteen === canteen) {
        item.status = status;
        item.statusUpdatedAt = new Date();
        itemsUpdated++;
      }
    });

    if (itemsUpdated === 0) {
      return res.status(404).json({
        success: false,
        message: 'No items found for this canteen in this order'
      });
    }

    // Calculate overall order status based on item statuses
    const itemStatuses = order.items.map(item => item.status);
    const allCompleted = itemStatuses.every(s => s === 'completed' || s === 'cancelled');
    const allCancelled = itemStatuses.every(s => s === 'cancelled');
    const anyPreparing = itemStatuses.some(s => s === 'preparing');
    const allReady = itemStatuses.every(s => s === 'ready' || s === 'completed' || s === 'cancelled');
    
    if (allCancelled) {
      order.status = 'cancelled';
    } else if (allCompleted) {
      order.status = 'completed';
    } else if (allReady) {
      order.status = 'ready';
    } else if (anyPreparing) {
      order.status = 'preparing';
    }

    await order.save();

    await order.populate('user', 'fullName email phoneNumber');
    await order.populate('items.menuItem');

    // Send status update email (non-blocking)
    sendOrderStatusEmail(order, status, canteen).catch(err => {
      console.error('Failed to send order status email:', err.message);
    });

    res.status(200).json({
      success: true,
      message: `Updated status for ${itemsUpdated} item(s) from ${canteen}`,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user is order owner
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel if order is pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    order.status = 'cancelled';
    order.cancellationReason = req.body.reason || 'Cancelled by user';
    await order.save();

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats/dashboard
// @access  Private/Admin
exports.getOrderStats = async (req, res, next) => {
  try {
    const { startDate, endDate, canteen } = req.query;
    
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // If canteen filter, calculate restaurant-specific stats
    if (canteen) {
      // Get all orders and populate items
      const allOrders = await Order.find({...dateQuery, status: { $ne: 'cancelled' }})
        .populate('items.menuItem');

      // Filter orders containing items from this canteen
      const canteenOrders = allOrders.filter(order =>
        order.items.some(item => item.menuItem?.canteen === canteen)
      );

      // Calculate revenue from ONLY this canteen's items
      let totalRevenue = 0;
      canteenOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.menuItem?.canteen === canteen) {
            totalRevenue += item.subtotal;
          }
        });
      });

      // Count orders containing this canteen's items
      const totalOrders = canteenOrders.length;

      // Orders by status (only orders with canteen items)
      const statusCounts = {};
      canteenOrders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });
      const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        _id: status,
        count
      }));

      // Average order value (for this canteen's portion)
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Popular items from this canteen only
      const itemStats = {};
      canteenOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.menuItem?.canteen === canteen) {
            const id = item.menuItem._id.toString();
            if (!itemStats[id]) {
              itemStats[id] = {
                _id: id,
                name: item.name,
                totalOrders: 0,
                totalQuantity: 0,
                totalRevenue: 0
              };
            }
            itemStats[id].totalOrders += 1;
            itemStats[id].totalQuantity += item.quantity;
            itemStats[id].totalRevenue += item.subtotal;
          }
        });
      });

      const popularItems = Object.values(itemStats)
        .sort((a, b) => b.totalOrders - a.totalOrders)
        .slice(0, 10);

      return res.status(200).json({
        success: true,
        stats: {
          totalOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          ordersByStatus,
          popularItems,
          canteen  // Include canteen name in response
        }
      });
    }

    // Super admin (no canteen filter) - calculate for ALL restaurants
    const totalOrders = await Order.countDocuments(dateQuery);
    const totalRevenue = await Order.aggregate([
      { $match: { ...dateQuery, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Orders by payment status
    const ordersByPaymentStatus = await Order.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]);

    // Average order value
    const avgOrderValue = totalRevenue[0]?.total / totalOrders || 0;

    // Popular items
    const popularItems = await Order.aggregate([
      { $match: { ...dateQuery, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { 
        $group: {
          _id: '$items.menuItem',
          name: { $first: '$items.name' },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        ordersByStatus,
        ordersByPaymentStatus,
        popularItems
      }
    });
  } catch (error) {
    next(error);
  }
};

