// routes/earningRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import TailorEarning from '../models/schemas/tailorEarningSchema.js';
// import Order from '../models/schemas/orderSchema.js'; // Not strictly needed if all info is on TailorEarning

const router = express.Router();

// @route   GET /api/earnings/tailor
// @desc    Get earnings data for the logged-in tailor
// @access  Private (Tailor)
router.get('/tailor', authMiddleware, async (req, res) => {
    if (!req.user || req.user.userType !== 'tailor') {
        return res.status(403).json({ message: 'Access denied. Only for tailors.' });
    }

    const { timeFilter } = req.query;
    const tailorId = req.user.userId;

    try {
        const query = {
            tailor: tailorId,
        };

        const now = new Date();
        let startDate;

        if (timeFilter) {
            switch (timeFilter) {
                case 'This Week':
                    const firstDayOfWeek = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
                    startDate = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek); // Corrected to use current year/month
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'This Month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'This Year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
            }
            if (startDate) {
                query.completionDate = { $gte: startDate };
            }
        }

        const earningsRecords = await TailorEarning.find(query)
            .select('orderIdString serviceNames earnedAmount completionDate order') // Added 'order' to link back if needed
            .sort({ completionDate: -1 });

        // This variable name was 'totalTailorEarningsInPeriod'
        const totalTailorEarningsInPeriod = earningsRecords.reduce((sum, record) => sum + (record.earnedAmount || 0), 0);

        res.json({
            earnings: earningsRecords,
            // CORRECTED VARIABLE NAME HERE:
            totalEarningsInPeriod: totalTailorEarningsInPeriod, // <--- FIX IS HERE
            filterApplied: timeFilter || 'All Time'
        });

    } catch (error) {
        console.error("Error fetching tailor earnings:", error);
        res.status(500).json({ message: 'Server error fetching earnings data.' });
    }
});

export default router;