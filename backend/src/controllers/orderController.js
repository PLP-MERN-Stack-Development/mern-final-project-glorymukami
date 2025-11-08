const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { sendOrderConfirmation, sendPaymentConfirmation, sendOrderStatusUpdate } = require('../utils/emailService');

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Validate required fields
    if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.lastName || 
        !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || 
        !shippingAddress.zipCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete shipping address'
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Verify all products are still available and in stock
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: 'Some products in your cart are no longer available'
        });
      }

      const product = await Product.findById(item.product._id);
      
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.product.name}" is no longer available`
        });
      }

      if (product.inventory.trackQuantity && product.inventory.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for "${product.name}". Only ${product.inventory.stock} available`
        });
      }
    }

    // Create order items from cart items
    const orderItems = cart.items.map((item) => {
      return {
        product: item.product._id,
        name: item.product.name,
        image: item.product.featuredImage || '/images/default-product.jpg',
        price: item.product.price,
        quantity: item.quantity
      };
    });

    // Generate order number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      orderNumber: orderNumber,
      orderItems,
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country || 'United States',
        phone: shippingAddress.phone || ''
      },
      paymentMethod: paymentMethod || 'stripe',
      status: 'pending'
    });

    // Clear the cart after successful order creation
    cart.items = [];
    cart.totalPrice = 0;
    cart.totalItems = 0;
    await cart.save();

    // Populate the order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images');

    // Send order confirmation email
    try {
      await sendOrderConfirmation(req.user, populatedOrder);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('orderItems.product', 'name images')
      .sort('-createdAt');

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;

    // Update deliveredAt if status is delivered
    if (status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = Date.now();
      order.isDelivered = true;
    }

    // Update paidAt if status includes payment confirmation
    if (['confirmed', 'processing'].includes(status) && !order.paidAt) {
      order.paidAt = Date.now();
      order.isPaid = true;
    }

    await order.save();
    
    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images');

    // Send order status update email
    try {
      await sendOrderStatusUpdate(order.user, updatedOrder);
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const { paymentId, status, email } = req.body;

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: paymentId,
      status: status,
      update_time: Date.now(),
      email_address: email
    };
    order.status = 'confirmed';

    // Update product stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { 'inventory.stock': -item.quantity } }
      );
    }

    const updatedOrder = await order.save();
    
    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images');

    // Send payment confirmation email
    try {
      await sendPaymentConfirmation(order.user, populatedOrder, { id: paymentId, status });
    } catch (emailError) {
      console.error('Failed to send payment confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Order paid successfully',
      data: populatedOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Only allow cancellation for pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    order.status = 'cancelled';
    
    // Restore product stock if order was confirmed/paid
    if (order.isPaid) {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { 'inventory.stock': item.quantity } }
        );
      }
    }

    const updatedOrder = await order.save();
    
    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images');

    // Send cancellation email
    try {
      await sendOrderStatusUpdate(order.user, populatedOrder);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: populatedOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  getOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  updateOrderToPaid,
  cancelOrder
};