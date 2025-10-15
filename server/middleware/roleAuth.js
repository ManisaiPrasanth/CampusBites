/**
 * Role-Based Access Control Middleware
 * Protect routes based on user roles
 */

// Middleware to check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Middleware to check if user is canteen owner
const isCanteenOwner = (req, res, next) => {
  if (!req.user || req.user.role !== 'canteen_owner') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Canteen owner privileges required.'
    });
  }
  next();
};

// Middleware to check if user is admin or canteen owner
const isAdminOrCanteenOwner = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'canteen_owner')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or canteen owner privileges required.'
    });
  }
  next();
};

// Middleware to check if canteen owner owns the specific canteen
const ownsCanteen = (canteenParam = 'canteen') => {
  return (req, res, next) => {
    // Admins can access all canteens
    if (req.user.role === 'admin') {
      return next();
    }

    // Canteen owners can only access their assigned canteen
    if (req.user.role === 'canteen_owner') {
      const requestedCanteen = req.params[canteenParam] || req.body[canteenParam] || req.query[canteenParam];
      
      if (!req.user.assignedCanteen) {
        return res.status(403).json({
          success: false,
          message: 'No canteen assigned to your account'
        });
      }

      if (requestedCanteen && requestedCanteen !== req.user.assignedCanteen) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only manage your assigned canteen.'
        });
      }

      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  };
};

module.exports = {
  authorize,
  isAdmin,
  isCanteenOwner,
  isAdminOrCanteenOwner,
  ownsCanteen
};

