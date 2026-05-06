const express = require('express');
const router = express.Router();
const {
    createInquiry,
    getInquiries,
    updateInquiryStatus,
    deleteInquiry
} = require('../controllers/inquiryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(createInquiry)
    .get(protect, admin, getInquiries);

router.route('/:id')
    .put(protect, admin, updateInquiryStatus)
    .delete(protect, admin, deleteInquiry);

module.exports = router;
