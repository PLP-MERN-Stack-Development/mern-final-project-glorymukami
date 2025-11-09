// Add this line - it loads environment variables
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

// @desc    Create Stripe payment session
// @route   POST /api/payments/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Get the order
    const order = await Order.findById(orderId).populate('orderItems.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this order'
      });
    }

    // Check if order is already paid
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    // Create line items for Stripe
    const lineItems = order.orderItems.map(item => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: [item.image],
            metadata: {
              productId: item.product._id.toString()
            }
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Add shipping as a line item if applicable
    if (order.shippingPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping Fee',
          },
          unit_amount: Math.round(order.shippingPrice * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as a line item if applicable
    if (order.taxPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Sales Tax',
          },
          unit_amount: Math.round(order.taxPrice * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: ${process.env.CLIENT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId},
      cancel_url: ${process.env.CLIENT_CANCEL_URL}?order_id=${orderId},
      customer_email: req.user.email,
      client_reference_id: orderId,
      metadata: {
        orderId: orderId.toString(),
        userId: req.user.id.toString()
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'], // Add more as needed
      },
      custom_text: {
        shipping_address: {
          message: 'Please note that we currently only ship to the United States, Canada, United Kingdom, and Australia.',
        },
      },
    });

    res.json({
      success: true,
      message: 'Checkout session created successfully',
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Handle Stripe webhook for payment confirmation
// @route   POST /api/payments/webhook
// @access  Public (Stripe calls this)
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(Webhook Error: ${err.message});
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      await fulfillOrder(session);
    } catch (error) {
      console.error('Order fulfillment error:', error);
      return res.status(400).json({
        success: false,
        message: 'Webhook handler failed'
      });
    }
  }

  res.json({ received: true });
};

// @desc    Fulfill order after successful payment
// @route   - (Internal function)
const fulfillOrder = async (session) => {
  const orderId = session.metadata.orderId;
  const userId = session.metadata.userId;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error(Order ${orderId} not found);
    }

    // Update order with payment details
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'confirmed';
    order.paymentResult = {
      id: session.payment_intent,
      status: session.payment_status,
      update_time: new Date().toISOString(),
      email_address: session.customer_details.email
    };

    // Update shipping address from Stripe if provided
    if (session.shipping_details) {
      order.shippingAddress = {
        ...order.shippingAddress,
        address: session.shipping_details.address.line1,
        city: session.shipping_details.address.city,
        state: session.shipping_details.address.state,
        zipCode: session.shipping_details.address.postal_code,
        country: session.shipping_details.address.country
      };
    }

    // Update product stock
    for (const item of order.orderItems) {
      await require('../models/Product').findByIdAndUpdate(
        item.product,
        { $inc: { 'inventory.stock': -item.quantity } }
      );
    }

    await order.save();
    console.log(✅ Order ${orderId} fulfilled successfully);

  } catch (error) {
    console.error('Error fulfilling order:', error);
    throw error;
  }
};

// @desc    Verify payment status
// @route   GET /api/payments/verify/:orderId
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: {
        isPaid: order.isPaid,
        status: order.status,
        paidAt: order.paidAt
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  verifyPayment
};