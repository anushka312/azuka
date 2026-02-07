import { verifyIdToken } from '../config/firebase.js';
import jwt from 'jsonwebtoken';

/**
 * Middleware to verify Custom JWT (from authController)
 */
export const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) return res.status(401).json({ message: "Unauthenticated" });

        const decodedData = jwt.verify(token, "SECRET_KEY_DEV"); // TODO: Use env variable

        req.userId = decodedData?.id;

        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Unauthenticated" });
    }
};

/**
 * Middleware to verify Firebase ID Token
 * Usage: app.use('/api/protected', firebaseAuth, protectedRoutes);
 */
export const firebaseAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await verifyIdToken(token);
        req.user = decodedToken; // Attach Firebase user data to request
        next();
    } catch (error) {
        console.error("Firebase Auth Error:", error);
        res.status(403).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
};
