// models/schemas/platformEarningSchema.js
import mongoose from 'mongoose';

const platformEarningSchema = new mongoose.Schema({
    order: { // The completed order that generated this earning
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true, // One earning record per order
    },
    orderIdString: { type: String, required: true },
    tailor: { // The tailor involved in the order
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    commissionAmount: { // The fixed commission (PKR 5)
        type: Number,
        required: true,
        default: 5,
    },
    earnedAt: { // When the order was completed and commission earned
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const PlatformEarning = mongoose.model('PlatformEarning', platformEarningSchema);

export default PlatformEarning;