// models/schemas/orderSchema.js
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceOffering' },
    serviceName: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    pricePerItem: { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderIdString: {
        type: String,
        // required: true, // <--- REMOVE THIS or comment it out
        unique: true,   // Keep this for data integrity
        index: true,    // Good for performance on unique fields
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tailor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tailorName: { type: String, required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending',
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending',
    },
    shippingAddress: {
        address: String,
        city: String,
        postalCode: String,
        country: String,
    },
    orderDate: { type: Date, default: Date.now },
    estimatedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    notesToTailor: { type: String },
    cancellationReason: { type: String },
    trackingNumber: { type: String },
    linkedMeasurementProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'MeasurementProfile' },
}, { timestamps: true });

// Helper to generate user-friendly Order ID
orderSchema.pre('save', async function (next) {
    // Ensure this only runs for new documents and if orderIdString is not already set
    // (e.g., if it was somehow set manually or in a rare edge case)
    if (this.isNew && !this.orderIdString) {
        try {
            // Use this.constructor to refer to the current model, safer than mongoose.model('Order') within the schema file itself
            // especially if the model name changes or during complex Mongoose initializations.
            const count = await this.constructor.countDocuments();
            this.orderIdString = `ORD${new Date().getFullYear()}${(count + 1).toString().padStart(5, '0')}`;
            console.log(`Generated orderIdString in pre-save: ${this.orderIdString}`);
        } catch (error) {
            console.error("Error generating orderIdString in pre-save hook:", error);
            // If ID generation is critical and fails, stop the save operation
            return next(error);
        }
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;