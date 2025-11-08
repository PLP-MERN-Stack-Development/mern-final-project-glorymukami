const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
  addProductReview
} = require('../controllers/productController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes
router.use(auth);

router.post('/', authorize('user', 'admin'), createProduct);
router.put('/:id', authorize('user', 'admin'), updateProduct);
router.delete('/:id', authorize('user', 'admin'), deleteProduct);
router.get('/vendor/my-products', authorize('user', 'admin'), getVendorProducts);
router.post('/:id/reviews', addProductReview);

module.exports = router;