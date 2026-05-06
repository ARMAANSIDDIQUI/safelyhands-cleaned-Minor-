const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed
    role: { type: String, enum: ['customer', 'admin', 'worker'], default: 'customer' },
    googleId: { type: String }, // For OAuth
    profilePicture: { type: String }, // User profile image URL
    phone: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
    otpRequestsToday: { type: Number, default: 0 },
    lastOtpRequestDate: { type: Date },
    isVerified: { type: Boolean, default: false }, // Email verification status
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
