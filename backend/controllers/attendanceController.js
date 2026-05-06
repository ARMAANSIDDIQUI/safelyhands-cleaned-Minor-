const Attendance = require('../models/Attendance');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');
const Worker = require('../models/Worker');

// Helper: Format date as DD-MM-YYYY local
const formatDateLocal = (dateInput) => {
    if (!dateInput) return "N/A";
    const date = new Date(dateInput);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

// Helper: Get Current IST Date object
const getNowIST = () => new Date(Date.now() + (5.5 * 60 * 60 * 1000));

// Helper: Get all valid attendance dates for a booking
const getValidAttendanceDates = (booking) => {
    const validDates = [];
    // CRITICAL: Use IST for today and normalization to prevent X-1 offset
    const today = getNowIST();
    today.setUTCHours(0, 0, 0, 0);

    const startDate = new Date(new Date(booking.startDate || booking.date).getTime() + (5.5 * 60 * 60 * 1000));
    startDate.setUTCHours(0, 0, 0, 0);

    const endDateBase = booking.endDate ? new Date(booking.endDate) : new Date(booking.date);
    const endDate = new Date(endDateBase.getTime() + (5.5 * 60 * 60 * 1000));
    endDate.setUTCHours(23, 59, 59, 999);

    switch (booking.frequency) {
        case 'One-time':
            // Only the exact booking date
            validDates.push(new Date(booking.date));
            break;

        case 'Daily':
        case 'Live-in':
        case 'Day-shift':
        case 'Part-time':
            // Every day from start to end
            let current = new Date(startDate);
            while (current <= endDate) {
                validDates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
            break;

        case 'Weekly':
            // Only on specified weeklyDays
            if (booking.weeklyDays && booking.weeklyDays.length > 0) {
                let weekCurrent = new Date(startDate);
                while (weekCurrent <= endDate) {
                    if (booking.weeklyDays.includes(weekCurrent.getDay())) {
                        validDates.push(new Date(weekCurrent));
                    }
                    weekCurrent.setDate(weekCurrent.getDate() + 1);
                }
            }
            break;
    }

    return validDates;
};

// Helper: Check if a date is valid for attendance (cannot be future, must be after start)
const isValidAttendanceDate = (booking, dateToCheck) => {
    const checkDate = new Date(dateToCheck);
    checkDate.setUTCHours(0, 0, 0, 0);

    const today = getNowIST();
    today.setUTCHours(0, 0, 0, 0);

    // Rule: Cannot mark for future dates (based on IST)
    if (checkDate.getTime() > today.getTime()) return false;

    // Rule: Cannot mark before service starts (Standardized IST normalization)
    const startDate = new Date(new Date(booking.startDate || booking.date).getTime() + (5.5 * 60 * 60 * 1000));
    startDate.setUTCHours(0, 0, 0, 0);

    if (checkDate.getTime() < startDate.getTime()) return false;

    const validDates = getValidAttendanceDates(booking);
    return validDates.some(vd => {
        const valid = new Date(vd);
        valid.setUTCHours(0, 0, 0, 0);
        return valid.getTime() === checkDate.getTime();
    });
};

// Helper: Check if service is still active
const isServiceActive = (booking) => {
    if (booking.serviceStatus !== 'active') return false;
    if (booking.status === 'completed' || booking.status === 'rejected') return false;

    const today = getNowIST();
    today.setUTCHours(0, 0, 0, 0);

    const endDateBase = booking.endDate ? new Date(booking.endDate) : new Date(booking.date);
    const endDate = new Date(endDateBase.getTime() + (5.5 * 60 * 60 * 1000));
    endDate.setUTCHours(23, 59, 59, 999);

    // For one-time, check if the date has passed
    if (booking.frequency === 'One-time') {
        const bookingDateBase = new Date(booking.date);
        const bookingDate = new Date(bookingDateBase.getTime() + (5.5 * 60 * 60 * 1000));
        bookingDate.setUTCHours(23, 59, 59, 999);
        return today <= bookingDate;
    }

    // If today is within service period, it's definitely active
    if (today <= endDate) return true;

    // If today is past end date, we still allow marking for valid days that were missed
    // This is handled by isValidAttendanceDate check later
    return true;
};


// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private
const markAttendance = async (req, res) => {
    try {
        const { booking: bodyBookingId, status, attendanceStatus, date } = req.body;
        const bookingId = req.params.id || bodyBookingId;
        const statusVal = status || attendanceStatus || 'present';

        if (!bookingId || bookingId === 'undefined' || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid or missing Booking ID' });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Validate service is still active (skip for admin)
        if (req.user.role !== 'admin' && !isServiceActive(booking)) {
            return res.status(400).json({
                message: 'Service has ended. Attendance cannot be marked.'
            });
        }

        // Ensure a worker is assigned
        if (!booking.assignedWorker) {
            return res.status(400).json({
                message: 'No worker is assigned to this booking. Please assign a worker first.'
            });
        }

        const nowIST_mark = new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        const attendanceDate = date ? new Date(date) : nowIST_mark;
        attendanceDate.setUTCHours(0, 0, 0, 0); // Normalize to UTC Date
        const targetStr = attendanceDate.toISOString().split('T')[0];
        console.log(`[DEBUG] markAttendance (AttendanceController) date: ${targetStr} (IST Today: ${nowIST_mark.toISOString().split('T')[0]})`);

        if (!isValidAttendanceDate(booking, attendanceDate)) {
            return res.status(400).json({
                message: 'Invalid attendance date. You can only mark attendance for valid service days from the start date up to today.'
            });
        }

        // 1. Create or Update in Attendance Collection (Primary source for history)
        const attendanceRecord = await Attendance.findOneAndUpdate(
            {
                booking: bookingId,
                date: attendanceDate
            },
            {
                status: statusVal,
                markedBy: req.user._id,
                worker: booking.assignedWorker,
                user: booking.user
            },
            { upsert: true, new: true, runValidators: true }
        );

        // 2. Sync with Booking.attendanceLogs (For redundancy/stats)
        if (!booking.attendanceLogs) booking.attendanceLogs = [];

        const logIndex = booking.attendanceLogs.findIndex(log => {
            if (!log.date) return false;
            const dStr = new Date(log.date).toISOString().split('T')[0];
            return dStr === targetStr;
        });

        console.log(`[DEBUG] Found logIndex: ${logIndex} for booking ${booking._id}`);

        if (logIndex > -1) {
            console.log(`[DEBUG] Updating existing log index ${logIndex}`);
            booking.attendanceLogs[logIndex].status = statusVal;
            booking.attendanceLogs[logIndex].markedBy = req.user.role === 'admin' ? 'admin' : (req.user.role === 'worker' ? 'worker' : 'user');
        } else {
            console.log(`[DEBUG] Pushing new log recorded as ${statusVal}`);
            booking.attendanceLogs.push({
                date: attendanceDate,
                status: statusVal,
                markedBy: req.user.role === 'admin' ? 'admin' : (req.user.role === 'worker' ? 'worker' : 'user')
            });
        }

        // CRITICAL: Mongoose needs this to detect subdocument changes in arrays
        booking.markModified('attendanceLogs');
        const updatedBooking = await booking.save();
        console.log(`[DEBUG] Save successful. Logs count: ${updatedBooking.attendanceLogs.length}`);

        res.json({
            message: 'Attendance marked',
            booking: updatedBooking,
            record: attendanceRecord
        });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get attendance for a booking
// @route   GET /api/attendance/booking/:bookingId
// @access  Private
const getBookingAttendance = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check ownership (assigned worker) or admin
        // Find worker profile for current user
        const workerProfile = await Worker.findOne({ userId: req.user._id });

        const isAssignedWorker = workerProfile && booking.assignedWorker && booking.assignedWorker.toString() === workerProfile._id.toString();
        const isCustomer = booking.user && booking.user.toString() === req.user._id.toString();

        if (req.user.role !== 'admin' && !isAssignedWorker && !isCustomer) {
            return res.status(401).json({ message: 'Unauthorized access to attendance logs' });
        }

        const nowIST_get = new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        const today = new Date(nowIST_get);
        today.setUTCHours(0, 0, 0, 0);

        // Merge synthetic "Absent" for missed past dates
        const validDates = getValidAttendanceDates(booking);
        const records = [...attendance];

        validDates.forEach(vd => {
            const vDate = new Date(vd);
            vDate.setHours(0, 0, 0, 0);

            // If date is in the past AND not in attendance records, add as virtual absent
            if (vDate.getTime() < today.getTime()) {
                const alreadyExists = records.some(r => {
                    const rDate = new Date(r.date);
                    rDate.setHours(0, 0, 0, 0);
                    return rDate.getTime() === vDate.getTime();
                });

                if (!alreadyExists) {
                    records.push({
                        date: vDate,
                        status: 'absent',
                        synthetic: true, // Flag for UI if needed
                        booking: booking._id
                    });
                }
            }
        });

        // Sort by date descending
        records.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(records);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get worker's attendance history
// @route   GET /api/attendance/worker
// @access  Private
const getWorkerAttendance = async (req, res) => {
    try {
        const workerProfile = await Worker.findOne({ userId: req.user._id });

        if (!workerProfile) {
            return res.status(404).json({ message: 'Worker profile not found' });
        }

        const attendanceRaw = await Attendance.find({ worker: workerProfile._id })
            .populate('booking', 'serviceType date')
            .sort({ date: -1 });

        // Filter out orphans
        const attendance = attendanceRaw.filter(a => a.booking !== null);

        res.json(attendance);
    } catch (error) {
        console.error('Error fetching worker attendance:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get valid attendance dates for a booking
// @route   GET /api/attendance/valid-dates/:bookingId
// @access  Private
const getValidDates = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!bookingId || bookingId === 'undefined' || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid or missing Booking ID' });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const validDates = getValidAttendanceDates(booking);
        const isActive = isServiceActive(booking);

        // Get existing attendance records
        const attendanceRecords = await Attendance.find({ booking: req.params.bookingId });

        const nowIST_valid = new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        const today = new Date(nowIST_valid);
        today.setUTCHours(0, 0, 0, 0);

        const markedDates = attendanceRecords.map(a => ({
            date: a.date,
            status: a.status
        }));

        // Add synthetic "Absent" or "Not Marked" for missed dates
        validDates.forEach(vd => {
            const vDate = new Date(vd);
            vDate.setUTCHours(0, 0, 0, 0);
            const vDateStr = vDate.toISOString().split('T')[0];
            const todayStr = today.toISOString().split('T')[0];

            if (vDateStr <= todayStr) {
                const alreadyExists = markedDates.some(m => {
                    const mDate = new Date(m.date);
                    mDate.setUTCHours(0, 0, 0, 0);
                    return mDate.toISOString().split('T')[0] === vDateStr;
                });

                if (!alreadyExists) {
                    markedDates.push({
                        date: vDate,
                        status: vDateStr === todayStr ? 'not_marked' : 'absent',
                        synthetic: true
                    });
                }
            }
        });

        res.json({
            frequency: booking.frequency,
            weeklyDays: booking.weeklyDays || [],
            validDates,
            markedDates,
            isActive,
            startDate: booking.startDate || booking.date,
            endDate: booking.endDate || booking.date
        });
    } catch (error) {
        console.error('Error fetching valid dates:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user's bookings with attendance info
// @route   GET /api/attendance/my-bookings
// @access  Private
const getMyBookingsWithAttendance = async (req, res) => {
    try {
        const bookings = await Booking.find({
            user: req.user._id,
            status: 'approved'
        }).populate('assignedWorker', 'name');

        const result = await Promise.all(bookings.map(async (booking) => {
            const isActive = isServiceActive(booking);
            const validDates = getValidAttendanceDates(booking);
            const attendanceRecords = await Attendance.find({ booking: booking._id });

            const nowIST_my = new Date(Date.now() + (5.5 * 60 * 60 * 1000));
            const today = new Date(nowIST_my);
            today.setUTCHours(0, 0, 0, 0);

            // Filter valid dates that are NOT in the future
            const historicalValidDates = validDates.filter(d => {
                const check = new Date(d);
                check.setUTCHours(0, 0, 0, 0);
                return check.getTime() <= today.getTime();
            });

            // "Auto-Absent" logic: If a record exists as present, count it. 
            // Otherwise, if the date has passed (it's in historicalValidDates), count it as absent.
            const presentDays = attendanceRecords.filter(a => a.status === 'present').length;
            const totalMarkedRecords = attendanceRecords.length;

            // Any historical valid date that doesn't have a 'present' record is effectively an absence
            const totalAbsents = historicalValidDates.length - presentDays;

            const todayAttendance = attendanceRecords.find(a => {
                const aDate = new Date(a.date);
                aDate.setUTCHours(0, 0, 0, 0);
                return aDate.getTime() === today.getTime();
            });

            return {
                _id: booking._id,
                serviceType: booking.serviceType,
                frequency: booking.frequency,
                weeklyDays: booking.weeklyDays,
                startDate: booking.startDate || booking.date,
                endDate: booking.endDate || booking.date,
                assignedWorker: booking.assignedWorker,
                isActive,
                canMarkToday: isActive && isValidAttendanceDate(booking, today),
                todayStatus: todayAttendance?.status || null,
                totalValidDays: validDates.length,
                markedDays: totalMarkedRecords,
                presentDays,
                absentDays: totalAbsents
            };
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching bookings with attendance:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Download Attendance as PDF
// @route   GET /api/attendance/booking/:bookingId/download-pdf
// @access  Private
const downloadAttendancePDF = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!bookingId || bookingId === 'undefined' || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid or missing Booking ID' });
        }

        const booking = await Booking.findById(bookingId).populate('user', 'name phone');
        const attendance = await Attendance.find({ booking: bookingId })
            .sort({ date: 1 });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // --- Synthesis Logic ---
        const nowIST_pdf = new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        const todayStr = nowIST_pdf.toISOString().split('T')[0];
        const validDates = getValidAttendanceDates(booking);

        // Match existing records
        const attendanceMap = new Map();
        attendance.forEach(a => {
            attendanceMap.set(new Date(a.date).toISOString().split('T')[0], a);
        });

        // Combine real and synthetic
        let combinedRecords = [...attendance];
        validDates.forEach(vDate => {
            const vDateStr = vDate.toISOString().split('T')[0];
            // If missed and (past or today)
            if (!attendanceMap.has(vDateStr) && vDateStr <= todayStr) {
                combinedRecords.push({
                    date: vDate,
                    status: vDateStr === todayStr ? 'not_marked' : 'absent',
                    isSynthetic: true
                });
            }
        });
        combinedRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
        const allAttendance = combinedRecords;

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = `Attendance_${booking._id}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        const colors = {
            primary: '#2563eb',
            text: '#1e293b',
            secondary: '#64748b',
            light: '#f8fafc',
            border: '#e2e8f0',
            present: '#10b981',
            absent: '#ef4444'
        };

        // --- Header Section ---
        const logoPath = path.join(__dirname, '../../frontend/public/headerlogo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 45, { width: 100 });
        } else {
            doc.fontSize(18).fillColor(colors.primary).text('SafelyHands', 50, 50, { bold: true });
        }

        doc.fillColor(colors.text).fontSize(9)
            .text('SafelyHands Services Pvt Ltd', 350, 50, { align: 'right' })
            .text('Near Sai mandir Ramganga vihar', 350, 62, { align: 'right' })
            .text('MDA Moradabad 244001', 350, 74, { align: 'right' })
            .text('safelyhands@gmail.com', 350, 86, { align: 'right' })
            .text('+91 8218303038 / 7618341297', 350, 98, { align: 'right' });

        doc.moveTo(50, 115).lineTo(550, 115).strokeColor(colors.border).stroke();

        // --- Title & Summary ---
        doc.moveDown(1.5);
        doc.fillColor(colors.primary).fontSize(20).text('ATTENDANCE SHEET', 50, 130);

        doc.fillColor(colors.text).fontSize(9);
        doc.text(`Booking ID: ${booking._id}`, 50, 155);
        doc.text(`Service: ${booking.serviceType.toUpperCase()}`, 50, 168);
        doc.text(`Date Range: ${formatDateLocal(booking.startDate || booking.date)} - ${booking.endDate ? formatDateLocal(booking.endDate) : 'Present'}`, 50, 181);

        doc.fillColor(colors.secondary).fontSize(9).text('CUSTOMER:', 350, 155);
        doc.fillColor(colors.text).fontSize(11).text(booking.user.name, 350, 168, { bold: true });
        doc.fontSize(9).text(booking.user.phone, 350, 181);

        const docObj = doc; // needed for later

        // --- Stats Section ---
        const statsTop = 210;
        doc.rect(50, statsTop, 500, 35).fill(colors.light);

        const historicalValidDates = getValidAttendanceDates(booking).filter(d => {
            const check = new Date(d);
            check.setUTCHours(0, 0, 0, 0);
            return check.getTime() <= new Date(nowIST_pdf).setUTCHours(0, 0, 0, 0);
        });

        const present = attendance.filter(a => a.status === 'present').length;
        const absent = historicalValidDates.length - present;
        const total = historicalValidDates.length;

        doc.fillColor(colors.secondary).fontSize(8).text('TOTAL DAYS', 70, statsTop + 8);
        doc.fillColor(colors.text).fontSize(12).text(total.toString(), 70, statsTop + 18, { bold: true });

        doc.fillColor(colors.secondary).fontSize(8).text('PRESENT', 250, statsTop + 8);
        doc.fillColor(colors.present).fontSize(12).text(present.toString(), 250, statsTop + 18, { bold: true });

        doc.fillColor(colors.secondary).fontSize(8).text('ABSENT', 430, statsTop + 8);
        doc.fillColor(colors.absent).fontSize(12).text(absent.toString(), 430, statsTop + 18, { bold: true });

        // --- Attendance Table ---
        const tableTop = 260;
        doc.rect(50, tableTop, 500, 20).fill(colors.primary);
        doc.fillColor('#ffffff').fontSize(9).text('#', 60, tableTop + 6);
        doc.text('Date', 100, tableTop + 6);
        doc.text('Status', 250, tableTop + 6);
        doc.text('Day', 400, tableTop + 6);

        let currentY = tableTop + 25;
        allAttendance.forEach((record, index) => {
            if (currentY > 750) {
                doc.addPage();
                currentY = 50;
            }

            const itemDate = new Date(record.date);
            const isGray = index % 2 === 1;
            if (isGray) doc.rect(50, currentY - 5, 500, 20).fill('#f8fafc');

            doc.fillColor(colors.text).fontSize(9).text((index + 1).toString(), 60, currentY);
            doc.text(formatDateLocal(record.date), 100, currentY);

            const statusColor = record.status === 'present' ? colors.present : colors.absent;
            doc.fillColor(statusColor).text(record.status.toUpperCase(), 250, currentY, { bold: true });

            doc.fillColor(colors.secondary).text(itemDate.toLocaleDateString('en-US', { weekday: 'long' }), 400, currentY);

            currentY += 20;
        });

        // --- Footer ---
        doc.fontSize(8).fillColor(colors.secondary).text(`Generated on ${formatDateLocal(new Date())} ${new Date().toLocaleTimeString()} | SafelyHands Management System`, 50, 780, { align: 'center', width: 500 });

        doc.end();

    } catch (error) {
        console.error('Error generating attendance PDF:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Download Attendance as CSV
// @route   GET /api/attendance/booking/:bookingId/download-csv
// @access  Private
const downloadAttendanceCSV = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!bookingId || bookingId === 'undefined' || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid or missing Booking ID' });
        }

        const booking = await Booking.findById(bookingId).populate('user', 'name');
        const attendance = await Attendance.find({ booking: bookingId })
            .sort({ date: 1 });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check ownership or admin
        if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const tempFilePath = path.join(__dirname, `../../uploads/attendance_${booking._id}.csv`);

        // Ensure uploads directory exists
        if (!fs.existsSync(path.join(__dirname, '../../uploads'))) {
            fs.mkdirSync(path.join(__dirname, '../../uploads'));
        }

        const csvWriter = createObjectCsvWriter({
            path: tempFilePath,
            header: [
                { id: 'date', title: 'DATE' },
                { id: 'status', title: 'STATUS' },
                { id: 'markedBy', title: 'MARKED_BY' }
            ]
        });

        // Synthesis Logic
        const nowIST_csv = new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        const todayStr = nowIST_csv.toISOString().split('T')[0];
        const validDates = getValidAttendanceDates(booking);
        const attendanceMap = new Map();
        attendance.forEach(a => attendanceMap.set(new Date(a.date).toISOString().split('T')[0], a));

        let combinedRecords = [...attendance];
        validDates.forEach(vDate => {
            const vDateStr = vDate.toISOString().split('T')[0];
            if (!attendanceMap.has(vDateStr) && vDateStr <= todayStr) {
                combinedRecords.push({
                    date: vDate,
                    status: vDateStr === todayStr ? 'not_marked' : 'absent'
                });
            }
        });
        combinedRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

        const records = combinedRecords.map(a => ({
            date: formatDateLocal(a.date),
            status: a.status.toUpperCase(),
            markedBy: a.markedBy ? 'Yes' : 'No'
        }));

        await csvWriter.writeRecords(records);

        res.download(tempFilePath, `Attendance_${booking._id}.csv`, (err) => {
            if (err) {
                console.error('Error downloading CSV:', err);
            }
            // Delete temp file after download
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        });

    } catch (error) {
        console.error('Error generating attendance CSV:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all attendance for admin with filters
// @route   GET /api/attendance/admin/all
// @access  Private (Admin Only)
const getAdminAttendance = async (req, res) => {
    try {
        const { workerId, serviceType, startDate, endDate } = req.query;
        let query = {};

        // Parse date range (Defaulting to "Today" in IST)
        const nowIST_admin = new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        const start = startDate ? new Date(startDate) : nowIST_admin;
        start.setUTCHours(0, 0, 0, 0);
        const end = endDate ? new Date(endDate) : nowIST_admin;
        end.setUTCHours(23, 59, 59, 999);

        // Define criteria for bookings to check
        let bookingCriteria = {
            status: { $in: ['approved', 'completed'] },
            startDate: { $lte: end }
        };

        if (serviceType) {
            bookingCriteria.serviceType = { $regex: new RegExp(serviceType, 'i') };
        }
        if (workerId) {
            bookingCriteria.assignedWorker = workerId;
        }

        const activeBookings = await Booking.find(bookingCriteria)
            .populate('user', 'name')
            .populate('assignedWorker', 'name email');

        // Fetch existing attendance records in range
        if (workerId) query.worker = workerId;
        if (serviceType) {
            query.booking = { $in: activeBookings.map(b => b._id) };
        }
        query.date = { $gte: start, $lte: end };

        const existingAttendanceRaw = await Attendance.find(query)
            .populate('worker', 'name email')
            .populate({
                path: 'booking',
                select: 'serviceType user address frequency startDate endDate weeklyDays',
                populate: { path: 'user', select: 'name' }
            });

        // Filter out orphans (records where booking or worker is null/deleted)
        const existingAttendance = existingAttendanceRaw.filter(a => a.booking !== null && a.worker !== null);
        const orphanCount = existingAttendanceRaw.length - existingAttendance.length;
        if (orphanCount > 0) {
            console.log(`[DATA INTEGRITY] Filtered out ${orphanCount} orphaned attendance records for Admin UI`);
        }

        // Map existing attendance by bookingId_date
        const attendanceMap = new Map();
        existingAttendance.forEach(a => {
            if (a.booking) {
                const dateStr = new Date(a.date).toISOString().split('T')[0];
                attendanceMap.set(`${a.booking._id}_${dateStr}`, a);
            }
        });

        // Synthesize results
        let finalResults = [...existingAttendance];
        // Using +5:30 offset for India to correctly identify "Today"
        const todayStr = nowIST_admin.toISOString().split('T')[0];

        activeBookings.forEach(booking => {
            const validDates = getValidAttendanceDates(booking);
            validDates.forEach(vDate => {
                // Only look at dates within requested range
                if (vDate >= start && vDate <= end) {
                    const vDateStr = vDate.toISOString().split('T')[0];
                    const key = `${booking._id}_${vDateStr}`;

                    // If not already in real attendance
                    if (!attendanceMap.has(key)) {
                        // If it's today
                        if (vDateStr === todayStr) {
                            finalResults.push({
                                _id: `synthetic_${key}`,
                                booking: booking,
                                worker: booking.assignedWorker,
                                date: vDate,
                                status: 'not_marked', // Virtual "Pending" for today
                                isSynthetic: true,
                                markedBy: 'system'
                            });
                        }
                        // If it's in the past
                        else if (vDateStr < todayStr) {
                            finalResults.push({
                                _id: `synthetic_${key}`,
                                booking: booking,
                                worker: booking.assignedWorker,
                                date: vDate,
                                status: 'absent', // Default for missed days
                                isSynthetic: true,
                                markedBy: 'system'
                            });
                        }
                    }
                }
            });
        });

        // Sort by date descending
        finalResults.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(finalResults);
    } catch (error) {
        console.error('Error fetching admin attendance:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Download Aggregated Attendance Report for Admin
// @route   GET /api/attendance/admin/download-report
// @access  Private (Admin Only)
const downloadAdminReportPDF = async (req, res) => {
    try {
        const { workerId, serviceType, startDate, endDate } = req.query;
        let query = {};

        // 1. Parse dates consistently
        const now = new Date();
        const start = startDate ? new Date(startDate) : new Date(now);
        start.setUTCHours(0, 0, 0, 0);
        const end = endDate ? new Date(endDate) : new Date(now);
        end.setUTCHours(23, 59, 59, 999);

        // 2. Fetch Active Bookings to synthesize from
        let bookingCriteria = {
            status: { $in: ['approved', 'completed'] },
            startDate: { $lte: end }
        };
        if (serviceType) bookingCriteria.serviceType = { $regex: new RegExp(serviceType, 'i') };
        if (workerId) bookingCriteria.assignedWorker = workerId;

        const activeBookings = await Booking.find(bookingCriteria)
            .populate('user', 'name')
            .populate('assignedWorker', 'name email');

        // 3. Fetch Real Attendance
        if (workerId) query.worker = workerId;
        if (serviceType) query.booking = { $in: activeBookings.map(b => b._id) };
        query.date = { $gte: start, $lte: end };

        const existingAttendanceRaw = await Attendance.find(query)
            .populate('worker', 'name email')
            .populate({
                path: 'booking',
                select: 'serviceType user address frequency startDate endDate weeklyDays',
                populate: { path: 'user', select: 'name' }
            });

        // Filter out orphans
        const existingAttendance = existingAttendanceRaw.filter(a => a.booking !== null && a.worker !== null);
        const orphanCount = existingAttendanceRaw.length - existingAttendance.length;
        if (orphanCount > 0) {
            console.log(`[DATA INTEGRITY] Filtered out ${orphanCount} orphaned attendance records for Admin PDF Report`);
        }

        const attendanceMap = new Map();
        existingAttendance.forEach(a => {
            if (a.booking) {
                const dateStr = new Date(a.date).toISOString().split('T')[0];
                attendanceMap.set(`${a.booking._id}_${dateStr}`, a);
            }
        });

        // 4. Merge with Synthetic Records
        let combinedRecords = [...existingAttendance];
        const todayStr = now.toISOString().split('T')[0];

        activeBookings.forEach(booking => {
            const validDates = getValidAttendanceDates(booking);
            validDates.forEach(vDate => {
                if (vDate >= start && vDate <= end) {
                    const vDateStr = vDate.toISOString().split('T')[0];
                    if (!attendanceMap.has(`${booking._id}_${vDateStr}`) && vDateStr <= todayStr) {
                        combinedRecords.push({
                            booking: booking,
                            worker: booking.assignedWorker,
                            date: vDate,
                            status: vDateStr === todayStr ? 'not_marked' : 'absent',
                            isSynthetic: true
                        });
                    }
                }
            });
        });

        combinedRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
        const attendance = combinedRecords;

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        res.setHeader('Content-disposition', `attachment; filename="Attendance_Report.pdf"`);
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);

        const colors = { primary: '#2563eb', text: '#1e293b', secondary: '#64748b', light: '#f8fafc', border: '#e2e8f0' };

        // Header (Same as others)
        const logoPath = path.join(__dirname, '../../frontend/public/headerlogo.png');
        if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 45, { width: 100 });

        doc.fillColor(colors.text).fontSize(9)
            .text('SafelyHands Services Pvt Ltd', 350, 50, { align: 'right' })
            .text('Near Sai mandir Ramganga vihar', 350, 62, { align: 'right' })
            .text('MDA Moradabad 244001', 350, 74, { align: 'right' })
            .text('safelyhands@gmail.com', 350, 86, { align: 'right' })
            .text('+91 8218303038 / 7618341297', 350, 98, { align: 'right' });

        doc.moveTo(50, 115).lineTo(550, 115).strokeColor(colors.border).stroke();

        doc.moveDown(1.5);
        doc.fillColor(colors.primary).fontSize(20).text('CONSOLIDATED ATTENDANCE REPORT', 50, 130);

        doc.fillColor(colors.text).fontSize(10);
        doc.text(`Generated on: ${formatDateLocal(new Date())} ${new Date().toLocaleTimeString()}`, 50, 160);

        // Count total valid days in period vs records
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let totalHistoricalValidDays = 0;

        // Simple distinct count of present days in the query result
        const presentCount = attendance.filter(a => a.status === 'present').length;

        if (startDate || endDate) doc.text(`Period: ${startDate ? formatDateLocal(startDate) : 'Start'} to ${endDate ? formatDateLocal(endDate) : 'Today'}`, 50, 175);

        // Table
        let currentY = 210;
        doc.rect(50, currentY, 500, 20).fill(colors.primary);
        doc.fillColor('#ffffff').fontSize(8).text('Date', 60, currentY + 6);
        doc.text('Worker', 130, currentY + 6);
        doc.text('Customer', 230, currentY + 6);
        doc.text('Service', 330, currentY + 6);
        doc.text('Status', 450, currentY + 6);

        currentY += 25;
        attendance.forEach((log, index) => {
            if (currentY > 750) {
                doc.addPage();
                currentY = 50;
            }
            if (index % 2 === 1) doc.rect(50, currentY - 5, 500, 20).fill('#f8fafc');

            doc.fillColor(colors.text).fontSize(8);
            doc.text(formatDateLocal(log.date), 60, currentY);
            doc.text(log.worker?.name || 'N/A', 130, currentY);
            doc.text(log.booking?.user?.name || 'Guest', 230, currentY);
            doc.text(log.booking?.serviceType || 'N/A', 330, currentY);
            doc.fillColor(log.status === 'present' ? '#10b981' : '#ef4444').text(log.status.toUpperCase(), 450, currentY, { bold: true });

            currentY += 20;
        });

        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    markAttendance,
    getBookingAttendance,
    getWorkerAttendance,
    getValidDates,
    getMyBookingsWithAttendance,
    downloadAttendancePDF,
    downloadAttendanceCSV,
    getAdminAttendance,
    downloadAdminReportPDF
};
