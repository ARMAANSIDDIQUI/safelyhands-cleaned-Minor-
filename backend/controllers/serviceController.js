const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Attendance = require('../models/Attendance');
const SubCategory = require('../models/SubCategory');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
    try {
        const services = await Service.find({}).populate('subcategories');
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (service) {
            res.json(service);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single service by slug
// @route   GET /api/services/slug/:slug
// @access  Public
const getServiceBySlug = async (req, res) => {
    try {
        const service = await Service.findOne({ slug: req.params.slug });
        if (service) {
            res.json(service);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res) => {
    try {
        const { title, slug, subtitle, description, basePrice, minPrice, maxPrice, features, imageUrl, video, icon, gradientFrom, gradientTo, rating, reviewCount, badge, category, shift, gender, availability, verificationStatus, subcategories, questions } = req.body;

        const serviceExists = await Service.findOne({ slug });
        if (serviceExists) {
            return res.status(400).json({ message: 'Service with this slug already exists' });
        }

        const service = await Service.create({
            title,
            slug,
            description,
            basePrice: basePrice || 0,
            minPrice: minPrice || 0,
            maxPrice: maxPrice || 0,
            features: features || [],
            imageUrl,
            video,
            icon,
            subtitle,
            gradientFrom: gradientFrom || 'blue-100',
            gradientTo: gradientTo || 'blue-200',
            rating: rating || 4.8,
            reviewCount: reviewCount || 0,
            badge,
            category,
            shift,
            gender: gender || 'Both',
            availability,
            verificationStatus,
            subcategories: subcategories || [],
            questions: questions || []
        });

        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            // Update fields if they are present in req.body
            const fieldsToUpdate = [
                'title', 'subtitle', 'description', 'basePrice', 'minPrice', 'maxPrice',
                'features', 'imageUrl', 'video', 'icon', 'gradientFrom', 'gradientTo',
                'isActive', 'rating', 'reviewCount', 'badge', 'category', 'shift',
                'gender', 'availability', 'verificationStatus', 'subcategories', 'questions'
            ];

            fieldsToUpdate.forEach(field => {
                if (req.body[field] !== undefined) {
                    service[field] = req.body[field];
                }
            });

            const updatedService = await service.save();
            res.json(updatedService);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            // 1. Delete associated SubCategories
            const subCatResult = await SubCategory.deleteMany({ service: service._id });
            console.log(`[CASCADE DELETE] Removed ${subCatResult.deletedCount} subcategories for service ${service.title}`);

            // 2. Identify and delete associated Bookings
            // Note: Booking schema stores serviceType as a string (title), but we should also check by subCategory references if possible.
            // For now, we'll use the service title as is done elsewhere in the app.
            const bookings = await Booking.find({ serviceType: service.title });
            const bookingIds = bookings.map(b => b._id);

            // 3. Delete attendance for these bookings
            const attendanceResult = await Attendance.deleteMany({ booking: { $in: bookingIds } });
            console.log(`[CASCADE DELETE] Removed ${attendanceResult.deletedCount} attendance records for service ${service.title}`);

            // 4. Delete the bookings themselves
            const bookingResult = await Booking.deleteMany({ _id: { $in: bookingIds } });
            console.log(`[CASCADE DELETE] Removed ${bookingResult.deletedCount} bookings for service ${service.title}`);

            // 5. Delete the service
            await service.deleteOne();

            res.json({
                message: 'Service and all associated data (subcategories, bookings, attendance) removed',
                deletedCount: {
                    subCategories: subCatResult.deletedCount,
                    bookings: bookingResult.deletedCount,
                    attendance: attendanceResult.deletedCount
                }
            });
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get subcategories for a service
// @route   GET /api/services/:id/subcategories
// @access  Public
const getSubCategories = async (req, res) => {
    try {
        const subcategories = await SubCategory.find({ service: req.params.id });
        res.json(subcategories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSubCategoryById = async (req, res) => {
    try {
        const subcategory = await SubCategory.findById(req.params.id);
        if (subcategory) {
            res.json(subcategory);
        } else {
            res.status(404).json({ message: 'SubCategory not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createSubCategory = async (req, res) => {
    try {
        const { service } = req.body;
        // Verify service exists
        const serviceObj = await Service.findById(service);
        if (!serviceObj) return res.status(404).json({ message: "Service not found" });

        const subCategory = await SubCategory.create(req.body);
        res.status(201).json(subCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSubCategory = async (req, res) => {
    try {
        const subCategory = await SubCategory.findById(req.params.id);
        if (subCategory) {
            Object.assign(subCategory, req.body);
            const updated = await subCategory.save();
            res.json(updated);
        } else {
            res.status(404).json({ message: 'SubCategory not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSubCategory = async (req, res) => {
    try {
        const subCategory = await SubCategory.findById(req.params.id);
        if (subCategory) {
            // Note: A booking can contain multiple items. If we delete a subcategory,
            // we should technically decide if we want to delete bookings containing it.
            // However, usually subcategories are "deactivated" rather than deleted if they have bookings.
            // For now, we'll just delete the subcategory as requested.
            await subCategory.deleteOne();
            res.json({ message: 'SubCategory removed' });
        } else {
            res.status(404).json({ message: 'SubCategory not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllSubCategories = async (req, res) => {
    try {
        const subcategories = await SubCategory.find({}).populate('service', 'title');
        res.json(subcategories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getServices,
    getServiceById,
    getServiceBySlug,
    createService,
    updateService,
    deleteService,
    getSubCategories,
    getSubCategoryById,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    getAllSubCategories
};
