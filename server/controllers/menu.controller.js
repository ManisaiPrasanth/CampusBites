const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
exports.getAllMenuItems = async (req, res, next) => {
  try {
    const { 
      canteen, 
      category, 
      isAvailable, 
      isVegetarian,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 50
    } = req.query;

    // Build query
    const query = {};
    
    if (canteen) query.canteen = canteen;
    if (category) query.category = category;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    if (isVegetarian !== undefined) query.isVegetarian = isVegetarian === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sorting
    let sortBy = {};
    if (sort) {
      const sortFields = sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sortBy[field.substring(1)] = -1;
        } else {
          sortBy[field] = 1;
        }
      });
    } else {
      sortBy = { createdAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const menuItems = await MenuItem.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('addedBy', 'fullName');

    // Get total count
    const total = await MenuItem.countDocuments(query);

    res.status(200).json({
      success: true,
      count: menuItems.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      menuItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
exports.getMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('addedBy', 'fullName')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'fullName' }
      });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Private/Admin
exports.createMenuItem = async (req, res, next) => {
  try {
    req.body.addedBy = req.user.id;

    const menuItem = await MenuItem.create(req.body);

    res.status(201).json({
      success: true,
      menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
exports.updateMenuItem = async (req, res, next) => {
  try {
    let menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    await menuItem.remove();

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get menu items by canteen
// @route   GET /api/menu/canteen/:canteen
// @access  Public
exports.getMenuByCanteen = async (req, res, next) => {
  try {
    const menuItems = await MenuItem.find({ 
      canteen: req.params.canteen,
      isAvailable: true
    }).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      canteen: req.params.canteen,
      menuItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get menu items by category
// @route   GET /api/menu/category/:category
// @access  Public
exports.getMenuByCategory = async (req, res, next) => {
  try {
    const menuItems = await MenuItem.find({ 
      category: req.params.category,
      isAvailable: true
    }).sort({ canteen: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      category: req.params.category,
      menuItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search menu items
// @route   GET /api/menu/search
// @access  Public
exports.searchMenu = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Please provide search query'
      });
    }

    const menuItems = await MenuItem.find({
      $text: { $search: q },
      isAvailable: true
    }).sort({ score: { $meta: 'textScore' } });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      query: q,
      menuItems
    });
  } catch (error) {
    next(error);
  }
};

