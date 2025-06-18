// routes/orderRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import Order from '../models/schemas/orderSchema.js';
import TailorEarning from '../models/schemas/tailorEarningSchema.js';
import PlatformEarning from '../models/schemas/platformEarningSchema.js';

const router = express.Router();

// Define the platform commission rate (e.g., 5%)
const PLATFORM_COMMISSION_RATE = 0.05;

// --- Specific string routes BEFORE dynamic parameter routes ---

// @route   GET /api/orders/my-orders
// @desc    Get all orders for the logged-in customer
// @access  Private (Customer)
router.get('/my-orders', authMiddleware, async (req, res) => {
    console.log('--- API Reached: GET /api/orders/my-orders ---');
    if (!req.user || req.user.userType !== 'customer') {
        return res.status(403).json({ message: 'Access denied. Only for customers.' });
    }
    try {
        const orders = await Order.find({ customer: req.user.userId })
            .populate('tailor', 'fullName')
            .sort({ orderDate: -1 });
        res.json(orders);
    } catch (error) {
        console.error("Error fetching customer orders (/my-orders):", error);
        res.status(500).json({ message: 'Server Error fetching customer orders' });
    }
});

// @route   GET /api/orders/my-orders/latest/:count
// @desc    Get latest orders summary for the logged-in customer (Customer Dashboard)
// @access  Private (Customer)
router.get('/my-orders/latest/:count', authMiddleware, async (req, res) => {
    console.log('--- API Reached: GET /api/orders/my-orders/latest/:count ---');
    if (!req.user || req.user.userType !== 'customer') {
        return res.status(403).json({ message: 'Access denied. Only for customers.' });
    }
    try {
        const count = parseInt(req.params.count) || 1;
        const latestOrders = await Order.find({ customer: req.user.userId })
            .sort({ orderDate: -1 })
            .limit(count)
            .select('orderIdString items status orderDate totalAmount');

        const activeCustomerOrderStatus = ['Pending', 'In Progress'];
        const activeOrdersCount = await Order.countDocuments({
            customer: req.user.userId,
            status: { $in: activeCustomerOrderStatus }
        });
        res.json({ latestOrders, activeOrdersCount });
    } catch (error) {
        console.error("Error fetching customer orders summary (/my-orders/latest):", error);
        res.status(500).json({ message: 'Server Error fetching customer orders summary' });
    }
});

// @route   GET /api/orders/tailor-orders
// @desc    Get all orders assigned to the logged-in tailor
// @access  Private (Tailor)
router.get('/tailor-orders', authMiddleware, async (req, res) => {
    console.log('--- API Reached: GET /api/orders/tailor-orders ---');
    if (!req.user || req.user.userType !== 'tailor') {
        return res.status(403).json({ message: 'Access denied. Only for tailors.' });
    }
    try {
        const orders = await Order.find({ tailor: req.user.userId })
            .populate('customer', 'fullName email')
            .sort({ orderDate: -1 });
        res.json(orders);
    } catch (error) {
        console.error("Error fetching tailor orders (/tailor-orders):", error);
        res.status(500).json({ message: 'Server Error fetching tailor orders' });
    }
});

// @route   GET /api/orders/tailor-summary
// @desc    Get order summary for the logged-in tailor (Tailor Dashboard)
// @access  Private (Tailor)
router.get('/tailor-summary', authMiddleware, async (req, res) => {
    console.log('--- API Reached: GET /api/orders/tailor-summary ---');
    if (!req.user || req.user.userType !== 'tailor') {
        return res.status(403).json({ message: 'Access denied. Only for tailors.' });
    }
    try {
        const tailorId = req.user.userId;
        const activeTailorOrderStatus = ['Pending', 'In Progress'];
        const activeOrdersCount = await Order.countDocuments({
            tailor: tailorId,
            status: { $in: activeTailorOrderStatus }
        });
        const latestCompletedOrder = await Order.findOne({
            tailor: tailorId,
            status: 'Completed'
        }).sort({ actualDeliveryDate: -1, updatedAt: -1 }).select('actualDeliveryDate updatedAt');
        res.json({
            activeOrdersCount,
            lastCompletedOrderDate: latestCompletedOrder ? (latestCompletedOrder.actualDeliveryDate || latestCompletedOrder.updatedAt) : null
        });
    } catch (error) {
        console.error("Error fetching tailor order summary (/tailor-summary):", error);
        res.status(500).json({ message: 'Server Error fetching order summary' });
    }
});


