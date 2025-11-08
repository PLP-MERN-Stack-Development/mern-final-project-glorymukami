const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  updateDetails,
  updatePassword
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, getMe);
router.put('/updatedetails', auth, updateDetails);
router.put('/updatepassword', auth, updatePassword);

module.exports = router;