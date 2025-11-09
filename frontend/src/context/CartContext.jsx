import React, { createContext, useState, useContext, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Only load cart if user is logged in
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      // Clear cart if user logs out
      setCartItems([]);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    try {
      const response = await cartAPI.get();
      // Ensure cartItems is always an array
      setCartItems(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      // Only log error if it's not 401 (unauthorized)
      if (error.response?.status !== 401) {
        console.error('Failed to load cart:', error);
      }
      setCartItems([]);
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      alert('Please login to add products to cart');
      window.location.href = '/login';
      return;
    }

    try {
      setLoading(true);
      await cartAPI.addItem({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || '/default-product.png',
        quantity: 1
      });
      await loadCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Fallback to local state
      const existingItem = cartItems.find(item => item.product === product._id);
      if (existingItem) {
        setCartItems(cartItems.map(item =>
          item.product === product._id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setCartItems([...cartItems, {
          product: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url || '/default-product.png',
          quantity: 1
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!user) return;
    
    try {
      await cartAPI.removeItem(itemId);
      await loadCart();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      setCartItems(cartItems.filter(item => item._id !== itemId));
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!user) return;
    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }
    
    try {
      await cartAPI.updateItem(itemId, quantity);
      await loadCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      setCartItems(cartItems.map(item =>
        item._id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = async () => {
    if (!user) return;
    
    try {
      await cartAPI.clear();
      setCartItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      setCartItems([]);
    }
  };

  const getCartTotal = () => {
    // Ensure cartItems is an array before using reduce
    const items = Array.isArray(cartItems) ? cartItems : [];
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    // Ensure cartItems is an array before using reduce
    const items = Array.isArray(cartItems) ? cartItems : [];
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};