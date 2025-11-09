import axios from 'axios';

// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = 'https://mern-final-project-glorymukami.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateDetails: (userData) => api.put('/auth/updatedetails', userData),
  updatePassword: (passwordData) => api.put('/auth/updatepassword', passwordData),
};

// Product API methods
export const productAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, reviewData) => api.post(`/products/${id}/reviews`, reviewData),
  getVendorProducts: () => api.get('/products/vendor/my-products'),
};

// NEW: Review API methods
export const reviewAPI = {
  getProductReviews: (productId, params = {}) => api.get(`/products/${productId}/reviews`, { params }),
  createReview: (productId, reviewData) => api.post(`/products/${productId}/reviews`, reviewData),
  updateReview: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
  markHelpful: (reviewId) => api.put(`/reviews/${reviewId}/helpful`),
};

// Cart API methods
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (itemData) => api.post('/cart/items', itemData),
  updateItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart'),
};

// Order API methods
export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  updateToPaid: (id, paymentData) => api.put(`/orders/${id}/pay`, paymentData),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  getAll: () => api.get('/orders'), // Admin only
  updateStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData), // Admin only
};

// NEW: Payment API methods (Stripe integration)
export const paymentAPI = {
  createPaymentIntent: (paymentData) => api.post('/payment/create-payment-intent', paymentData),
  createCheckoutSession: (orderId) => api.post('/payments/create-checkout-session', { orderId }),
  verify: (orderId) => api.get(`/payments/verify/${orderId}`),
};

// NEW: Enhanced Admin API methods
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getRecentOrders: () => api.get('/admin/orders/recent'),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUserRole: (id, roleData) => api.put(`/admin/users/${id}/role`, roleData),
  getSalesReport: (params = {}) => api.get('/admin/sales-report', { params }),
  getAllProducts: (params = {}) => api.get('/admin/products', { params }),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getOrderStats: () => api.get('/admin/orders/stats'),
};

// NEW: User Profile API methods
export const userAPI = {
  updateProfile: (userData) => api.put('/users/profile', userData),
  updateAddress: (addressData) => api.put('/users/address', addressData),
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (productId) => api.post('/users/wishlist', { productId }),
  removeFromWishlist: (productId) => api.delete(`/users/wishlist/${productId}`),
};

export default api;