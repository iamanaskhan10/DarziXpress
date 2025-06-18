// routes/adminStatsRoutes.js
import express from 'express';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js'; // Use your admin auth
import User from '../models/schemas/userSchema.js';
import Order from '../models/schemas/orderSchema.js'; // May not be needed if all info is in PlatformEarning
import PlatformEarning from '../models/schemas/platformEarningSchema.js';

const router = express.Router();

// @route   GET /api/admin/stats/overview
// @desc    Get overview stats for admin dashboard
// @access  Private (Admin)
router.get('/overview', adminAuthMiddleware, async (req, res) => {
    try {
        const totalCustomers = await User.countDocuments({ userType: 'customer' });
        const totalTailors = await User.countDocuments({ userType: 'tailor' });

        // Calculate total platform profit by summing up commissionAmount from PlatformEarning
        const profitAggregation = await PlatformEarning.aggregate([
            { $group: { _id: null, totalProfit: { $sum: "$commissionAmount" } } }
        ]);
        const totalPlatformProfit = profitAggregation.length > 0 ? profitAggregation[0].totalProfit : 0;

        res.json({
            totalPlatformProfit,
            totalCustomers,
            totalTailors,
        });
    } catch (error) {
        console.error("Error fetching admin overview stats:", error);
        res.status(500).json({ message: 'Server error fetching overview stats.' });
    }
});

// @route   GET /api/admin/stats/earnings-trend
// @desc    Get earnings trend data for admin dashboard chart
// @access  Private (Admin)
router.get('/earnings-trend', adminAuthMiddleware, async (req, res) => {
    try {
        // Aggregate platform earnings by month for the last 12 months (example)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const earningsData = await PlatformEarning.aggregate([
            { $match: { earnedAt: { $gte: twelveMonthsAgo } } }, // Filter for last 12 months
            {
                $group: {
                    _id: {
                        year: { $year: "$earnedAt" },
                        month: { $month: "$earnedAt" }
                    },
                    totalProfitInPeriod: { $sum: "$commissionAmount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            {
                $project: {
                    _id: 0, // Exclude the default _id group
                    period: { // Format as "MMM YYYY"
                        $concat: [
                            {
                                $arrayElemAt: [
                                    ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                                    "$_id.month"
                                ]
                            },
                            " ",
                            { $toString: "$_id.year" }
                        ]
                    },
                    profit: "$totalProfitInPeriod"
                }
            }
        ]);

        res.json(earningsData); // Format: [{ period: "May 2024", profit: 150 }, ...]
    } catch (error) {
        console.error("Error fetching admin earnings trend:", error);
        res.status(500).json({ message: 'Server error fetching earnings trend.' });
    }
});

export default router;