// routes/measurementRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import MeasurementProfile from '../models/schemas/measurementProfileSchema.js';

const router = express.Router();

// @route   POST /api/measurements
// @desc    Create a new measurement profile for the logged-in user
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, details } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Profile name is required.' });
        }

        const newProfile = new MeasurementProfile({
            user: req.user.userId,
            name,
            details,
        });

        const savedProfile = await newProfile.save();
        res.status(201).json(savedProfile);
    } catch (error) {
        console.error("Error creating measurement profile:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/measurements
// @desc    Get all measurement profiles for the logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const profiles = await MeasurementProfile.find({ user: req.user.userId }).sort({ lastUpdated: -1 });
        res.json(profiles);
    } catch (error) {
        console.error("Error fetching measurement profiles:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/measurements/latest/:count
// @desc    Get latest 'count' measurement profiles for the logged-in user (for dashboard)
// @access  Private
router.get('/latest/:count', authMiddleware, async (req, res) => {
    try {
        const count = parseInt(req.params.count) || 2; // Default to 2 if not specified or invalid
        const profiles = await MeasurementProfile.find({ user: req.user.userId })
            .sort({ lastUpdated: -1 })
            .limit(count);
        res.json(profiles);
    } catch (error) {
        console.error("Error fetching latest measurement profiles:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// @route   PUT /api/measurements/:id
// @desc    Update a specific measurement profile
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { name, details } = req.body;
        const profileId = req.params.id;

        let profile = await MeasurementProfile.findById(profileId);

        if (!profile) {
            return res.status(404).json({ message: 'Measurement profile not found.' });
        }
        // Ensure the user owns this profile
        if (profile.user.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Not authorized to update this profile.' });
        }

        if (name) profile.name = name;
        if (details) profile.details = { ...profile.details, ...details }; // Merge details
        // lastUpdated will be set by pre-save hook

        const updatedProfile = await profile.save();
        res.json(updatedProfile);
    } catch (error) {
        console.error("Error updating measurement profile:", error);
        if (error.kind === 'ObjectId') { // Handle invalid ObjectId format
            return res.status(400).json({ message: 'Invalid profile ID format.' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/measurements/:id
// @desc    Delete a specific measurement profile
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const profileId = req.params.id;
        const profile = await MeasurementProfile.findById(profileId);

        if (!profile) {
            return res.status(404).json({ message: 'Measurement profile not found.' });
        }
        if (profile.user.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Not authorized to delete this profile.' });
        }

        await MeasurementProfile.findByIdAndDelete(profileId); // Changed from profile.remove()
        res.json({ message: 'Measurement profile deleted successfully.' });
    } catch (error) {
        console.error("Error deleting measurement profile:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid profile ID format.' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});


export default router;