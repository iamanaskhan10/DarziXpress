// routes/adminUserRoutes.js
import express from 'express';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js'; // Your admin auth middleware
import User from '../models/schemas/userSchema.js';

const router = express.Router();

// @route   GET /api/admin/users?userType=customer  OR  /api/admin/users?userType=tailor
// @desc    Admin gets all users of a specific type (customers or tailors)
// @access  Private (Admin)
router.get('/', adminAuthMiddleware, async (req, res) => {
    const { userType } = req.query;

    if (!userType || (userType !== 'customer' && userType !== 'tailor')) {
        return res.status(400).json({ message: "Invalid or missing 'userType' query parameter. Must be 'customer' or 'tailor'." });
    }

    try {
        // Add pagination later if needed
        const users = await User.find({ userType: userType })
            .select('-password') // Exclude passwords
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error(`Error fetching ${userType}s for admin:`, error);
        res.status(500).json({ message: `Server error fetching ${userType}s.` });
    }
});

// @route   GET /api/admin/users/:userId
// @desc    Admin gets a specific user's details
// @access  Private (Admin)
router.get('/:userId', adminAuthMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(user);
    } catch (error) {
        console.error(`Error fetching user ${req.params.userId} for admin:`, error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }
        res.status(500).json({ message: 'Server error fetching user.' });
    }
});


// @route   PUT /api/admin/users/:userId
// @desc    Admin updates a user's details
// @access  Private (Admin)
router.put('/:userId', adminAuthMiddleware, async (req, res) => {
    const { userId } = req.params;
    // Fields an admin might be allowed to update (e.g., fullName, city, phoneNumber, or even userType, isActive status)
    // Be careful about allowing password changes here; usually, that's a separate flow.
    // For this example, let's allow updating common profile fields and isActive.
    const { fullName, email, phoneNumber, city, address, userType, isActive } = req.body;

    try {
        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update fields if provided in the request body
        if (fullName !== undefined) userToUpdate.fullName = fullName;
        if (email !== undefined) { // Admin changing email might require re-verification logic
            const existingEmail = await User.findOne({ email: email, _id: { $ne: userId } });
            if (existingEmail) return res.status(409).json({ message: "Email already in use." });
            userToUpdate.email = email;
        }
        if (phoneNumber !== undefined) {
            const existingPhone = await User.findOne({ phoneNumber: phoneNumber, _id: { $ne: userId } });
            if (existingPhone) return res.status(409).json({ message: "Phone number already in use." });
            userToUpdate.phoneNumber = phoneNumber;
        }
        if (city !== undefined) userToUpdate.city = city;
        if (address !== undefined) userToUpdate.address = address;
        if (userType !== undefined && ['customer', 'tailor', 'admin'].includes(userType)) { // Ensure valid userType
            userToUpdate.userType = userType;
        }
        if (isActive !== undefined && typeof isActive === 'boolean') {
            // You might need an 'isActive' field in your UserSchema if you want to disable users
            // userToUpdate.isActive = isActive; 
            console.warn("Admin attempting to set 'isActive'. Ensure UserSchema supports this.");
        }


        const updatedUser = await userToUpdate.save();
        const userToReturn = updatedUser.toObject();
        delete userToReturn.password; // Ensure password is not returned

        res.json({ message: 'User updated successfully by admin.', user: userToReturn });

    } catch (error) {
        console.error(`Error updating user ${userId} by admin:`, error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation failed", details: error.message });
        }
        res.status(500).json({ message: 'Server error updating user.' });
    }
});


// @route   DELETE /api/admin/users/:userId
// @desc    Admin deletes a user
// @access  Private (Admin)
router.delete('/:userId', adminAuthMiddleware, async (req, res) => {
    const { userId } = req.params;
    try {
        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Optional: Add checks to prevent admin from deleting themselves, or other critical logic.
        // if (req.user.id === userId) {
        //     return res.status(400).json({ message: "Admin cannot delete their own account through this endpoint." });
        // }

        // Consider what happens to related data (orders, services, measurements) when a user is deleted.
        // This might involve more complex cascading deletes or anonymization based on your app's needs.
        // For now, a simple delete:
        await User.findByIdAndDelete(userId);

        res.json({ message: `User ${userToDelete.fullName} (ID: ${userId}) deleted successfully by admin.` });

    } catch (error) {
        console.error(`Error deleting user ${userId} by admin:`, error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }
        res.status(500).json({ message: 'Server error deleting user.' });
    }
});


export default router;