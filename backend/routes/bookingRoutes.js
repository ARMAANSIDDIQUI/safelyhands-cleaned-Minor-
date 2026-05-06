const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getBookings,
    updateBookingStatus,
    getBookingById,
    assignWorker,
    getWorkerBookings,
    deleteBooking,
    updateBooking,
    getValidDates,
    downloadBill
} = require('../controllers/bookingController');
const { markAttendance } = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createBooking)
    .get(protect, admin, getBookings);

router.route('/mybookings').get(protect, getMyBookings);

router.route('/worker/tasks').get(protect, getWorkerBookings); // New route

router.route('/:id/attendance').put(protect, markAttendance);

router.route('/:id/valid-dates').get(protect, getValidDates);

router.route('/:id')
    .get(protect, getBookingById)
    .put(protect, admin, updateBookingStatus)
    .delete(protect, deleteBooking);

router.route('/:id/download-bill').get(protect, downloadBill);

router.route('/:id/status').put(protect, admin, updateBookingStatus);

router.route('/:id/edit').put(protect, updateBooking);

router.route('/:id/assign').put(protect, admin, assignWorker);

module.exports = router;
