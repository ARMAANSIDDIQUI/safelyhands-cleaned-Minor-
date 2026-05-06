const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The customer
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent'], default: 'present' },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who marked it (Customer or Admin)
    createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate attendance for same booking and date
attendanceSchema.index({ booking: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
