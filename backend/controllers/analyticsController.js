const Booking = require('../models/Booking');
const User = require('../models/User');
const Worker = require('../models/Worker');

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/analytics
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Counts
        const totalBookings = await Booking.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'customer' });
        const totalWorkers = await Worker.countDocuments();

        // 2. Revenue (Mock: Assume fixed price or use totalAmount if available)
        // In real app, sum totalAmount field.
        const paidBookings = await Booking.find({ paymentStatus: 'paid' });
        const totalRevenue = paidBookings.reduce((acc, curr) => acc + (curr.totalAmount || 5000), 0);
        // Defaulting to 5000 if totalAmount not set in older docs

        // 3. Bookings by Status
        const bookingsByStatus = await Booking.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // 4. Bookings by Service Type
        const bookingsByService = await Booking.aggregate([
            {
                $lookup: {
                    from: 'subcategories',
                    localField: 'items.subCategory',
                    foreignField: '_id',
                    as: 'subCategoryDetails'
                }
            },
            {
                $lookup: {
                    from: 'services',
                    localField: 'subCategoryDetails.service',
                    foreignField: '_id',
                    as: 'serviceDetails'
                }
            },
            {
                $project: {
                    serviceName: {
                        $ifNull: [
                            "$serviceType",
                            { $arrayElemAt: ["$serviceDetails.title", 0] },
                            "Other"
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$serviceName",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 5. Recent Activity with proper service name fallback
        const rawRecentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name')
            .populate({
                path: 'items.subCategory',
                populate: { path: 'service', select: 'title' }
            });

        const recentBookings = rawRecentBookings.map(b => ({
            _id: b._id,
            user: b.user,
            status: b.status,
            createdAt: b.createdAt,
            serviceType: b.serviceType || (b.items?.[0]?.subCategory?.service?.title) || 'Other'
        }));

        // 6. Monthly Revenue (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // Go back 5 months to include current month (total 6)

        const monthlyRevenue = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: { $ifNull: ["$totalAmount", 5000] } }
                }
            }
        ]);

        // Generate last 6 months array with 0 values
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const last6Months = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            last6Months.push({
                monthIndex: d.getMonth() + 1,
                name: monthNames[d.getMonth()],
                total: 0
            });
        }

        // Merge actual data
        const formattedMonthlyRevenue = last6Months.map(m => {
            const found = monthlyRevenue.find(r => r._id === m.monthIndex);
            return {
                name: m.name,
                total: found ? found.total : 0
            };
        });

        // Fill in missing months with 0
        // (Optional: for a smoother chart, we might want to fill gaps, but let's start with real data first)

        res.json({
            stats: {
                totalBookings,
                totalUsers,
                totalWorkers,
                totalRevenue
            },
            charts: {
                bookingsByStatus,
                bookingsByService,
                monthlyRevenue: formattedMonthlyRevenue
            },
            recentActivity: recentBookings
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDashboardStats
};
