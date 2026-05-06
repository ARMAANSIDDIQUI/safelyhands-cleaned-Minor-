const express = require('express');
const router = express.Router();
const {
    getServices,
    getServiceById,
    getServiceBySlug,
    createService,
    updateService,
    deleteService,
    getSubCategories,
    createSubCategory
} = require('../controllers/serviceController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getServices);
router.get('/slug/:slug', getServiceBySlug);
router.get('/:id', getServiceById);
router.get('/:id/subcategories', getSubCategories);

// Protected routes
router.post('/', protect, admin, createService);
router.put('/:id', protect, admin, updateService);
router.delete('/:id', protect, admin, deleteService);
router.post('/:id/subcategories', protect, admin, createSubCategory);

// We need a separate router for /api/subcategories if we want to access by subCategory ID nicely
// But since this file is mounted at /api/services, we might need a new route file for /api/subcategories
// OR we can hack it here if the URL is /api/services/subcategories/:id (not ideal)
// Let's create a NEW route file for subcategories or just put them in app.js
// Wait, I can just add them here if I change how index.js mounts routes, or just add a new mount in server.js
// For now, I'll add them here but distinct paths might be tricky if they conflict.
// Actually, `frontend` called: 
// 1. `${process.env.NEXT_PUBLIC_API_URL}/services/${id}/subcategories` (POST)
// 2. `${process.env.NEXT_PUBLIC_API_URL}/subcategories/${subId}` (GET, PUT) -> THIS requires /api/subcategories

// I need to create `backend/routes/subCategoryRoutes.js` and mount it in server.js
// But `serviceController` has the methods. I'll just export them.

module.exports = router;
