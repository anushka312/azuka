import User from "../src/models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
        const { name, email, password, age, height, weight, activityLevel, cycleLength, lastPeriod, goals } = req.body;

        // 1. Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

        // 2. Calculate Stats
        const bmr = calculateBMR("female", weight, height, age);
        const activityFactor = getActivityFactor(activityLevel);
        const dailyCalories = bmr * activityFactor;

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 4. Create User
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
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
            stressBaseline: 0.5
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
