import mongoose from 'mongoose';

const customerSessionSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }
});

customerSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const CustomerSession = mongoose.model('CustomerSession', customerSessionSchema);

export default CustomerSession;
