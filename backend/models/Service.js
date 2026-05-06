const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subtitle: { type: String }, // For Revolver Hero
    description: { type: String, required: true },
    imageUrl: { type: String },
    video: { type: String }, // Cloudinary video URL
    icon: { type: String }, // For Revolver Hero (Lucide icon name or URL)
    gradientFrom: { type: String, default: 'blue-100' }, // For Revolver Hero
    gradientTo: { type: String, default: 'blue-200' },   // For Revolver Hero
    features: [{ type: String, default: [] }],
    basePrice: { type: Number },
    minPrice: { type: Number, default: 0 },
    maxPrice: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    badge: { type: String },
    category: { type: String },
    shift: { type: String },
    selectionMode: { type: String, enum: ['single', 'multiple'], default: 'single' }, // single = select 1, multiple = select one or more
    gender: { type: String, enum: ['Male', 'Female', 'Both'], default: 'Both' },
    availability: { type: String },
    verificationStatus: { type: String },
    isActive: { type: Boolean, default: true },
    questions: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate
serviceSchema.virtual('subcategories', {
    ref: 'SubCategory',
    localField: '_id',
    foreignField: 'service',
    justOne: false
});

module.exports = mongoose.models.Service || mongoose.model('Service', serviceSchema);
