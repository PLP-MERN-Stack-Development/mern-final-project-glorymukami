const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: true
  },
  stripePaymentIntentId: {
    type: String,
    required: true
  },
  stripeSessionId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: true,
    default: 'usd'
  },
  status: {
    type: String,
    required: true,
    enum: [
      'pending',
      'processing',
      'succeeded',
      'failed',
      'canceled',
      'refunded'
    ],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank_transfer'],
    default: 'card'
  },
  paymentMethodDetails: {
    type: Map,
    of: String
  },
  refunds: [{
    amount: Number,
    reason: String,
    stripeRefundId: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for better query performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ stripeSessionId: 1 });
paymentSchema.index({ order: 1 });

// Static method to find payment by Stripe session ID
paymentSchema.statics.findBySessionId = function(sessionId) {
  return this.findOne({ stripeSessionId: sessionId })
    .populate('user', 'name email')
    .populate('order');
};

// Static method to find payment by Stripe payment intent ID
paymentSchema.statics.findByPaymentIntentId = function(paymentIntentId) {
  return this.findOne({ stripePaymentIntentId: paymentIntentId })
    .populate('user', 'name email')
    .populate('order');
};

module.exports = mongoose.model('Payment', paymentSchema);