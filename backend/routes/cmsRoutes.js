const express = require('express');
const router = express.Router();
const {
    getTeamMembers,
    getInvestors,
    getCarouselItems
} = require('../controllers/cmsController');

router.get('/team', getTeamMembers);
router.get('/investors', getInvestors);
router.get('/carousel', getCarouselItems);

module.exports = router;
