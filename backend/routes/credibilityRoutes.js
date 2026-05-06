const express = require('express');
const router = express.Router();
const {
    getLogos,
    getAdminLogos,
    createLogo,
    updateLogo,
    deleteLogo
} = require('../controllers/credibilityController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getLogos).post(protect, admin, createLogo);
router.route('/admin').get(protect, admin, getAdminLogos);
router.route('/:id').put(protect, admin, updateLogo).delete(protect, admin, deleteLogo);

module.exports = router;
