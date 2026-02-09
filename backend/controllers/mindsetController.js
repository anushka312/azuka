import MindsetLog from "../src/models/MindsetLog.js";
import User from "../src/models/User.js";

// Helper to get user
const getUser = async (userId) => {
    if (userId) {
        const user = await User.findById(userId);
        if (user) return user;
    }
    // Fallback
    let user = await User.findOne();
    if (!user) {
        user = await User.create({
            name: "Demo User",
            age: 28,
            fitnessLevel: "Intermediate",
            cycleDay: 14,
            cycleLength: 28,
            goals: { primary: "Energy", secondary: "Strength" }
        });
    }
    return user;
};

// GET /api/mindset/history
export const getMindsetHistory = async (req, res) => {
    try {
        const user = await getUser(req.userId);
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);

        const logs = await MindsetLog.find({
            userId: user._id,
            date: { $gte: start, $lte: end }
        }).sort({ date: 1 });

        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/mindset/checkin
export const saveCheckIn = async (req, res) => {
    try {
        const user = await getUser(req.userId);
        const { mood, energy, stress, sleep_hours, sleep_quality } = req.body;
        
        const today = new Date();
        today.setHours(0,0,0,0);

        // Use findOneAndUpdate with upsert to handle race conditions and duplicates atomically
        const updateData = {};
        if (mood !== undefined) updateData.mood = mood;
        if (energy !== undefined) updateData.energy = energy;
        if (stress !== undefined) updateData.stress = stress;
        if (sleep_hours !== undefined) updateData.sleep_hours = sleep_hours;
        if (sleep_quality !== undefined) updateData.sleep_quality = sleep_quality;

        const log = await MindsetLog.findOneAndUpdate(
            { userId: user._id, date: today },
            { $set: updateData },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true, log });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
