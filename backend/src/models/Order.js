const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'United States' },
    phone: { type: String }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'paypal', 'cash_on_delivery'],
    default: 'stripe'
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    ],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Generate order number before saving - FIXED VERSION
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Calculate totals before saving - FIXED VERSION
orderSchema.pre('save', function(next) {
  // Only calculate if orderItems exist and are modified
  if (this.orderItems && this.orderItems.length > 0 && this.isModified('orderItems')) {
    this.itemsPrice = this.orderItems.reduce(
      (acc, item) => acc + (item.price * item.quantity), 0
    );
    
    // Simple tax calculation (10%)
    this.taxPrice = Number((this.itemsPrice * 0.1).toFixed(2));
    
    // Simple shipping calculation - free shipping over $100
    this.shippingPrice = this.itemsPrice > 100 ? 0 : 10;
    
    this.totalPrice = Number(
      (this.itemsPrice + this.taxPrice + this.shippingPrice).toFixed(2)
    );
  }
  next();
});

// Update product sales count after order is paid
orderSchema.post('save', async function(doc) {
  if (doc.isPaid) {
    const previousDoc = await this.constructor.findById(doc._id);
    if (previousDoc && !previousDoc.isPaid) {
      for (const item of doc.orderItems) {
        await mongoose.model('Product').findByIdAndUpdate(
          item.product,
          { $inc: { salesCount: item.quantity } }
        );
      }
    }
  }
});

module.exports = mongoose.model('Order', orderSchema);