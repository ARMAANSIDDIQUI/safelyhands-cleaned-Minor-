const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    linkedin: { type: String },
    category: { type: String, default: 'All' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.TeamMember || mongoose.model('TeamMember', teamMemberSchema);
