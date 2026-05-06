const TeamCategory = require('../models/TeamCategory');

// @desc    Get all active team categories
// @route   GET /api/team-categories
// @access  Public
const getTeamCategories = async (req, res) => {
    try {
        const categories = await TeamCategory.find({ isActive: true }).sort({ order: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a team category (Admin)
// @route   POST /api/team-categories
// @access  Private/Admin
const createTeamCategory = async (req, res) => {
    const { name, slug, order } = req.body;
    try {
        const category = await TeamCategory.create({ name, slug, order });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a team category (Admin)
// @route   PUT /api/team-categories/:id
const updateTeamCategory = async (req, res) => {
    try {
        const category = await TeamCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a team category (Admin)
// @route   DELETE /api/team-categories/:id
const deleteTeamCategory = async (req, res) => {
    try {
        await TeamCategory.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTeamCategories,
    createTeamCategory,
    updateTeamCategory,
    deleteTeamCategory,
};
