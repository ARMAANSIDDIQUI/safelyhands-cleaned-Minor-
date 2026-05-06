const express = require('express');
const router = express.Router();
const { seedDatabase, migrateToAtlas } = require('../controllers/maintenanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/seed', protect, admin, seedDatabase);
router.post('/migrate', protect, admin, migrateToAtlas);

module.exports = router;
