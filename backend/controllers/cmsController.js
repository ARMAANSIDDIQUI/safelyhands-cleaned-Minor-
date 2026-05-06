const TeamMember = require('../models/TeamMember');
const Investor = require('../models/Investor');
const CarouselItem = require('../models/CarouselItem');

// @desc    Get all team members
// @route   GET /api/cms/team
// @access  Public
const getTeamMembers = async (req, res) => {
    try {
        const team = await TeamMember.find({});
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all investors
// @route   GET /api/cms/investors
// @access  Public
const getInvestors = async (req, res) => {
    try {
        const investors = await Investor.find({});
        res.json(investors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get carousel items
// @route   GET /api/cms/carousel
// @access  Public
const getCarouselItems = async (req, res) => {
    try {
        const items = await CarouselItem.find({}).sort({ order: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTeamMembers,
    getInvestors,
    getCarouselItems
};
