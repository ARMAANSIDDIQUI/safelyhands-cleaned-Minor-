const mongoose = require('mongoose');

const citySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a city name'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'Please add a slug'],
        unique: true,
        lowercase: true
    },
    icon: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isOther: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('City', citySchema);
