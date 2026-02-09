import User from "../src/models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyIdToken } from "../src/config/firebase.js";

// Helper: Calculate BMR (Mifflin-St Jeor)
const calculateBMR = (gender, weight, height, age) => {
    // Default to Female for Azuka
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
};

// Helper: Get Activity Factor
const getActivityFactor = (level) => {
    const map = {
        "Sedentary": 1.2,
        "Lightly Active": 1.375,
        "Moderately Active": 1.55,
        "Very Active": 1.725
    };
    return map[level] || 1.2;
};

export const signup = async (req, res) => {
    try {
        console.log("[Signup] Request received:", req.body.email);
        let { name, email, password, age, height, weight, activityLevel, cycleLength, lastPeriod, goals, firebaseUid } = req.body;
        
        // --- SECURE FIREBASE VERIFICATION ---
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const idToken = authHeader.split(' ')[1];
            try {
                const decodedToken = await verifyIdToken(idToken);
                // Trust the decoded token data over body data for critical fields
                firebaseUid = decodedToken.uid;
                email = decodedToken.email || email; // Prefer token email
                console.log("Verified Firebase User:", firebaseUid);
            } catch (authError) {
                console.error("Token Verification Failed:", authError);
                return res.status(401).json({ success: false, message: "Invalid Auth Token" });
            }
        }
        // ------------------------------------

        // 1. Check if user exists
        let existingUser = await User.findOne({ email });
        
        if (existingUser) {
            // Check if we need to link Firebase UID
            if (firebaseUid && existingUser.firebaseUid !== firebaseUid) {
                console.log(`[Signup] Linking existing user ${email} to Firebase UID: ${firebaseUid}`);
                existingUser.firebaseUid = firebaseUid;
                
                // If we are receiving full profile data (e.g. from Onboarding), update it
                if (age && height && weight && goals) {
                    existingUser.age = age;
                    existingUser.height = height;
                    existingUser.weight = weight;
                    existingUser.activityLevel = activityLevel;
                    existingUser.cycleLength = cycleLength;
                    existingUser.goals = goals;
                    existingUser.isOnboarded = true; // Mark as onboarded
                }
                
                await existingUser.save();
                
                // Generate Token for consistency
                const token = jwt.sign({ id: existingUser._id, email: existingUser.email }, "SECRET_KEY_DEV", { expiresIn: "30d" });
                return res.status(200).json({ success: true, result: existingUser, token, message: "Account linked successfully" });
            }

            // If already linked correctly (Idempotent Success)
            if (firebaseUid && existingUser.firebaseUid === firebaseUid) {
                 console.log(`[Signup] User ${email} already linked/exists. Updating profile if provided.`);
                 
                 // UPDATE PROFILE IF DATA PROVIDED (Onboarding Flow)
                 if (age && height && weight && goals) {
                    existingUser.age = age;
                    existingUser.height = height;
                    existingUser.weight = weight;
                    existingUser.activityLevel = activityLevel;
                    existingUser.cycleLength = cycleLength;
                    existingUser.goals = goals;
                    existingUser.isOnboarded = true; // Mark as onboarded
                    await existingUser.save();
                }

                 const token = jwt.sign({ id: existingUser._id, email: existingUser.email }, "SECRET_KEY_DEV", { expiresIn: "30d" });
                 return res.status(200).json({ success: true, result: existingUser, token, message: "User updated/logged in" });
            }
            
            // If already linked or just standard existing check
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // 2. Calculate Stats
        const bmr = calculateBMR("female", weight, height, age);
        const activityFactor = getActivityFactor(activityLevel);
        const dailyCalories = bmr * activityFactor;

        // 3. Hash Password (only if provided and not using Firebase)
        let hashedPassword = null;
        if (password) {
             hashedPassword = await bcrypt.hash(password, 12);
        }

        // 4. Create User
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            firebaseUid,
            age,
            height,
            weight,
            activityLevel,
            cycleLength: cycleLength || 28,
            cycleDay: 1, // Default to 1 if not provided, or calculate from lastPeriod
            lastPeriod: lastPeriod || new Date(),
            goals: goals || { primary: "Health" },
            basalMetabolicRate: Math.round(bmr),
            activityFactor,
            energyBaseline: dailyCalories,
            stressBaseline: 0.5,
            isOnboarded: (goals && height && weight) ? true : false // Only mark onboarded if full profile
        });

        // 5. Generate Token
        const token = jwt.sign({ id: newUser._id, email: newUser.email }, "SECRET_KEY_DEV", { expiresIn: "30d" });

        res.status(201).json({ success: true, result: newUser, token });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, email: user.email }, "SECRET_KEY_DEV", { expiresIn: "30d" });

        res.status(200).json({ success: true, result: user, token });
    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params; // or req.userId from auth middleware

        if (!id) return res.status(400).json({ message: "User ID required" });

        await User.findByIdAndDelete(id);
        
        // Also delete related data? (Optional but good practice)
        // await BodyState.deleteMany({ userId: id });
        // await WeeklyPlan.deleteMany({ userId: id });

        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user) return res.status(404).json({ message: "User not found" });

        // Don't send password back
        const { password, ...userData } = user._doc;

        res.status(200).json({ success: true, result: userData });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { name, age, height, weight, goals } = req.body;
        
        // Find user and update
        // We only update fields that are provided
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { 
                $set: {
                    name,
                    age,
                    height,
                    weight,
                    goals
                    // Recalculate BMR if weight/height/age changes? 
                    // For now, let's keep it simple, but strictly we should.
                } 
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

        // Don't send password back
        const { password, ...userData } = updatedUser._doc;

        res.status(200).json({ success: true, result: userData });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};
