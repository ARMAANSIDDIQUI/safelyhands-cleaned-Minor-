const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    name: { type: String, required: true },
    image: { type: String }, // Cloudinary URL
    price: { type: Number, required: true }, // Base price for this subcategory
    description: { type: String },
    features: [{ type: String }],
    inclusions: { type: String }, // Long text for "What's included"
    isActive: { type: Boolean, default: true },
    questions: [{
        stepTitle: { type: String, default: "Details" },
        fields: [{
            name: { type: String, required: true }, // Key for formData
            label: { type: String, required: true }, // Display label
            type: { type: String, enum: ['radio', 'select', 'checkbox', 'text', 'date', 'number'], default: 'radio' },
            isPricingReference: { type: Boolean, default: false }, // Only one field should be true
            options: [{
                label: String,
                value: String,
                priceChange: { type: Number, default: 0 },
                tieredPrices: [{
                    refValue: String, // Value of the reference field (e.g., "3")
                    price: { type: Number, required: true }
                }]
            }],
            required: { type: Boolean, default: true },
            condition: { // Conditional visibility logic
                key: String,
                value: String
            }
        }]
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.SubCategory || mongoose.model('SubCategory', subCategorySchema);
