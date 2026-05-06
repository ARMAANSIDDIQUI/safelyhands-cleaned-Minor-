const mongoose = require('mongoose');

const credibilityLogoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['registered', 'backed'],
        required: true
    },
    imageUrl: {
        type: String, // Cloudinary URL
        required: true
    },
    url: {
        type: String, // Optional link to the organization's site
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CredibilityLogo', credibilityLogoSchema);
