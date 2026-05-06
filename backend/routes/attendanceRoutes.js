const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getBookingAttendance,
    getWorkerAttendance,
    getValidDates,
    getMyBookingsWithAttendance,
    downloadAttendancePDF,
    downloadAttendanceCSV,
    getAdminAttendance,
    downloadAdminReportPDF
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, markAttendance);
router.get('/booking/:bookingId', protect, getBookingAttendance);
router.get('/worker', protect, getWorkerAttendance);
router.get('/valid-dates/:bookingId', protect, getValidDates);
router.get('/my-bookings', protect, getMyBookingsWithAttendance);
router.get('/booking/:bookingId/download-pdf', protect, downloadAttendancePDF);
router.get('/booking/:bookingId/download-csv', protect, downloadAttendanceCSV);
router.get('/admin/all', protect, admin, getAdminAttendance);
router.get('/admin/download-report', protect, admin, downloadAdminReportPDF);

module.exports = router;
