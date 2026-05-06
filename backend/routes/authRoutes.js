const express = require('express');
const router = express.Router();
const {
    registerUser,
    verifyEmail,
    loginUser,
    googleAuth,
    googleAuthCallback,
    updatePassword,
    forgotPassword,
    resetPassword,
    updateProfile,
    promoteToAdmin,
    resendOtp
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/login', loginUser);
router.put('/profile/password', protect, updatePassword);
router.put('/profile', protect, updateProfile);
router.put('/promote-admin', protect, admin, promoteToAdmin);
router.get('/users', protect, admin, require('../controllers/authController').getUsers);
router.post('/google', googleAuth);
router.get('/google', (req, res) => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&response_type=code&scope=openid%20email%20profile`;
    res.redirect(googleAuthUrl);
});
router.get('/google/callback', googleAuthCallback);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
