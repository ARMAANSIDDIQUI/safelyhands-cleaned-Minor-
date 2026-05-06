const express = require('express');
const router = express.Router();
const {
    getAllSubCategories,
    getSubCategoryById,
    updateSubCategory,
    createSubCategory,
    deleteSubCategory
} = require('../controllers/serviceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getAllSubCategories)
    .post(protect, admin, createSubCategory);

router.route('/:id')
    .get(getSubCategoryById)
    .put(protect, admin, updateSubCategory)
    .delete(protect, admin, deleteSubCategory);

module.exports = router;
