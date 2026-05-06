const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email Transporter Config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Ensure these are set in .env
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (user) {
            if (user.isVerified) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // User exists but not verified - Resend OTP logic
            if (user.lastOtpRequestDate && user.lastOtpRequestDate >= today) {
                if (user.otpRequestsToday >= 5) {
                    return res.status(429).json({ message: 'Daily OTP limit reached (5/day). Please try again tomorrow.' });
                }
            } else {
                user.otpRequestsToday = 0;
                user.lastOtpRequestDate = today;
            }

            // Update user details if provided (optional, but good for corrections)
            if (name) user.name = name;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
            }
            if (phone) user.phone = phone;

        } else {
            // New User
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = new User({
                name,
                email,
                password: hashedPassword,
                phone,
                otpRequestsToday: 0,
                lastOtpRequestDate: today
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
        user.otpRequestsToday += 1;
        user.lastOtpRequestDate = new Date();

        await user.save();

        // Send Email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: user.email,
            subject: 'Email Verification OTP - Safely Hands',
            text: `Your OTP for email verification is: ${otp}\n\nThis OTP is valid for 5 minutes.\n\nNote: You have used ${user.otpRequestsToday}/5 OTP requests today.`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: 'OTP sent to your email. Please verify to complete registration.',
            email: user.email
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        // Check daily limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (user.lastOtpRequestDate && user.lastOtpRequestDate >= today) {
            if (user.otpRequestsToday >= 5) {
                return res.status(429).json({ message: 'Daily OTP limit reached. Try again tomorrow.' });
            }
        } else {
            user.otpRequestsToday = 0;
            user.lastOtpRequestDate = today;
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        user.otpRequestsToday += 1;

        await user.save();

        // Send Email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: user.email,
            subject: 'Email Verification OTP - Safely Hands',
            text: `Your new OTP for email verification is: ${otp}\n\nThis OTP is valid for 5 minutes.`
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'OTP resent successfully' });

    } catch (error) {
        console.error("Resend OTP Error:", error);
        res.status(500).json({ message: 'Server error sending OTP' });
    }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            isGoogleUser: !!user.googleId,
            profilePicture: user.profilePicture,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Self-healing: If user has Google ID (proven identity) but is not verified, verify them.
            if (user.googleId && !user.isVerified) {
                user.isVerified = true;
                await user.save();
            }

            if (!user.isVerified) {
                return res.status(401).json({ message: 'Email not verified. Please register again to verify.' });
            }
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                isGoogleUser: !!user.googleId,
                profilePicture: user.profilePicture,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Google Auth (Placeholder/Basic)
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture, sub } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (user) {
            // Update profile picture if changed
            if (picture && user.profilePicture !== picture) {
                user.profilePicture = picture;
            }
            // Ensure Google users are verified
            if (!user.isVerified) {
                user.isVerified = true;
            }
            await user.save();
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                isGoogleUser: !!user.googleId,
                profilePicture: user.profilePicture,
                isVerified: true,
                token: generateToken(user._id),
            });
        }

        // Generate a random password for Google users
        const randomPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            googleId: sub,
            profilePicture: picture,
            isVerified: true // Google users are automatically verified
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                isGoogleUser: !!user.googleId,
                profilePicture: user.profilePicture,
                isVerified: true,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(400).json({ message: "Invalid Google Token" });
    }
};

// @desc    Google OAuth Callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleAuthCallback = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
        }

        // Exchange code for tokens
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_CALLBACK_URL,
            grant_type: 'authorization_code'
        });

        const { access_token } = tokenResponse.data;

        // Get user info from Google
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const { email, name, picture, id: googleId } = userInfoResponse.data;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            const randomPassword = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = await User.create({
                name,
                email,
                password: hashedPassword,
                googleId,
                profilePicture: picture,
                isVerified: true // Google users are automatically verified
            });
        } else {
            // Setup/Update for existing user logging in with Google
            let needsSave = false;

            if (!user.googleId) {
                user.googleId = googleId;
                needsSave = true;
            }
            if (!user.isVerified) {
                user.isVerified = true;
                needsSave = true;
            }
            if (picture && user.profilePicture !== picture) {
                user.profilePicture = picture;
                needsSave = true;
            }

            if (needsSave) {
                await user.save();
            }
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            isGoogleUser: !!user.googleId,
            profilePicture: user.profilePicture,
            isVerified: true
        }))}`);


    } catch (error) {
        console.error("Google OAuth Callback Error:", error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            // Use !== undefined to allow empty string for phone
            if (req.body.phone !== undefined) {
                user.phone = req.body.phone;
            }
            if (req.body.profilePicture !== undefined) {
                user.profilePicture = req.body.profilePicture;
            }

            // If email update is allowed in future, add here (careful with auth)
            // user.email = req.body.email || user.email;

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                isGoogleUser: !!updatedUser.googleId,
                profilePicture: updatedUser.profilePicture,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user password
// @route   PUT /api/auth/profile/password
// @access  Private
const updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { currentPassword, newPassword } = req.body;

        if (user) {
            // For non-Google users, verify current password
            if (!user.googleId) {
                if (!currentPassword) {
                    return res.status(400).json({ message: 'Current password is required' });
                }
                const isMatch = await bcrypt.compare(currentPassword, user.password);
                if (!isMatch) {
                    return res.status(400).json({ message: 'Invalid current password' });
                }
            }
            // For Google users (or verified non-Google), set new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);

            // If they didn't have a googleId (standard flow) or did (google flow), 
            // the password is now set. 
            // Optional: If they were Google user, maybe clear googleId to unlink? 
            // For now, let's keep it linked but allow password login too.

            await user.save();

            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Rate Limiting: 5 OTPs per day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (user.lastOtpRequestDate && user.lastOtpRequestDate >= today) {
            if (user.otpRequestsToday >= 5) {
                return res.status(429).json({ message: 'Daily OTP limit reached (5/day). Please try again tomorrow.' });
            }
        } else {
            // Reset counter for new day
            user.otpRequestsToday = 0;
            user.lastOtpRequestDate = today;
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP and increment counter
        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
        user.otpRequestsToday += 1;
        user.lastOtpRequestDate = new Date(); // Update to current time for tracking
        await user.save();

        // Send Email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: user.email,
            subject: 'Password Reset OTP - Safely Hands',
            text: `Your OTP for password reset is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nNote: You have used ${user.otpRequestsToday}/5 OTP requests today.`
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'OTP sent to your email' });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: 'Server error sending OTP' });
    }
};

// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear OTP fields and verify user
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful. You can now login.' });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: 'Server error resetting password' });
    }
};

// @desc    Promote user to admin
// @route   PUT /api/auth/promote-admin
// @access  Private/Admin
const promoteToAdmin = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User with this email not found. They must sign up first.' });
        }

        user.role = 'admin';
        await user.save();

        res.json({ message: `Successfully promoted ${user.name} to Admin` });
    } catch (error) {
        console.error("Promote Admin Error:", error);
        res.status(500).json({ message: 'Server error promoting user' });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

module.exports = {
    registerUser,
    verifyEmail,
    loginUser,
    googleAuth,
    googleAuthCallback,
    updatePassword,
    updateProfile,
    forgotPassword,
    resetPassword,
    promoteToAdmin,
    getUsers,
    resendOtp
};
