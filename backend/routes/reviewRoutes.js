const express = require('express');
const router = express.Router();
const {
    getAllReviewsAdmin,
    createReview,
    getWorkerReviews,
    getBookingReview,
    toggleReviewApproval
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/admin', protect, admin, getAllReviewsAdmin);
router.post('/', protect, createReview);
router.get('/worker/:workerId', getWorkerReviews);
router.get('/booking/:bookingId', protect, getBookingReview);

// Admin: Approve/Reject review
router.put('/:id/approval', protect, admin, toggleReviewApproval);

module.exports = router;
