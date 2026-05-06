const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');

// @desc    Get all workers
// @route   GET /api/workers
// @access  Public
const getWorkers = async (req, res) => {
    try {
        const workers = await Worker.find({});
        res.json(workers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single worker
// @route   GET /api/workers/:id
// @access  Public
const getWorkerById = async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id);
        if (worker) {
            res.json(worker);
        } else {
            res.status(404).json({ message: 'Worker not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a worker
// @route   POST /api/workers
// @access  Private/Admin
const createWorker = async (req, res) => {
    try {
        const { name, profession, experienceYears, imageUrl, bio } = req.body;

        if (!name || !profession) {
            return res.status(400).json({ message: 'Name and Profession are required' });
        }

        // Generate unique worker ID if not provided
        let workerId = req.body.workerId;
        if (!workerId) {
            const timestamp = Date.now().toString().slice(-6);
            const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
            workerId = `WRK-${timestamp}-${randomStr}`;
        }

        const worker = await Worker.create({
            name,
            profession,
            experienceYears,
            imageUrl,
            bio,
            workerId
        });

        res.status(201).json(worker);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a worker
// @route   PUT /api/workers/:id
// @access  Private/Admin
const updateWorker = async (req, res) => {
    try {
        const { name, profession, experienceYears, imageUrl, isAvailable, rating, numReviews, bio } = req.body;

        const worker = await Worker.findById(req.params.id);

        if (worker) {
            worker.name = name || worker.name;
            worker.profession = profession || worker.profession;
            worker.experienceYears = experienceYears || worker.experienceYears;
            worker.imageUrl = imageUrl || worker.imageUrl;
            worker.bio = bio || worker.bio;
            worker.isAvailable = isAvailable !== undefined ? isAvailable : worker.isAvailable;
            worker.rating = rating || worker.rating;
            worker.numReviews = numReviews || worker.numReviews;

            const updatedWorker = await worker.save();
            res.json(updatedWorker);
        } else {
            res.status(404).json({ message: 'Worker not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a worker
// @route   DELETE /api/workers/:id
// @access  Private/Admin
const deleteWorker = async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id);

        if (worker) {
            // Cascade delete attendance records
            const attendanceDeleteResult = await Attendance.deleteMany({ worker: req.params.id });
            console.log(`[CASCADE DELETE] Removed ${attendanceDeleteResult.deletedCount} attendance records for worker ${req.params.id}`);

            await worker.deleteOne();
            res.json({
                message: 'Worker and associated attendance records removed',
                deletedAttendanceCount: attendanceDeleteResult.deletedCount
            });
        } else {
            res.status(404).json({ message: 'Worker not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a worker with ID and optional email link
// @route   POST /api/workers/create-id
// @access  Private/Admin
const createWorkerWithId = async (req, res) => {
    try {
        const { name, profession, email } = req.body;
        const User = require('../models/User');
        const bcrypt = require('bcrypt');

        let userId = null;

        if (email) {
            let user = await User.findOne({ email });

            if (user) {
                // Update existing user to worker role
                user.role = 'worker';
                await user.save();
                userId = user._id;
            } else {
                // Create new user for worker
                const randomPassword = Math.random().toString(36).slice(-8);
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(randomPassword, salt);

                const newUser = await User.create({
                    name,
                    email,
                    password: hashedPassword,
                    role: 'worker'
                });
                userId = newUser._id;
            }
        }

        // Generate unique worker ID (e.g., WRK-170725)
        const timestamp = Date.now().toString().slice(-6);
        const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
        const workerId = `WRK-${timestamp}-${randomStr}`;

        const worker = await Worker.create({
            name,
            profession,
            workerId,
            userId,
            experienceYears: 0, // Default
            bio: "" // Default
        });

        res.status(201).json({
            message: 'Worker created with ID',
            workerId: worker.workerId,
            worker
        });
    } catch (error) {
        console.error("Create Worker ID Error:", error);
        res.status(500).json({ message: 'Server error creating worker ID: ' + error.message });
    }
};

// @desc    Get workers with availability status for a specific slot
// @route   GET /api/workers/availability
// @access  Private/Admin
const getWorkersWithAvailability = async (req, res) => {
    try {
        const { date, time, frequency } = req.query;
        const Booking = require('../models/Booking');

        if (!date || !time) {
            return res.status(400).json({ message: 'Date and time are required' });
        }

        const requestedDate = new Date(date);
        requestedDate.setHours(0, 0, 0, 0);

        const workers = await Worker.find({});
        const bookings = await Booking.find({
            status: 'approved',
            assignedWorker: { $ne: null }
        }).populate('assignedWorker');

        const workersWithStatus = workers.map(worker => {
            const workerBookings = bookings.filter(b =>
                b.assignedWorker && b.assignedWorker._id.toString() === worker._id.toString()
            );

            let isBusy = false;
            let conflict = null;

            for (const b of workerBookings) {
                const bDate = new Date(b.date);
                bDate.setHours(0, 0, 0, 0);

                // Check for exact time overlap
                if (b.time === time) {
                    if (b.frequency === 'Daily' || b.frequency === 'Live-in') {
                        isBusy = true;
                        conflict = b;
                        break;
                    }
                    if (bDate.getTime() === requestedDate.getTime()) {
                        isBusy = true;
                        conflict = b;
                        break;
                    }
                }

                // Live-in workers are busy all day
                if (b.frequency === 'Live-in' && bDate.getTime() === requestedDate.getTime()) {
                    isBusy = true;
                    conflict = b;
                    break;
                }
            }

            return {
                ...worker._doc,
                isAvailable: !isBusy,
                conflict: conflict ? {
                    serviceType: conflict.serviceType,
                    time: conflict.time,
                    frequency: conflict.frequency
                } : null,
                currentSchedule: workerBookings.map(b => ({
                    serviceType: b.serviceType,
                    time: b.time,
                    frequency: b.frequency,
                    date: b.date
                }))
            };
        });

        res.json(workersWithStatus);
    } catch (error) {
        console.error("Availability Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getWorkers,
    getWorkerById,
    createWorker,
    updateWorker,
    deleteWorker,
    createWorkerWithId,
    getWorkersWithAvailability
};
