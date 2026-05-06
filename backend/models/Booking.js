const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
        quantity: { type: Number, default: 1 },
        answers: { type: Map, of: String }, // Dynamic answers for this item
        price: { type: Number }
    }],
    genderPreference: { type: String },
    serviceType: { type: String }, // Stores the main service name (e.g., "Babysitter", "Cook")
    babyDOB: { type: Date },
    frequency: { type: String, enum: ['One-time', 'Daily', 'Weekly', 'Live-in', 'Day-shift', 'Part-time'], default: 'Daily', required: true },
    weeklyDays: [{ type: Number, min: 0, max: 6 }], // 0=Sunday, 1=Monday, ... 6=Saturday
    date: { type: Date, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    notes: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
    serviceStatus: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    paymentProofUrl: { type: String }, // Cloudinary URL
    paymentStatus: { type: String, enum: ['unpaid', 'pending_approval', 'paid'], default: 'unpaid' },
    time: { type: String }, // e.g., "10:00 AM"
    attendanceLogs: [{
        date: { type: Date, required: true },
        status: { type: String, enum: ['present', 'absent', 'not_marked'], default: 'not_marked' },
        markedBy: { type: String, enum: ['admin', 'user', 'worker'], default: 'admin' }
    }],
    assignedWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    startDate: { type: Date },
    endDate: { type: Date }, // For subscription duration
    totalAmount: { type: Number },
    showAllocationDetails: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
