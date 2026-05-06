const Booking = require('../models/Booking');
const Attendance = require('../models/Attendance');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    try {
        const { serviceType, date, time, address, phone, notes, totalAmount, paymentProofUrl, weeklyDays, genderPreference, shift, babyDOB } = req.body;
        const frequency = req.body.frequency || 'Daily'; // Default to 'Daily' if not provided

        const dateStr = typeof date === 'string' ? date.split('T')[0] : new Date(date).toISOString().split('T')[0];
        let startDate = new Date(dateStr);
        let endDate = new Date(dateStr);
        startDate.setUTCHours(0, 0, 0, 0);
        endDate.setUTCHours(0, 0, 0, 0);

        if (frequency === 'One-time') {
            // End date is same as start date (already set)
        } else {
            // For Daily, Weekly, Live-in, set duration to strictly 30 days
            endDate.setDate(startDate.getDate() + 30);
            endDate.setUTCHours(23, 59, 59, 999);
        }

        const booking = await Booking.create({
            user: req.user._id,
            serviceType,
            frequency,
            weeklyDays: frequency === 'Weekly' ? weeklyDays : [],
            date,
            startDate,
            endDate,
            time,
            address,
            phone,
            notes,
            totalAmount,
            paymentProofUrl,
            genderPreference,
            shift,
            babyDOB,
            items: req.body.items, // CHANGED: Include items to save subcategories & answers
            status: 'pending',
            serviceStatus: 'active'
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('assignedWorker', 'name profilePicture')
            .populate({
                path: 'items.subCategory',
                select: 'name price service',
                populate: {
                    path: 'service',
                    select: 'title'
                }
            })
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('user', 'id name email')
            .populate({
                path: 'items.subCategory',
                select: 'name price service',
                populate: {
                    path: 'service',
                    select: 'title'
                }
            })
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update booking status (Admin)
// @route   PUT /api/bookings/:id
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            const oldStatus = booking.status;
            booking.status = req.body.status || booking.status;

            // Only update paymentStatus if it's explicitly provided in the request
            if (req.body.paymentStatus !== undefined) {
                booking.paymentStatus = req.body.paymentStatus;
            }

            // Update totalAmount if provided
            if (req.body.totalAmount !== undefined) {
                booking.totalAmount = req.body.totalAmount;
            }

            const updatedBooking = await booking.save();

            // Create notification if marked as completed
            if (req.body.status === 'completed' && oldStatus !== 'completed') {
                await Notification.create({
                    user: booking.user,
                    title: 'Service Completed',
                    message: `Your your booking for ${booking.serviceType} has been marked as completed. We hope you enjoyed our service!`,
                    type: 'booking',
                    link: `/dashboard/bookings/${booking._id}`
                });
            }

            res.json(updatedBooking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('assignedWorker')
            .populate('user', 'name email phone')
            .populate({
                path: 'items.subCategory',
                select: 'name price description'
            });

        if (booking) {
            // Verify ownership or admin
            if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized' });
            }
            res.json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const Notification = require('../models/Notification'); // Import Notification

// ... (existing code)

// @desc    Assign worker to booking
// @route   PUT /api/bookings/:id/assign
// @access  Private/Admin
const assignWorker = async (req, res) => {
    try {
        const { workerId } = req.body;
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name'); // Populate user to get name if needed, mainly need ID

        if (booking) {
            booking.assignedWorker = workerId;
            booking.status = 'approved';
            const updatedBooking = await booking.save();

            // Create Notification for User
            await Notification.create({
                user: booking.user._id,
                title: 'Booking Approved & Worker Assigned',
                message: `Your booking for ${booking.serviceType} has been approved. A worker has been assigned.`,
                type: 'booking',
                link: `/dashboard/bookings/${booking._id}`
            });

            res.json(updatedBooking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get tasks assigned to logged-in worker
// @route   GET /api/bookings/worker/tasks
// @access  Private
const getWorkerBookings = async (req, res) => {
    try {
        // Find worker profile associated with user
        const Worker = require('../models/Worker');
        const workerProfile = await Worker.findOne({ userId: req.user._id }); // Assuming Worker has userId link

        // If no worker profile linked, maybe they are just a user? 
        // Or if we don't store userId in Worker, we need another way.
        // Looking at Worker.js, it DOES have userId field.

        if (!workerProfile) {
            // Alternatively, maybe searching by name/email if userId isn't populated? 
            // But let's assume userId is key.
            return res.status(404).json({ message: 'Worker profile not found for this user' });
        }

        const bookings = await Booking.find({ assignedWorker: workerProfile._id })
            .populate('user', 'name phone address')
            .sort({ date: 1 });

        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify ownership or admin
        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Cascade delete associated attendance records
        const attendanceDeleteResult = await Attendance.deleteMany({ booking: req.params.id });
        console.log(`[CASCADE DELETE] Removed ${attendanceDeleteResult.deletedCount} attendance records for booking ${req.params.id}`);

        await Booking.findByIdAndDelete(req.params.id);
        res.json({
            message: 'Booking and associated attendance records removed',
            deletedAttendanceCount: attendanceDeleteResult.deletedCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update booking (User/Admin)
// @route   PUT /api/bookings/:id/edit
// @access  Private
const updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify ownership or admin
        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Update fields
        booking.serviceType = req.body.serviceType || booking.serviceType;
        booking.frequency = req.body.frequency || booking.frequency;

        if (req.body.frequency === 'Weekly') {
            booking.weeklyDays = req.body.weeklyDays || booking.weeklyDays;
        }

        booking.date = req.body.date || booking.date;

        // Recalculate start and end dates if frequency or date changed
        if (req.body.date || req.body.frequency) {
            const dateStr = typeof (req.body.date || booking.date) === 'string'
                ? (req.body.date || booking.date).split('T')[0]
                : new Date(req.body.date || booking.date).toISOString().split('T')[0];

            const newStartDate = new Date(dateStr);
            const newEndDate = new Date(dateStr);
            newStartDate.setUTCHours(0, 0, 0, 0);
            newEndDate.setUTCHours(0, 0, 0, 0);

            if (booking.frequency !== 'One-time') {
                newEndDate.setMonth(newEndDate.getMonth() + 1);
                newEndDate.setUTCHours(23, 59, 59, 999);
            }

            booking.startDate = newStartDate;
            booking.endDate = newEndDate;
            booking.date = dateStr;
        }

        booking.address = req.body.address || booking.address;
        booking.notes = req.body.notes || booking.notes;
        booking.genderPreference = req.body.genderPreference || booking.genderPreference;
        booking.shift = req.body.shift || booking.shift;

        const updatedBooking = await booking.save();
        res.json(updatedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const markAttendance = async (req, res) => {
    try {
        const { attendanceStatus, date } = req.body;
        const bookingId = req.params.id;

        if (!bookingId || bookingId === 'undefined' || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid or missing Booking ID' });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Ensure a worker is assigned (needed for Attendance record)
        if (!booking.assignedWorker) {
            return res.status(400).json({
                message: 'No worker is assigned to this booking. Please assign a worker first.'
            });
        }

        // Check if admin or the user who created the booking
        if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const logDate = date ? new Date(date) : new Date();
        logDate.setUTCHours(0, 0, 0, 0); // Normalize to UTC Date

        // 1. Create or Update in Attendance Collection (Primary source for history)
        const attendanceRecord = await Attendance.findOneAndUpdate(
            {
                booking: booking._id,
                date: logDate
            },
            {
                status: attendanceStatus || 'present',
                markedBy: req.user._id,
                worker: booking.assignedWorker,
                user: booking.user
            },
            { upsert: true, new: true, runValidators: true }
        );
        console.log(`[DEBUG] Attendance record updated: ${attendanceRecord._id}`);

        // 2. Sync with Booking.attendanceLogs (For redundancy/stats)
        if (!booking.attendanceLogs) booking.attendanceLogs = [];

        const logIndex = booking.attendanceLogs.findIndex(log => {
            if (!log.date) return false;
            const dStr = new Date(log.date).toISOString().split('T')[0];
            const targetStr = logDate.toISOString().split('T')[0];
            return dStr === targetStr;
        });

        console.log(`[DEBUG] Found logIndex: ${logIndex} for date ${logDate.toISOString()}`);

        const logStatus = attendanceStatus || 'present';
        const logRole = req.user.role === 'admin' ? 'admin' : (req.user.role === 'worker' ? 'worker' : 'user');

        if (logIndex > -1) {
            console.log(`[DEBUG] Updating existing log at index ${logIndex} to status ${logStatus}`);
            booking.attendanceLogs[logIndex].status = logStatus;
            booking.attendanceLogs[logIndex].markedBy = logRole;
        } else {
            console.log(`[DEBUG] Pushing new log for date ${logDate.toISOString()} with status ${logStatus}`);
            booking.attendanceLogs.push({
                date: logDate,
                status: logStatus,
                markedBy: logRole
            });
        }

        // CRITICAL: Mongoose needs this to detect subdocument changes in arrays
        booking.markModified('attendanceLogs');
        const updatedBooking = await booking.save();

        console.log(`[DEBUG] Save successful. New logs count: ${updatedBooking.attendanceLogs.length}`);

        res.json({
            message: 'Attendance marked',
            booking: updatedBooking,
            record: attendanceRecord
        });
    } catch (error) {
        console.error('Error in bookingController.markAttendance:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get valid scheduled dates for a booking
// @route   GET /api/bookings/:id/valid-dates
// @access  Private
const getValidDates = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const validDates = [];
        // CRITICAL: Interpret stored UTC with +5.5h offset to correctly identify the intended India calendar day.
        let current = new Date(new Date(booking.startDate || booking.date).getTime() + (5.5 * 60 * 60 * 1000));
        current.setUTCHours(0, 0, 0, 0);

        const endRaw = booking.endDate ? new Date(booking.endDate) : new Date(booking.startDate || booking.date);
        const end = new Date(endRaw.getTime() + (5.5 * 60 * 60 * 1000));
        end.setUTCHours(0, 0, 0, 0);

        if (booking.frequency === 'One-time') {
            validDates.push(new Date(current));
        } else {
            // Loop from startDate to endDate
            while (current <= end) {
                if (['Daily', 'Live-in', 'Day-shift', 'Part-time'].includes(booking.frequency)) {
                    validDates.push(new Date(current));
                } else if (booking.frequency === 'Weekly') {
                    if (booking.weeklyDays && booking.weeklyDays.includes(current.getDay())) {
                        validDates.push(new Date(current));
                    }
                }
                current.setDate(current.getDate() + 1);
            }
        }

        res.json({ validDates });
    } catch (error) {
        console.error('Error fetching valid dates:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Download Bill as PDF
// @route   GET /api/bookings/:id/download-bill
// @access  Private
const downloadBill = async (req, res) => {
    try {
        console.log(`[DEBUG] Attempting to download bill for booking ID: ${req.params.id}`);
        const path = require('path');
        const fs = require('fs');
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('items.subCategory', 'name');

        if (!booking) {
            console.error(`[DEBUG] Booking not found for ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check ownership or admin
        if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = `Bill_${booking._id}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        const colors = {
            primary: '#2563eb', // SafelyHands Blue
            text: '#1e293b',
            secondary: '#64748b',
            light: '#f8fafc',
            border: '#e2e8f0'
        };

        // --- Header Section ---
        const logoPath = path.join(__dirname, '../../frontend/public/headerlogo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 45, { width: 120 });
        } else {
            doc.fontSize(20).fillColor(colors.primary).text('SafelyHands', 50, 50, { bold: true });
        }

        doc.fillColor(colors.text).fontSize(10)
            .text('SafelyHands Services Pvt Ltd', 350, 50, { align: 'right' })
            .text('Near Sai mandir Ramganga vihar', 350, 65, { align: 'right' })
            .text('MDA Moradabad 244001', 350, 80, { align: 'right' })
            .text('safelyhands@gmail.com', 350, 95, { align: 'right' })
            .text('+91 8218303038 / 7618341297', 350, 110, { align: 'right' });

        doc.moveTo(50, 130).lineTo(550, 130).strokeColor(colors.border).stroke();

        // --- Invoice Title & Details ---
        doc.moveDown(1.5);
        doc.fillColor(colors.primary).fontSize(22).text('INVOICE', 50, 145);

        doc.fillColor(colors.text).fontSize(9);
        doc.text(`Invoice No: INV-${booking._id.toString().slice(-6).toUpperCase()}`, 50, 175);
        doc.text(`Date: ${new Date(booking.createdAt).toLocaleDateString()}`, 50, 188);
        doc.text(`Frequency: ${booking.frequency}`, 50, 201);

        // --- Billing To Details ---
        doc.fillColor(colors.secondary).fontSize(9).text('BILL TO:', 350, 175);
        doc.fillColor(colors.text).fontSize(11).text(booking.user?.name || 'Customer', 350, 188, { bold: true });
        doc.fontSize(9).text(booking.user?.phone || 'N/A', 350, 201);
        doc.fontSize(9).text(booking.address || 'N/A', 350, 214, { width: 200 });

        // --- Service Details Table Header ---
        const tableTop = 260;
        doc.rect(50, tableTop, 500, 25).fill(colors.light);
        doc.fillColor(colors.primary).fontSize(10).text('Service & Sub-Category', 60, tableTop + 8);
        doc.text('Details', 220, tableTop + 8);
        doc.text('Qty', 420, tableTop + 8, { width: 30, align: 'center' });
        doc.text('Amount', 470, tableTop + 8, { width: 80, align: 'right' });

        // --- Table Content ---
        let currentY = tableTop + 30;
        booking.items.forEach((item, index) => {
            const itemHeight = 40; // Base height

            // Check for page break
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }

            doc.fillColor(colors.text).fontSize(10).text(`${index + 1}. ${item.subCategory?.name || 'Service'}`, 60, currentY, { bold: true });

            // Details (Answers)
            if (item.answers) {
                const answers = item.answers.toJSON ? item.answers.toJSON() : item.answers;
                const answerText = Object.entries(answers)
                    .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1')}: ${v}`)
                    .join(', ');
                doc.fillColor(colors.secondary).fontSize(9).text(answerText, 220, currentY, { width: 180 });
            }

            doc.fillColor(colors.text).fontSize(10).text(item.quantity.toString(), 420, currentY, { width: 30, align: 'center' });
            doc.text(`Rs. ${item.price}`, 470, currentY, { width: 70, align: 'right' });

            currentY += 45;
            doc.moveTo(50, currentY - 5).lineTo(550, currentY - 5).strokeColor(colors.border).lineWidth(0.5).stroke();
        });

        // --- Totals Section ---
        currentY += 10;
        doc.fillColor(colors.secondary).fontSize(12).text('Total Amount:', 350, currentY);
        doc.fillColor(colors.primary).fontSize(16).text(`Rs. ${booking.totalAmount}`, 450, currentY, { width: 100, align: 'right', bold: true });

        // --- Status Banner ---
        currentY += 40;
        const pStatus = booking.paymentStatus || 'unpaid';
        const statusColor = pStatus === 'paid' ? '#10b981' : '#ef4444';
        doc.rect(50, currentY, 500, 40).fill('#f1f5f9');
        doc.fillColor(statusColor).fontSize(14).text(`Payment Status: ${pStatus.toUpperCase()}`, 60, currentY + 13, { bold: true });
        doc.fillColor(colors.secondary).fontSize(10).text(`Booking: ${(booking.status || 'pending').toUpperCase()}`, 350, currentY + 15, { align: 'right' });

        // --- Verification Stamp ---
        if (booking.paymentStatus === 'paid') {
            doc.save()
                .translate(450, 650)
                .rotate(-20)
                .fillColor('#10b981', 0.2)
                .fontSize(40)
                .text('PAID', 0, 0, { stroke: true })
                .restore();
        }

        // --- Footer ---
        const footerY = 780;
        doc.fontSize(8).fillColor(colors.secondary).text('This is a computer-generated invoice and does not require a signature.', 50, footerY, { align: 'center', width: 500 });
        doc.text('Thank you for choosing SafelyHands!', 50, footerY + 12, { align: 'center', width: 500 });

        doc.end();

    } catch (error) {
        console.error('Error generating bill PDF:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getBookings,
    updateBookingStatus,
    getBookingById,
    assignWorker,
    getWorkerBookings,
    deleteBooking,
    updateBooking,
    markAttendance,
    getValidDates,
    downloadBill
};
