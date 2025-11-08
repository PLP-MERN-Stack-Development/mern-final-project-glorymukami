const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const cart = await Cart.getUserCart(req.user.id);
    
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists and is active
    const product = await Product.findOne({ 
      _id: productId, 
      isActive: true 
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable'
      });
    }

    // Check stock availability
    if (product.inventory.trackQuantity && product.inventory.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.inventory.stock} items available in stock`
      });
    }

    const cart = await Cart.getUserCart(req.user.id);

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      // Check stock for updated quantity
      if (product.inventory.trackQuantity && product.inventory.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more items. Only ${product.inventory.stock} available in stock`
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity: quantity,
        price: product.price
      });
    }

    await cart.save();
    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.getUserCart(req.user.id);
    const cartItem = cart.items.id(itemId);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Get product for stock check
    const product = await Product.findById(cartItem.product);
    if (product.inventory.trackQuantity && product.inventory.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.inventory.stock} items available in stock`
      });
    }

    cartItem.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.getUserCart(req.user.id);
    cart.items.pull(itemId);
    await cart.save();
    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.getUserCart(req.user.id);
    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};