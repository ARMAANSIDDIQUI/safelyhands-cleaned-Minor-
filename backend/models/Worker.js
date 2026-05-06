const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Link to auth account
    workerId: { type: String, unique: true }, // Stable identifier (e.g., WRK-101)
    name: { type: String, required: true },
    profession: { type: String, required: true }, // e.g. Cook, Babysitter
    rating: { type: Number, default: 5.0 },
    numReviews: { type: Number, default: 0 },
    experienceYears: { type: Number },
    imageUrl: { type: String }, // Cloudinary URL
    bio: { type: String }, // Story or description
    isAvailable: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Worker || mongoose.model('Worker', workerSchema);
