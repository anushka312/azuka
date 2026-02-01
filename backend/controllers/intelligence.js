import BodyState from "../src/models/BodyState.js";
import WeeklyPlan from "../src/models/WeeklyPlan.js";
import User from "../src/models/User.js";
import intelligenceLoop from "../src/services/intelligenceLoop.js";

export const syncDailyLog = async (req, res) => {
    try {
        const { userId, symptoms, sleepHours, sleepQuality } = req.body;
        // const user = await User.findById(userId);
        const user = {
            name: "Demo User",
            age: 28,
            fitnessLevel: "Intermediate"
        };


        // 1. Run the 11-agent loop
        const { bioState, psychology, finalDecision } = await intelligenceLoop(user, req.body);

        // 2. Save the BodyState (The "Digital Twin")
        await BodyState.create({
            userId,
            cycle: bioState.cycle,
            stress: bioState.stress,
            metabolic: bioState.metabolic,
            physiology: bioState.cycle.physiology, // Assumes cycle agent calculates this
            behavior: psychology,
            symptoms,
            sleep: { hours: sleepHours, quality_score: sleepQuality }
        });

        // 3. Update the Weekly Plan (The "Auto-Replan")
        const today = new Date().setHours(0, 0, 0, 0);
        const updatedPlan = await WeeklyPlan.findOneAndUpdate(
            { userId, "days.date": today },
            {
                $set: {
                    "days.$.readiness": finalDecision.readiness,
                    "days.$.workout": finalDecision.workout,
                    "days.$.notes": finalDecision.mindset_message,
                    "days.$.auto_replanned": bioState.stress.cortisol_risk > 0.7
                }
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            path: finalDecision,
            bioSummary: bioState
        });

    } catch (error) {
        console.error("Loop Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};