const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
  getSalesReport
} = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(auth);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/sales-report', getSalesReport);

module.exports = router;