// --- GENERAL / ACTION ROUTES ---

// @route   POST /api/orders
// @desc    Customer creates a new order
// @access  Private (Customer)
router.post('/', authMiddleware, async (req, res) => {
    console.log('--- API Reached: POST /api/orders ---');
    if (!req.user || req.user.userType !== 'customer') {
        return res.status(403).json({ message: 'Access denied. Only customers can create orders.' });
    }
    try {
        const {
            tailorId, tailorName, serviceId, serviceName, servicePrice,
            quantity = 1, shippingAddress, notesToTailor, selectedMeasurementProfileId,
        } = req.body;

        if (!tailorId || !serviceId || !serviceName || servicePrice === undefined || !shippingAddress || !shippingAddress.address || !shippingAddress.city) {
            return res.status(400).json({ message: 'Missing required order details: tailorId, serviceId, serviceName, servicePrice, and complete shippingAddress are required.' });
        }
        if (!selectedMeasurementProfileId) {
            return res.status(400).json({ message: 'Please select a measurement profile for this order.' });
        }
        const items = [{ serviceId, serviceName, quantity, pricePerItem: servicePrice }];
        const totalAmount = servicePrice * quantity;
        const newOrder = new Order({
            customer: req.user.userId,
            tailor: tailorId,
            tailorName, items, totalAmount, shippingAddress, notesToTailor,
            linkedMeasurementProfile: selectedMeasurementProfileId,
            status: 'Pending',
        });
        const savedOrder = await newOrder.save();
        console.log('Order created successfully:', savedOrder._id, savedOrder.orderIdString);
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error("Error creating order (POST /api/orders):", error);
        if (error.name === 'ValidationError') {
            let messages = [];
            for (let field in error.errors) { messages.push(error.errors[field].message); }
            return res.status(400).json({ message: "Order validation failed.", details: messages.join('; ') });
        }
        res.status(500).json({ message: 'Server Error creating order.' });
    }
});

