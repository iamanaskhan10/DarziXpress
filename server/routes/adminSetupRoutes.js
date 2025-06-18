// routes/adminSetupRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/schemas/userSchema.js'; // Your existing User schema

const router = express.Router();

// @route   POST /api/admin-setup/create-admin
// @desc    Create a new admin user (use with caution, secure this endpoint)
// @access  Public (for initial setup) or Protected (for existing admins to create others)
router.post('/create-admin', async (req, res) => {
    const { fullName, email, password, phoneNumber, city } = req.body;

    // Basic validation
    if (!fullName || !email || !password || !phoneNumber || !city) {
        return res.status(400).json({ message: 'All fields are required for admin creation.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    try {
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists.' });
        }
        existingUser = await User.findOne({ phoneNumber });
        if (existingUser) {
            return res.status(409).json({ message: 'Phone number already exists.' });
        }


        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new User({
            fullName,
            email,
            password: hashedPassword,
            phoneNumber,
            city,
            userType: 'admin', // Crucial for identifying admin
            // isActive: true, // Assuming your User schema has this and defaults to true
        });

        await newAdmin.save();
        res.status(201).json({ message: 'Admin user created successfully.', userId: newAdmin._id });

    } catch (error) {
        console.error("Error creating admin user:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error creating admin.' });
    }
});

export default router;