// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // Adds userId and userType to req object
            next();
        } catch (error) {
            console.error("Token verification failed:", error.message);
            return res.status(401).json({ message: 'Token is not valid or expired' });
        }
    } else {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
};

export default authMiddleware;