// @route   PUT /api/orders/:orderId/status
// @desc    Tailor updates the status of an order AND handles earnings
// @access  Private (Tailor)
router.put('/:orderId/status', authMiddleware, async (req, res) => {
    console.log(`--- API Reached: PUT /api/orders/${req.params.orderId}/status ---`);
    if (!req.user || req.user.userType !== 'tailor') {
        return res.status(403).json({ message: 'Access denied. Only tailors can update order status.' });
    }

    const { status } = req.body;
    const { orderId } = req.params;

    if (!status) {
        return res.status(400).json({ message: 'New status is required.' });
    }
    const allowedStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status value. Allowed: ${allowedStatuses.join(', ')}` });
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        if (order.tailor.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to update this order.' });
        }

        const previousStatus = order.status;
        if ((previousStatus === 'Completed' && status !== 'Completed' && status !== 'Cancelled') ||
            (previousStatus === 'Cancelled' && status !== 'Cancelled')) {
            return res.status(400).json({ message: `Cannot change status from '${previousStatus}' to '${status}'.` });
        }

        order.status = status;

        if (status === 'Completed') {
            if (!order.actualDeliveryDate) {
                order.actualDeliveryDate = new Date();
            }
            order.paymentStatus = 'Paid';

            // Calculate earnings based on 5% commission
            const platformCommissionAmount = order.totalAmount * PLATFORM_COMMISSION_RATE;
            const tailorActualEarning = order.totalAmount - platformCommissionAmount;

            // Record/Update Tailor Earning
            let tailorEarningRecord = await TailorEarning.findOne({ order: order._id });
            if (!tailorEarningRecord) {
                tailorEarningRecord = new TailorEarning({
                    tailor: order.tailor,
                    order: order._id,
                    orderIdString: order.orderIdString,
                    serviceNames: order.items.map(item => item.serviceName),
                    earnedAmount: tailorActualEarning, // Tailor's actual earning
                    completionDate: order.actualDeliveryDate || new Date(),
                });
                console.log(`Tailor Earning record CREATED for order ${order.orderIdString}. Amount: ${tailorActualEarning}`);
            } else {
                tailorEarningRecord.earnedAmount = tailorActualEarning; // Update if it exists
                tailorEarningRecord.completionDate = order.actualDeliveryDate || new Date();
                console.log(`Tailor Earning record UPDATED for order ${order.orderIdString}. New Amount: ${tailorActualEarning}`);
            }
            await tailorEarningRecord.save();

            // Record/Update Platform Earning
            let platformEarningRecord = await PlatformEarning.findOne({ order: order._id });
            if (!platformEarningRecord) {
                platformEarningRecord = new PlatformEarning({
                    order: order._id,
                    orderIdString: order.orderIdString,
                    tailor: order.tailor,
                    commissionAmount: platformCommissionAmount, // Store the calculated commission
                    earnedAt: order.actualDeliveryDate || new Date(),
                });
                console.log(`Platform Earning record CREATED for order ${order.orderIdString}. Commission: ${platformCommissionAmount}`);
            } else {
                platformEarningRecord.commissionAmount = platformCommissionAmount; // Update if it exists
                platformEarningRecord.earnedAt = order.actualDeliveryDate || new Date();
                console.log(`Platform Earning record UPDATED for order ${order.orderIdString}. New Commission: ${platformCommissionAmount}`);
            }
            await platformEarningRecord.save();

        } else if (status === 'Cancelled' && previousStatus === 'Completed') {
            // If order is cancelled AFTER being completed and earnings recorded
            console.log(`Order ${order.orderIdString} cancelled after completion. Removing associated earning records.`);
            await TailorEarning.deleteOne({ order: order._id });
            await PlatformEarning.deleteOne({ order: order._id });
            console.log(`Earning records (tailor & platform) for order ${order.orderIdString} removed.`);
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);

    } catch (error) {
        console.error(`Error updating order status for ${orderId} to ${status}:`, error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: `Invalid Order ID format: ${orderId}` });
        }
        res.status(500).json({ message: 'Server error while updating order status. Details: ' + error.message });
    }
});

// @route   GET /api/orders/:id
// @desc    Get a specific order by its MongoDB ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
    console.log(`--- API Reached: GET /api/orders/:id with id: ${req.params.id} ---`);
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'fullName email')
            .populate('tailor', 'fullName email');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (order.customer._id.toString() !== req.user.userId &&
            order.tailor._id.toString() !== req.user.userId &&
            req.user.userType !== 'admin') { // Allow admin to view any order
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }
        res.json(order);
    } catch (error) {
        console.error(`Error fetching order details for ${req.params.id}:`, error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: `Invalid Order ID format: ${req.params.id}` });
        }
        res.status(500).json({ message: 'Server Error fetching order details' });
    }
});

// @route   DELETE /api/orders/:orderId
// @desc    Customer deletes their own order if it's in an allowed state
// @access  Private (Customer)
router.delete('/:orderId', authMiddleware, async (req, res) => {
    console.log(`--- API Reached: DELETE /api/orders/${req.params.orderId} ---`);
    if (!req.user || req.user.userType !== 'customer') {
        return res.status(403).json({ message: 'Access denied. Only customers can delete their orders.' });
    }
    const { orderId } = req.params;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        if (order.customer.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this order.' });
        }
        const deletableStatuses = ['Pending', 'In Progress'];
        if (!deletableStatuses.includes(order.status)) {
            return res.status(400).json({
                message: `Cannot delete order. Order status is currently '${order.status}'. Only orders that are 'Pending' or 'In Progress' can be deleted by the customer.`
            });
        }
        await Order.findByIdAndDelete(orderId);
        console.log(`Order ${order.orderIdString} (ID: ${orderId}) deleted by customer ${req.user.userId}`);
        res.json({ message: 'Order deleted successfully.' });
    } catch (error) {
        console.error("Error deleting order:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: `Invalid Order ID format: ${orderId}` });
        }
        res.status(500).json({ message: 'Server error deleting order.' });
    }
});

export default router;