const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    designation: {
        type: String, // e.g., "Parent", "Homeowner"
        required: true
    },
    message: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5
    },
    imageUrl: {
        type: String, // Cloudinary URL
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
