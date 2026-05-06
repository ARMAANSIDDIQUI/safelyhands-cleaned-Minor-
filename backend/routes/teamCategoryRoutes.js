const express = require('express');
const router = express.Router();
const { getTeamCategories, createTeamCategory, updateTeamCategory, deleteTeamCategory } = require('../controllers/teamCategoryController');
// const { protect, admin } = require('../middleware/authMiddleware'); // Admin protection can be added later

router.get('/', getTeamCategories);
router.post('/', createTeamCategory);
router.put('/:id', updateTeamCategory);
router.delete('/:id', deleteTeamCategory);

module.exports = router;
