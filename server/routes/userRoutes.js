// routes/userRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/schemas/userSchema.js';

const router = express.Router();

// GET /api/users/profile (already exists)
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/users/profile
// @desc    Update current user's profile information
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
    const { fullName, phoneNumber, address, city } = req.body;
    // Email is usually not updatable or requires a separate verification process

    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if they are provided
        if (fullName) user.fullName = fullName;
        if (phoneNumber) {
            // Optional: Add validation for phone number format or check for uniqueness if it changes
            const existingPhoneNumberUser = await User.findOne({ phoneNumber, _id: { $ne: user._id } });
            if (existingPhoneNumberUser) {
                return res.status(409).json({ message: 'Phone number already in use by another account.' });
            }
            user.phoneNumber = phoneNumber;
        }
        if (address) user.address = address; // Assuming you add address to your userSchema
        if (city) user.city = city;         // City is already in your schema

        const updatedUser = await user.save();
        // Return the updated user profile (without password)
        const userToReturn = updatedUser.toObject();
        delete userToReturn.password;

        res.json({ message: 'Profile updated successfully', user: userToReturn });

    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});


export default router;