// server.js
import express from 'express';
import connectDB from './utils/db.js';
import authRoutes from './routes/auth.js';
import dotenv from 'dotenv';
import cors from 'cors';
import measurementRoutes from './routes/measurementRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import earningRoutes from './routes/earningRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import adminSetupRoutes from './routes/adminSetupRoutes.js';
import adminStatsRoutes from './routes/adminStatsRoutes.js';

dotenv.config();
connectDB();

const app = express();

// Allow CORS from the frontend port (e.g., 5173 for Vite or 3000 for React)
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, // Allow cookies
};
app.use(cors(corsOptions));

// Parse JSON requests
app.use(express.json());

// Use the auth routes
app.use('/api/auth', authRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/earnings', earningRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin-setup', adminSetupRoutes);
app.use('/api/admin/stats', adminStatsRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
