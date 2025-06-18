// models/schemas/measurementProfileSchema.js
import mongoose from 'mongoose';

const measurementDetailSchema = new mongoose.Schema({
    chest: { type: String },
    waist: { type: String },
    shoulder: { type: String },
    sleeveLength: { type: String },
    inseam: { type: String },
    hip: { type: String },
    thigh: { type: String },
    length: { type: String }, // For items like Sherwani, Kurta
    notes: { type: String },
    // Add other common measurements as needed
}, { _id: false }); // No separate ID for subdocument by default

const measurementProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Index for faster queries by user
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    details: measurementDetailSchema,
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Update lastUpdated before saving
measurementProfileSchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
});

const MeasurementProfile = mongoose.model('MeasurementProfile', measurementProfileSchema);

export default MeasurementProfile;