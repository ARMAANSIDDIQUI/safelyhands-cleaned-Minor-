const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Child Education', 'Worker Registration', 'Health Insurance', 'Worker Referral']
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    details: {
        type: Object, // Store form-specific fields here (e.g., worker experience, child age)
        default: {}
    },
    status: {
        type: String,
        enum: ['New', 'In Progress', 'Resolved', 'Rejected'],
        default: 'New'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);
