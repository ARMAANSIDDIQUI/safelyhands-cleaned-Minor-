const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            console.log('Auth Middleware: Token received:', token ? 'Yes (hidden)' : 'No');

            // Check if token exists and is not empty
            if (!token || token === 'undefined' || token === 'null') {
                console.log('Auth Middleware: Token is invalid. Value:', token, 'Type:', typeof token);
                return res.status(401).json({ message: 'Not authorized, invalid token' });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Auth Middleware: Decoded ID:', decoded.id);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.log('Auth Middleware: User not found for ID:', decoded.id);
                return res.status(401).json({ message: 'User not found' });
            }

            console.log('✅ Auth Middleware: User authenticated:', req.user.email, 'Role:', req.user.role);
            next();
        } catch (error) {
            console.error('Auth Middleware Error:', error.message);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Not authorized, token is malformed' });
            } else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Not authorized, token expired' });
            }
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.log('Auth Middleware: No Bearer token in header');
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        console.log('Admin Middleware: Authorized');
        next();
    } else {
        console.log('Admin Middleware: Not authorized as admin. Role:', req.user ? req.user.role : 'No User');
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
