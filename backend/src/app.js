const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('express-async-errors');
require('dotenv').config();

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration - UPDATED & FIXED
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://your-shopsphere-app.vercel.app', // Your future frontend URL
  process.env.CLIENT_URL // From environment variable
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      console.log('🚫 CORS Blocked:', origin);
      return callback(new Error(msg), false);
    }
    
    console.log('✅ CORS Allowed:', origin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Handle preflight requests explicitly
app.options('*', cors());

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

// CORS test route - ADD THIS
app.get('/api/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working correctly! 🎉',
    allowedOrigins: allowedOrigins,
    yourOrigin: req.headers.origin || 'No origin header',
    timestamp: new Date().toISOString()
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
    
    if (error.name === 'MongoNetworkError') {
      console.error('🔌 Network error - check your internet connection and MongoDB Atlas IP whitelist');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('🌐 Server selection error - check your connection string and cluster status');
    }
    
    process.exit(1);
  }
};

module.exports = { app, connectDB };