// routes/serviceRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import ServiceOffering from '../models/schemas/serviceOfferingSchema.js';
import User from '../models/schemas/userSchema.js';

const router = express.Router();

// --- Place specific string routes BEFORE dynamic parameter routes ---

// @route   GET /api/services/tailor-summary
// @desc    Get service listings summary for the logged-in tailor
// @access  Private (Tailor only)
router.get('/tailor-summary', authMiddleware, async (req, res) => {
    console.log('--- Reached GET /api/services/tailor-summary ---'); // Keep for debugging
    console.log('req.user from authMiddleware:', JSON.stringify(req.user, null, 2)); // Keep

    if (!req.user || req.user.userType !== 'tailor') {
        console.error('Tailor Service Summary: Access Denied. User:', req.user);
        return res.status(403).json({ message: 'Access denied. Only for tailors.' });
    }
    try {
        const tailorId = req.user.userId;
        const activeServicesCount = await ServiceOffering.countDocuments({
            tailor: tailorId,
            isActive: true
        });
        const totalServicesCount = await ServiceOffering.countDocuments({
            tailor: tailorId
        });
        res.json({
            activeServicesCount,
            totalServicesCount
        });
    } catch (error) {
        console.error("Error fetching tailor service summary:", error);
        res.status(500).json({ message: 'Server Error fetching service summary' });
    }
});


// --- Dynamic parameter routes AFTER specific string routes ---

// @route   POST /api/services
// @desc    Tailor creates a new service offering
// @access  Private (Tailor only)
router.post('/', authMiddleware, async (req, res) => {
    if (req.user.userType !== 'tailor') {
        return res.status(403).json({ message: 'Access denied. Only tailors can create services.' });
    }
    const { serviceName, description, category, price, priceType, estimatedDuration, location, images, tags } = req.body;
    if (!serviceName || !description || !category || !price || !location) {
        return res.status(400).json({ message: 'Missing required fields: serviceName, description, category, price, location are required.' });
    }
    try {
        const tailor = await User.findById(req.user.userId).select('fullName city');
        if (!tailor) {
            return res.status(404).json({ message: 'Tailor profile not found.' });
        }
        const newService = new ServiceOffering({
            tailor: req.user.userId,
            tailorName: tailor.fullName,
            serviceName, description, category, price, priceType, estimatedDuration,
            location: location || tailor.city,
            images, tags, isActive: true,
        });
        const savedService = await newService.save();
        res.status(201).json(savedService);
    } catch (error) {
        console.error("Error creating service offering:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error creating service.' });
    }
});

// @route   GET /api/services
// @desc    Get all active service offerings (for customers to browse)
// @access  Public
router.get('/', async (req, res) => {
    // ... (your existing code for this main listing route)
    const { search, location, category, minPrice, maxPrice, tailorId, sortBy = 'createdAt', order = 'desc' } = req.query;
    const query = { isActive: true };

    if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
            { serviceName: searchRegex }, { description: searchRegex },
            { category: searchRegex }, { tailorName: searchRegex }, { tags: searchRegex }
        ];
    }
    if (location) query.location = new RegExp(location, 'i');
    if (category) query.category = new RegExp(category, 'i');
    if (tailorId) query.tailor = tailorId;
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    try {
        const services = await ServiceOffering.find(query)
            .populate('tailor', 'fullName city rating profileImage')
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limit);
        const totalServices = await ServiceOffering.countDocuments(query);
        const distinctLocations = await ServiceOffering.distinct('location', { isActive: true });
        const distinctCategories = await ServiceOffering.distinct('category', { isActive: true });
        res.json({
            services, currentPage: page, totalPages: Math.ceil(totalServices / limit),
            totalServices, filters: { locations: distinctLocations.sort(), categories: distinctCategories.sort() }
        });
    } catch (error) {
        console.error("Error fetching service offerings:", error);
        res.status(500).json({ message: 'Server error fetching services.' });
    }
});

// @route   GET /api/services/:serviceId
// @desc    Get a single service offering by its ID
// @access  Public
router.get('/:serviceId', async (req, res) => { // THIS NOW COMES AFTER /tailor-summary
    console.log(`--- Reached GET /api/services/:serviceId with serviceId: ${req.params.serviceId} ---`); // Keep for debugging
    try {
        const service = await ServiceOffering.findById(req.params.serviceId)
            .populate('tailor', 'fullName email phoneNumber city rating profileImage');
        if (!service || !service.isActive) {
            return res.status(404).json({ message: 'Service not found or is not active.' });
        }
        res.json(service);
    } catch (error) {
        console.error("Error fetching single service:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: `Invalid service ID format: ${req.params.serviceId}` });
        }
        res.status(500).json({ message: 'Server error fetching service details' });
    }
});

// @route   DELETE /api/services/:serviceId
// @desc    Tailor deletes their service offering
// @access  Private (Tailor only)
router.delete('/:serviceId', authMiddleware, async (req, res) => {
    if (req.user.userType !== 'tailor') {
        return res.status(403).json({ message: 'Access denied. Only tailors can delete services.' });
    }
    const { serviceId } = req.params;

    try {
        const service = await ServiceOffering.findById(serviceId);

        if (!service) {
            return res.status(404).json({ message: 'Service not found.' });
        }

        // Ensure the service belongs to this tailor
        if (service.tailor.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this service.' });
        }

        await ServiceOffering.findByIdAndDelete(serviceId); // Or service.remove() if using older Mongoose
        res.json({ message: 'Service deleted successfully.' });

    } catch (error) {
        console.error("Error deleting service:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid service ID.' });
        }
        res.status(500).json({ message: 'Server error deleting service.' });
    }
});

// Your existing PUT route for updates (can be used for Edit)
// @route   PUT /api/services/:serviceId
// @desc    Tailor updates their service offering
// @access  Private (Tailor only)
router.put('/:serviceId', authMiddleware, async (req, res) => {
    if (req.user.userType !== 'tailor') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    const { serviceId } = req.params;
    // Allow updating any field from the schema that a tailor should be able to edit
    const {
        serviceName, description, category, price, priceType,
        estimatedDuration, location, images, tags, isActive // isActive can be part of edit
    } = req.body;

    const updates = {};
    if (serviceName !== undefined) updates.serviceName = serviceName;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (price !== undefined) updates.price = parseFloat(price);
    if (priceType !== undefined) updates.priceType = priceType;
    if (estimatedDuration !== undefined) updates.estimatedDuration = estimatedDuration;
    if (location !== undefined) updates.location = location;
    if (images !== undefined && Array.isArray(images)) updates.images = images.filter(img => typeof img === 'string' && img.trim() !== '');
    if (tags !== undefined && Array.isArray(tags)) updates.tags = tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag !== '');
    if (isActive !== undefined && typeof isActive === 'boolean') updates.isActive = isActive;


    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No update fields provided." });
    }

    updates.lastUpdated = Date.now(); // Manually update if not using Mongoose timestamps for this field specifically

    try {
        const service = await ServiceOffering.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found.' });
        }
        if (service.tailor.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this service.' });
        }

        // Apply updates
        Object.assign(service, updates);

        const updatedService = await service.save();
        res.json(updatedService);

    } catch (error) {
        console.error("Error updating service:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid service ID.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error updating service.' });
    }
});

export default router;