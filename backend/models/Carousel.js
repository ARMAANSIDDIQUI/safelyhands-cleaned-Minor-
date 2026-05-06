const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },
    name: {
        type: String, // Optional alt text or company name
        required: false
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

module.exports = mongoose.models.Carousel || mongoose.model('Carousel', carouselSchema);
