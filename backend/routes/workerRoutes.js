const express = require('express');
const router = express.Router();
const {
    getWorkers,
    getWorkerById,
    createWorker,
    updateWorker,
    deleteWorker,
    createWorkerWithId,
    getWorkersWithAvailability
} = require('../controllers/workerController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getWorkers)
    .post(protect, admin, createWorker);

router.get('/availability', protect, admin, getWorkersWithAvailability);
router.post('/create-id', protect, admin, createWorkerWithId);

router.route('/:id')
    .get(getWorkerById)
    .put(protect, admin, updateWorker)
    .delete(protect, admin, deleteWorker);

module.exports = router;
