// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('express-async-errors');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// Security middleware
app.use(helmet());

// DISABLE RATE LIMITING FOR DEVELOPMENT - Comment this out
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 1000, // limit each IP to 1000 requests per windowMs
//   message: {
//     success: false,
//     error: 'Too many requests from this IP, please try again later.'
//   }
// });
// app.use('/api/', limiter);

// NUCLEAR CORS FIX - Allow everything
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  console.log('🔧 CORS Headers Set for:', req.method, req.url);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🛬 Preflight request handled');
    return res.status(200).end();
  }
  
  next();
});

// Special handling for webhook - must come before express.json()
app.post('/api/payments/webhook', express.raw({type: 'application/json'}), (req, res, next) => {
  require('./controllers/paymentController').handleWebhook(req, res, next);
});

// Body parser middleware for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// CORS test route
app.get('/api/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working correctly! 🎉',
    yourOrigin: req.headers.origin || 'No origin header',
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: '🛍️ ShopSphere API is running successfully!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    version: '1.0.0'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to ShopSphere E-commerce API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me',
        updateDetails: 'PUT /api/auth/updatedetails',
        updatePassword: 'PUT /api/auth/updatepassword'
      },
      products: {
        getAll: 'GET /api/products',
        getSingle: 'GET /api/products/:id',
        create: 'POST /api/products (Protected)',
        update: 'PUT /api/products/:id (Protected)',
        delete: 'DELETE /api/products/:id (Protected)',
        vendorProducts: 'GET /api/products/vendor/my-products (Protected)',
        addReview: 'POST /api/products/:id/reviews (Protected)'
      },
      cart: {
        getCart: 'GET /api/cart (Protected)',
        addItem: 'POST /api/cart/items (Protected)',
        updateItem: 'PUT /api/cart/items/:itemId (Protected)',
        removeItem: 'DELETE /api/cart/items/:itemId (Protected)',
        clearCart: 'DELETE /api/cart (Protected)'
      },
      orders: {
        create: 'POST /api/orders (Protected)',
        getMyOrders: 'GET /api/orders/my-orders (Protected)',
        getOrder: 'GET /api/orders/:id (Protected)',
        updateToPaid: 'PUT /api/orders/:id/pay (Protected)',
        cancel: 'PUT /api/orders/:id/cancel (Protected)',
        getAll: 'GET /api/orders (Admin Only)',
        updateStatus: 'PUT /api/orders/:id/status (Admin Only)'
      },
      payments: {
        createSession: 'POST /api/payments/create-checkout-session (Protected)',
        verify: 'GET /api/payments/verify/:orderId (Protected)',
        webhook: 'POST /api/payments/webhook (Stripe)'
      },
      admin: {
        dashboard: 'GET /api/admin/dashboard (Admin Only)',
        users: 'GET /api/admin/users (Admin Only)',
        updateRole: 'PUT /api/admin/users/:id/role (Admin Only)',
        salesReport: 'GET /api/admin/sales-report (Admin Only)'
      }
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    console.log('🔧 Attempting MongoDB connection...');
    console.log('📋 MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
    
    // TEMPORARY: Log the connection string (hide password in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔗 Connection string:', process.env.MONGODB_URI);
    } else {
      console.log('🔗 Connection string: [HIDDEN IN PRODUCTION]');
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🎯 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔍 Error name:', error.name);
    console.error('🔍 Error code:', error.code);
    
    // More specific error handling
    if (error.name === 'MongoParseError') {
      console.error('🔌 Connection string format error - check MONGODB_URI');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('🌐 Server selection error - check network access and credentials');
    } else if (error.name === 'MongoNetworkError') {
      console.error('🔌 Network error - check your internet connection and MongoDB Atlas IP whitelist');
    }
    
    process.exit(1);
  }
};

module.exports = { app, connectDB };