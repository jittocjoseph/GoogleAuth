const express = require('express');
const { signup, verifyOtp, resendOtp, signin, googleLogin } = require('../controllers/AuthController');

const router = express.Router();

// Define routes and link them to controller functions
router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/signin', signin);
router.post('/google-login',googleLogin)

module.exports = router;
