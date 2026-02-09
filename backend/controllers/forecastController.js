import User from "../src/models/User.js";
import { generateCycleForecast } from "../src/agents/cycleAgent.js";
import { getCache, setCache } from "../src/utils/cache.js";

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

// GET /api/forecast
export const getForecast = async (req, res) => {
    try {
        const user = await getUser(req.userId);
        const today = new Date();
        const dateKey = today.toISOString().split('T')[0];
        const cacheKey = `forecast_${user._id}_${dateKey}`;

        // 1. Try Cache
        let forecast = getCache(cacheKey);

        if (!forecast) {
            // BYPASS AGENT FOR ALL USERS (USER REQUEST: NO AGENTS) -> REVERTED: AGENTS ENABLED
            if (false) {
                console.log(`[Forecast] Using Offline/Dummy Forecast for User: ${user.name}`);
                forecast = Array(7).fill(0).map((_, i) => {
                    const d = new Date(today);
                    d.setDate(d.getDate() + i);
                    return {
                        date: d.toISOString(),
                        day_in_cycle: (user.cycleDay + i) % user.cycleLength || user.cycleLength,
                        phase: "Luteal", // Simplified
                        energy_prediction: 70 - (i * 5), // Declining energy
                        symptom_risk: ["Bloating", "Fatigue"],
                        recommendation: "Focus on strength training and complex carbs."
                    };
                });
            } else {
                console.log(`[Forecast] Cache miss. Running Cycle Agent...`);
                
                // 2. Run Agent
                const startDate = today.toLocaleDateString('en-US');
                forecast = await generateCycleForecast(user, startDate);

                // 3. Save to Cache
                if (forecast && forecast.length > 0) {
                    setCache(cacheKey, forecast);
                }
            }
        } else {
            console.log(`[Forecast] Serving cached forecast.`);
        }

        // Fallback if agent fails
        if (!forecast || forecast.length === 0) {
            console.log("[Forecast] Agent failed, returning empty list or error.");
            return res.json({ success: true, forecast: [] });
        }

        res.json({ success: true, forecast });
    } catch (error) {
        console.error("Forecast Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
