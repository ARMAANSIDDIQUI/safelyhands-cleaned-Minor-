const mongoose = require('mongoose');

const investorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    src: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Investor || mongoose.model('Investor', investorSchema);
