import mongoose from 'mongoose';
import slugify from 'slugify';

const serviceOfferingSchema = new mongoose.Schema({
    tailor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    tailorName: {
        type: String,
        required: true,
    },
    tailorImageUrl: { // Optional, denormalized from User model
        type: String,
        default: '', 
    },
    serviceName: {
        type: String,
        required: [true, "Service name is required."],
        trim: true,
        index: true,
    },
    slug: { // SEO-friendly URL slug generated from serviceName
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Service description is required."],
        trim: true,
    },
    category: {
        type: String,
        required: [true, "Service category is required."],
        trim: true,
        index: true,
    },
    price: {
        type: Number,
        required: [true, "Price is required."],
    },
    priceType: {
        type: String,
        default: "Fixed",
    },
    estimatedDuration: {
        type: String,
    },
    location: {
        type: String,
        required: [true, "Location is required."],
        trim: true,
        index: true,
    },
    images: [{
        type: String,
    }],
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    reviewCount: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

// Create a text index for full-text search
serviceOfferingSchema.index({
    serviceName: 'text',
    description: 'text',
    category: 'text',
    tags: 'text',
    tailorName: 'text'
});

// Pre-save middleware to auto-generate slug
serviceOfferingSchema.pre('save', function (next) {
    if (this.isModified('serviceName') || !this.slug) {
        this.slug = slugify(this.serviceName, { lower: true, strict: true });
    }
    next();
});

const ServiceOffering = mongoose.model('ServiceOffering', serviceOfferingSchema);
export default ServiceOffering;
