require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectDatabase = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDatabase();

// Security Middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/menu', require('./routes/menu.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/canteen-owner', require('./routes/canteenOwner.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Debug endpoint to test credentials
app.post('/api/debug/test-login', async (req, res) => {
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  
  try {
    const { email, password } = req.body;
    console.log('🔍 Debug test-login:', email, 'Password length:', password?.length);
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.json({ found: false, message: 'User not found' });
    }
    
    const match = await bcrypt.compare(password, user.password);
    
    res.json({
      found: true,
      email: user.email,
      role: user.role,
      passwordMatch: match,
      receivedPassword: password,
      passwordLength: password.length,
      hashedPassword: user.password.substring(0, 20) + '...',
      loginAttempts: user.loginAttempts,
      isLocked: user.isLocked(),
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CampusBites API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      menu: '/api/menu',
      orders: '/api/orders',
      reviews: '/api/reviews',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🍽️  CampusBites API Server                             ║
║                                                           ║
║   📍 Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   🚀 Server running on port: ${PORT}                          ║
║   📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'}                        ║
║                                                           ║
║   📡 API Endpoints:                                       ║
║      → http://localhost:${PORT}/api/auth               ║
║      → http://localhost:${PORT}/api/menu               ║
║      → http://localhost:${PORT}/api/orders             ║
║      → http://localhost:${PORT}/api/reviews            ║
║                                                           ║
║   💚 Health Check: http://localhost:${PORT}/health      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

module.exports = app;

