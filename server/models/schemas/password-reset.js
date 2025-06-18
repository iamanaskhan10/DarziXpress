import mongoose from 'mongoose';
import crypto from 'crypto';

const PasswordResetSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true,
    },
    uuid: {
        type: String,
        required: true,
        default: () => crypto.randomUUID(),
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
});

PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordReset = mongoose.model('PasswordReset', PasswordResetSchema);

PasswordReset.syncIndexes().catch(console.error);

export default PasswordReset;
