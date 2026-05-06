const CredibilityLogo = require('../models/CredibilityLogo');

// @desc    Get all active logos
// @route   GET /api/credibility
// @access  Public
const getLogos = async (req, res) => {
    try {
        const logos = await CredibilityLogo.find({ isActive: true }).sort({ order: 1 });
        const grouped = {
            registered: logos.filter(l => l.type === 'registered'),
            backed: logos.filter(l => l.type === 'backed')
        };
        res.json(grouped);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all logos (Admin)
// @route   GET /api/credibility/admin
// @access  Private/Admin
const getAdminLogos = async (req, res) => {
    try {
        const logos = await CredibilityLogo.find({}).sort({ order: 1 });
        res.json(logos);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a logo
// @route   POST /api/credibility
// @access  Private/Admin
const createLogo = async (req, res) => {
    try {
        const { name, type, imageUrl, url, order } = req.body;
        const logo = await CredibilityLogo.create({
            name,
            type,
            imageUrl,
            url,
            order
        });
        res.status(201).json(logo);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a logo
// @route   PUT /api/credibility/:id
// @access  Private/Admin
const updateLogo = async (req, res) => {
    try {
        const logo = await CredibilityLogo.findById(req.params.id);
        if (!logo) {
            return res.status(404).json({ message: 'Logo not found' });
        }

        logo.name = req.body.name || logo.name;
        logo.type = req.body.type || logo.type;
        logo.imageUrl = req.body.imageUrl || logo.imageUrl;
        logo.url = req.body.url !== undefined ? req.body.url : logo.url;
        logo.isActive = req.body.isActive !== undefined ? req.body.isActive : logo.isActive;
        logo.order = req.body.order !== undefined ? req.body.order : logo.order;

        const updatedLogo = await logo.save();
        res.json(updatedLogo);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a logo
// @route   DELETE /api/credibility/:id
// @access  Private/Admin
const deleteLogo = async (req, res) => {
    try {
        const logo = await CredibilityLogo.findById(req.params.id);
        if (logo) {
            await logo.deleteOne();
            res.json({ message: 'Logo removed' });
        } else {
            res.status(404).json({ message: 'Logo not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getLogos,
    getAdminLogos,
    createLogo,
    updateLogo,
    deleteLogo
};
