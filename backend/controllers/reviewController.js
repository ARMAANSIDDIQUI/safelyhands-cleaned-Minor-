const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');

// @desc    Get all reviews (Admin only)
// @route   GET /api/reviews/admin
// @access  Private/Admin
const getAllReviewsAdmin = async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate('user', 'name email')
            .populate('worker', 'name')
            .populate('booking', 'serviceType date')
            .sort('-createdAt');
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews for admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const { bookingId, workerId, rating, comment } = req.body;

        // Verify booking exists and belongs to user
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to review this booking' });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            return res.status(400).json({ message: 'Review already submitted for this booking' });
        }

        // Create review
        const review = await Review.create({
            booking: bookingId,
            user: req.user._id,
            worker: workerId,
            service: booking.serviceType,
            rating,
            comment
        });

        // Update worker's average rating - REMOVED: Now handled after admin approval
        // const workerReviews = await Review.find({ worker: workerId });
        // const avgRating = workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length;
        // await Worker.findByIdAndUpdate(workerId, { rating: avgRating });

        res.status(201).json({
            message: 'Review submitted successfully',
            review
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get reviews for a worker
// @route   GET /api/reviews/worker/:workerId
// @access  Public
const getWorkerReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ worker: req.params.workerId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching worker reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get review for a booking
// @route   GET /api/reviews/booking/:bookingId
// @access  Private
const getBookingReview = async (req, res) => {
    try {
        const review = await Review.findOne({ booking: req.params.bookingId })
            .populate('worker', 'name profession');

        res.json(review);
    } catch (error) {
        console.error('Error fetching booking review:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Approve or Reject review (Admin only)
// @route   PUT /api/reviews/:id/approval
// @access  Private/Admin
const toggleReviewApproval = async (req, res) => {
    try {
        const { isApproved } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.isApproved = isApproved;
        await review.save();

        // Recalculate worker rating ONLY based on APPROVED reviews
        if (isApproved) {
            const workerReviews = await Review.find({ worker: review.worker, isApproved: true });
            if (workerReviews.length > 0) {
                const avgRating = workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length;
                await Worker.findByIdAndUpdate(review.worker, { rating: avgRating });
            }
        } else {
            // If rejected/unapproved, we might want to re-calculate without it?
            // Yes, to be safe.
            const workerReviews = await Review.find({ worker: review.worker, isApproved: true });
            if (workerReviews.length > 0) {
                const avgRating = workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length;
                await Worker.findByIdAndUpdate(review.worker, { rating: avgRating });
            } else {
                await Worker.findByIdAndUpdate(review.worker, { rating: 0 }); // Reset if no approved reviews
            }
        }

        res.json({ message: `Review ${isApproved ? 'approved' : 'unapproved'}`, review });
    } catch (error) {
        console.error('Error updating review approval:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllReviewsAdmin,
    createReview,
    getWorkerReviews,
    getBookingReview,
    toggleReviewApproval
};
