const Carousel = require('../models/Carousel');

// @desc    Get all active carousel images
// @route   GET /api/carousel
// @access  Public
const getCarouselImages = async (req, res) => {
    try {
        const images = await Carousel.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add new carousel image
// @route   POST /api/carousel
// @access  Private/Admin
const addCarouselImage = async (req, res) => {
    try {
        const { imageUrl, name } = req.body;

        const newImage = await Carousel.create({
            imageUrl,
            name
        });

        res.status(201).json(newImage);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete carousel image
// @route   DELETE /api/carousel/:id
// @access  Private/Admin
const deleteCarouselImage = async (req, res) => {
    try {
        const image = await Carousel.findById(req.params.id);

        if (image) {
            await image.deleteOne();
            res.json({ message: 'Image removed' });
        } else {
            res.status(404).json({ message: 'Image not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCarouselImages,
    addCarouselImage,
    deleteCarouselImage
};
