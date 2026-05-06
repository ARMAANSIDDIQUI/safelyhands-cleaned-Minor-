const Testimonial = require('../models/Testimonial');

// @desc    Get all active testimonials
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all testimonials (Admin)
// @route   GET /api/testimonials/admin
// @access  Private/Admin
const getAdminTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
const createTestimonial = async (req, res) => {
    try {
        const { name, designation, message, rating, imageUrl } = req.body;
        const testimonial = await Testimonial.create({
            name,
            designation,
            message,
            rating,
            imageUrl
        });
        res.status(201).json(testimonial);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Private/Admin
const updateTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        testimonial.name = req.body.name || testimonial.name;
        testimonial.designation = req.body.designation || testimonial.designation;
        testimonial.message = req.body.message || testimonial.message;
        testimonial.rating = req.body.rating || testimonial.rating;
        testimonial.imageUrl = req.body.imageUrl || testimonial.imageUrl;
        testimonial.isActive = req.body.isActive !== undefined ? req.body.isActive : testimonial.isActive;

        const updatedTestimonial = await testimonial.save();
        res.json(updatedTestimonial);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
const deleteTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (testimonial) {
            await testimonial.deleteOne();
            res.json({ message: 'Testimonial removed' });
        } else {
            res.status(404).json({ message: 'Testimonial not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getTestimonials,
    getAdminTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
};
