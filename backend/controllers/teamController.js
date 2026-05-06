const TeamMember = require('../models/TeamMember');

// @desc    Get all team members
// @route   GET /api/team-members
const getTeamMembers = async (req, res) => {
    try {
        const team = await TeamMember.find({}).sort({ createdAt: -1 });
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a team member
// @route   POST /api/team-members
const createTeamMember = async (req, res) => {
    try {
        const member = await TeamMember.create(req.body);
        res.status(201).json(member);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a team member
// @route   PUT /api/team-members/:id
const updateTeamMember = async (req, res) => {
    try {
        const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(member);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a team member
// @route   DELETE /api/team-members/:id
const deleteTeamMember = async (req, res) => {
    try {
        await TeamMember.findByIdAndDelete(req.params.id);
        res.json({ message: 'Member removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember
};
