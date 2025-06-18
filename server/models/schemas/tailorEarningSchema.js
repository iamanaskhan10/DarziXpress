// models/schemas/tailorEarningSchema.js
import mongoose from 'mongoose';

const tailorEarningSchema = new mongoose.Schema({
    tailor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true,
        index: true,
    },
    orderIdString: {
        type: String,
        required: true,
    },
    serviceNames: [{
        type: String,
    }],
    earnedAmount: {
        type: Number,
        required: true,
    },
    completionDate: {
        type: Date,
        required: true,
        default: Date.now,
    },

    // 🔽 Enhanced Fields

    // Breakdown of amounts (platform fee, tax, net income)
    platformFee: {
        type: Number,
        default: 5, // if fixed
    },
    taxDeducted: {
        type: Number,
        default: 0,
    },
    netEarning: {
        type: Number,
        default: function () {
            return this.earnedAmount - (this.platformFee || 0) - (this.taxDeducted || 0);
        },
    },

    // Flags for payout and visibility
    isPaidOut: {
        type: Boolean,
        default: false,
    },
    payoutDate: {
        type: Date,
    },

    // For filtering and grouping in reports
    earningMonth: {
        type: String, // e.g., "2025-06"
        index: true,
    },
    earningYear: {
        type: Number, // e.g., 2025
        index: true,
    },

    // For future auditing or admin notes
    adminNote: {
        type: String,
        trim: true,
    }

}, { timestamps: true });

// Pre-save hook to auto-fill earningMonth and earningYear
tailorEarningSchema.pre('save', function (next) {
    const date = this.completionDate || new Date();
    this.earningMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    this.earningYear = date.getFullYear();
    next();
});

const TailorEarning = mongoose.model('TailorEarning', tailorEarningSchema);
export default TailorEarning;
