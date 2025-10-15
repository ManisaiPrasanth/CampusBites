const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const { sendWelcomeEmail } = require('../services/emailService');

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateAuthToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        isEmailVerified: user.isEmailVerified,
        assignedCanteen: user.assignedCanteen
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber, role, assignedCanteen } = req.body;

    // Validate college email domain
    if (!email.toLowerCase().endsWith('@klu.ac.in')) {
      return res.status(400).json({
        success: false,
        message: 'Only KLU college email addresses (@klu.ac.in) are allowed for registration'
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

    // Validate role (if provided)
    const validRoles = ['user', 'admin', 'canteen_owner'];
    const userRole = role && validRoles.includes(role) ? role : 'user';

    // Validate canteen assignment for canteen owners
    if (userRole === 'canteen_owner' && !assignedCanteen) {
      return res.status(400).json({
        success: false,
        message: 'Canteen assignment required for canteen owners'
      });
    }

    // Create user data
    const userData = {
      fullName,
      email,
      password,
      phoneNumber,
      role: userRole
    };

    // Add assigned canteen if role is canteen_owner
    if (userRole === 'canteen_owner') {
      userData.assignedCanteen = assignedCanteen;
    }

    // Create user
    const user = await User.create(userData);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user).catch(err => {
      console.error('Failed to send welcome email:', err.message);
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    // Find user (include password field)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ User found. Role:', user.role, 'Active:', user.isActive, 'Login Attempts:', user.loginAttempts);

    // Check if account is locked
    if (user.isLocked()) {
      console.log('🔒 Account is locked');
      return res.status(423).json({
        success: false,
        message: 'Account is locked due to too many failed login attempts. Try again later.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ Account is not active');
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Verify password
    console.log('🔑 Verifying password...');
    const isPasswordCorrect = await user.comparePassword(password);
    console.log('🔑 Password match result:', isPasswordCorrect);

    if (!isPasswordCorrect) {
      // Increment failed login attempts
      await user.incLoginAttempts();
      console.log('❌ Password incorrect. Login attempts incremented.');
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ Login successful!');
    
    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('🔥 Login error:', error);
    next(error);
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Public
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      fullName: req.body.fullName,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      preferences: req.body.preferences
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isPasswordCorrect = await user.comparePassword(req.body.currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth authentication
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    // Verify Google token
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture } = payload;

      // Check if user already exists
      let user = await User.findOne({ 
        $or: [
          { googleId },
          { email }
        ]
      });

      if (user) {
        // Update existing user with Google info if needed
        if (!user.googleId) {
          user.googleId = googleId;
          user.provider = 'google';
          user.isEmailVerified = true;
          await user.save();
        }
      } else {
        // Validate college email domain for Google users too
        if (!email.toLowerCase().endsWith('@klu.ac.in')) {
          return res.status(400).json({
            success: false,
            message: 'Only KLU college email addresses (@klu.ac.in) are allowed for registration'
          });
        }

        // Create new user
        user = await User.create({
          fullName: name,
          email,
          googleId,
          provider: 'google',
          isEmailVerified: true,
          role: 'user' // Default role for Google users
        });

        // Send welcome email to new Google user (non-blocking)
        sendWelcomeEmail(user).catch(err => {
          console.error('Failed to send welcome email:', err.message);
        });
      }

      console.log(`🔐 Google OAuth login successful for: ${email}`);
      sendTokenResponse(user, 200, res);
      
    } catch (googleError) {
      console.error('Google token verification failed:', googleError);
      return res.status(400).json({
        success: false,
        message: 'Invalid Google credential'
      });
    }

  } catch (error) {
    console.error('Google auth error:', error);
    next(error);
  }
};

