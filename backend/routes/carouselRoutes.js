const express = require('express');
const router = express.Router();
const { getCarouselImages, addCarouselImage, deleteCarouselImage } = require('../controllers/carouselController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getCarouselImages);
router.post('/', protect, admin, addCarouselImage);
router.delete('/:id', protect, admin, deleteCarouselImage);

module.exports = router;
