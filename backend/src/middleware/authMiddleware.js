import { verifyIdToken } from '../config/firebase.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to verify Custom JWT OR Firebase Token
 */
export const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            console.log("[AuthMiddleware] No token provided");
            return res.status(401).json({ message: "Unauthenticated" });
        }

        let decodedData;

        try {
            // Try Custom JWT first
            decodedData = jwt.verify(token, "SECRET_KEY_DEV");
            req.userId = decodedData?.id;
        } catch (jwtError) {
            // If Custom JWT fails, try Firebase Token
            // console.log("[AuthMiddleware] Custom JWT failed, trying Firebase...");
            try {
                const firebaseUser = await verifyIdToken(token);
                // console.log("[AuthMiddleware] Firebase Verified UID:", firebaseUser.uid);
                
                // Find user by firebaseUid
                let user = await User.findOne({ firebaseUid: firebaseUser.uid });
                
                if (!user && firebaseUser.email) {
                    // Fallback: Check by email and link if found (Self-Healing/Just-In-Time Linking)
                    console.log(`[AuthMiddleware] UID mismatch. Checking email: ${firebaseUser.email}`);
                    user = await User.findOne({ email: firebaseUser.email });
                    
                    if (user) {
                        console.log(`[AuthMiddleware] User found by email. Linking UID: ${firebaseUser.uid}`);
                        user.firebaseUid = firebaseUser.uid;
                        await user.save();
                    }
                }

                if (user) {
                    req.userId = user._id;
                } else {
                    console.log("[AuthMiddleware] User not found in MongoDB for UID:", firebaseUser.uid);
                    // If user doesn't exist in Mongo yet, we might need to create them or return error
                    // For now, let's assume they should exist if they are calling profile
                    return res.status(404).json({ message: "User account not found. Please sign up." });
                }
            } catch (firebaseError) {
                console.error("[AuthMiddleware] Firebase Auth Failed:", firebaseError.message);
                // Both failed
                return res.status(401).json({ message: "Unauthenticated" });
            }
        }

        next();
    } catch (error) {
        console.error("[AuthMiddleware] Unexpected Error:", error);
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
