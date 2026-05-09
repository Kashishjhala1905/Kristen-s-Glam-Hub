const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.showLogin);
router.post('/login', authController.handleLogin);

router.get('/signup', authController.showSignup);
router.post('/signup', authController.handleSignup);

router.post("/send-login-otp", authController.sendLoginOTP);
router.post("/verify-login-otp", authController.verifyLoginOTP);

router.post("/signup/send-otp", authController.sendSignupOTP);
router.post("/signup/verify-otp", authController.verifySignupOTP);
router.post("/signup/resend-otp", authController.resendSignupOTP);

router.get('/logout', authController.logout);

router.get("/forgot-password", authController.showForgotPassword);

router.post("/forgot-password", authController.sendResetLink);

router.get("/reset-password/:token", authController.showResetPassword);

router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
