import WeeklyPlan from "../src/models/WeeklyPlan.js";
import WorkoutLog from "../src/models/WorkoutLog.js";
import CalendarEvent from "../src/models/CalendarEvent.js";
import User from "../src/models/User.js";
import { generateWeekPlan } from "../src/agents/workoutAgent.js";

// Helper to get user (consistent with other controllers)
const getUser = async (userId) => {
    if (userId) {
        const user = await User.findById(userId);
        if (user) return user;
    }
    // Fallback only if no userId provided or not found (for dev/test without auth)
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

// Helper: Calculate Cycle Phase (Quick Logic)
const calculatePhase = (day) => {
    if (day <= 5) return "Menstrual";
    if (day <= 13) return "Follicular";
    if (day <= 17) return "Ovulatory";
    return "Luteal";
};

// Helper: Normalize Phase to Enum
const normalizePhase = (phaseInput) => {
    const p = phaseInput?.toLowerCase() || "";
    if (p.includes("menstru")) return "menstrual";
    if (p.includes("follicular")) return "follicular";
    if (p.includes("ovulat")) return "ovulatory";
    if (p.includes("luteal")) return "luteal";
    return "follicular"; // Safe fallback
};

// Helper: Normalize Readiness to Enum
const normalizeReadiness = (input) => {
    const val = input?.toLowerCase() || "";
    if (val.includes("push") || val.includes("peak") || val.includes("high")) return "Push";
    if (val.includes("maintain") || val.includes("build") || val.includes("medium")) return "Maintain";
    if (val.includes("gentle") || val.includes("light") || val.includes("flow")) return "Gentle";
    if (val.includes("recover") || val.includes("rest") || val.includes("taper")) return "Recover";
    return "Maintain"; // Safe fallback
};

// POST /api/workout/regenerate
export const regeneratePlan = async (req, res) => {
    try {
        const user = await getUser(req.userId);
        
        // 1. Force Run Agent (Specialized Workout Agent)
        console.log(`[Workout] Regenerating plan for ${user.name}...`);
        
        const newPlanPreview = await generateWeekPlan(user, new Date(), []); // Empty logs for now
        
        if (!newPlanPreview) {
             console.log("[Workout] Agent returned null/undefined");
        } else {
             console.log(`[Workout] Agent returned ${newPlanPreview.length} days`);
        }

        if (newPlanPreview && newPlanPreview.length > 0) {
             const startDate = new Date();
             const days = newPlanPreview.map((day, index) => {
                const date = new Date(startDate);
                date.setDate(date.getDate() + day.day_offset);
                
                // Workout Handling
                const workoutData = day.workout || {
                    title: "Rest",
                    type: "Rest",
                    duration_min: 0,
                    intensity: "Low",
                    muscles: [],
                    calories_burn_est: 0,
                    volume: ""
                };

                // Fix: Ensure Rest days have 0 duration only if it's passive rest
                const isRest = workoutData.style === 'Rest' || workoutData.title === 'Rest' || workoutData.type === 'Rest';
                // If it's Rest but explicitly has a duration > 0 and style is NOT just "Rest" (e.g. "Meditation"), keep it?
                // But user complained about "rest of 20 mins". 
                // We will force 0 for "Rest" style.
                if (isRest) {
                    workoutData.duration_min = 0;
                }

                // Nutrition Handling (Fallback if agent doesn't return)
                const calorieTarget = day.nutrition?.calories || { min: 2000, max: 2200 };
                const macros = day.nutrition?.macros || { protein_pct: 30, carb_pct: 40, fat_pct: 30 };

                // Calculate Grams from Percentages
                const avgCals = (calorieTarget.min + calorieTarget.max) / 2;
                const p_grams = Math.round((avgCals * ((macros.protein_pct || 30) / 100)) / 4);
                const c_grams = Math.round((avgCals * ((macros.carb_pct || 40) / 100)) / 4);
                const f_grams = Math.round((avgCals * ((macros.fat_pct || 30) / 100)) / 9);

                return {
                    date: date,
                    phase: normalizePhase(day.phase_prediction),
                    readiness: normalizeReadiness(day.readiness),
                    workout: workoutData,
                    analysis: day.analysis || day.rationale, // Map analysis
                    calorie_target: calorieTarget,
                    macro_targets: {
                        protein: p_grams,
                        carbs: c_grams,
                        fats: f_grams
                    },
                    status: "planned"
                };
             });

             // Create new plan
             const newPlan = await WeeklyPlan.create({
                userId: user._id,
                week_start: startDate,
                week_end: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000),
                goal: user.goals,
                days: days
             });

             return res.json({ success: true, plan: newPlan });
        }

        res.json({ success: false, message: "Agent decided not to regenerate plan." });

    } catch (error) {
        console.error("Regenerate Plan Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/workout/plan
export const getWorkoutPlan = async (req, res) => {
    try {
        const user = await getUser(req.userId);
        const today = new Date();
        today.setHours(0,0,0,0);
        
        // 1. Try to find a plan that covers TODAY
        let plan = await WeeklyPlan.findOne({ 
            userId: user._id,
            week_start: { $lte: today },
            week_end: { $gte: today }
        });

        // 2. If no current plan, find the upcoming one (e.g. starts tomorrow)
        if (!plan) {
             plan = await WeeklyPlan.findOne({ 
                userId: user._id,
                week_start: { $gt: today }
            }).sort({ week_start: 1 });
        }

        // 3. If still no plan, find the latest past plan (fallback)
        if (!plan) {
            plan = await WeeklyPlan.findOne({ 
                userId: user._id 
            }).sort({ week_start: -1 });
        }

        if (!plan) {
            return res.json({ success: false, message: "No active plan found" });
        }

        res.json({ success: true, plan });
    } catch (error) {
        console.error("Get Plan Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/workout/complete
export const completeWorkout = async (req, res) => {
    try {
        const { date, feedback, caloriesBurned } = req.body; 
        const user = await getUser(req.userId);
        const targetDate = new Date(date);
        
        console.log(`[Workout] Marking complete for ${user.name} on ${targetDate.toDateString()}`);

        // 1. Update WeeklyPlan status
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0,0,0,0);
        
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23,59,59,999);

        // Find plan covering this date
        const plan = await WeeklyPlan.findOne({ 
            userId: user._id, 
            week_start: { $lte: endOfDay },
            week_end: { $gte: startOfDay }
        });

        let completedWorkoutDetails = {};
        
        if (plan) {
            // Find the specific day in the array using lenient date matching
            const targetDateStr = targetDate.toDateString();
            const dayIndex = plan.days.findIndex(d => new Date(d.date).toDateString() === targetDateStr);
            
            if (dayIndex >= 0) {
                plan.days[dayIndex].status = "completed";
                completedWorkoutDetails = plan.days[dayIndex].workout;
                await plan.save();
                console.log(`[Workout] Marked day ${dayIndex} as completed`);
            } else {
                 console.log(`[Workout] Day not found in plan days array for ${targetDateStr}`);
            }
        } else {
            console.log(`[Workout] No plan found covering ${targetDate.toDateString()}`);
            // We allow completing a workout even if no plan exists (self-log)
        }

        // 2. Create WorkoutLog
        let finalCalories = 0;
        // Handle case where workout details might be missing properties
        const duration = completedWorkoutDetails?.duration_min || 30;
        const intensity = completedWorkoutDetails?.intensity || "Moderate";

        if (caloriesBurned) {
            finalCalories = parseInt(caloriesBurned);
        } else {
            // Simple METS estimation
            let mets = 5.0;
            if (intensity === "Low" || intensity === "Recover" || intensity === "Rest") mets = 3.5;
            if (intensity === "High" || intensity === "Push") mets = 8.0;
            
            const weight = user.weight || 60;
            finalCalories = Math.round(mets * weight * (duration / 60));
        }

        const log = await WorkoutLog.create({
            userId: user._id,
            date: targetDate,
            completed: true,
            planned: {
                activityType: completedWorkoutDetails.type || "Workout",
                duration_min: duration,
                intensity: intensity
            },
            self_logged: {
                activityType: completedWorkoutDetails.type || "Workout",
                duration_min: duration,
                calories_burned: finalCalories
            },
            source: plan ? "planned" : "self",
            feedback: feedback || "Completed"
        });

        // 3. Update CalendarEvent
        await CalendarEvent.updateMany(
            { 
                userId: user._id, 
                date: { $gte: startOfDay, $lte: endOfDay }, 
                type: "workout" 
            },
            { $set: { completed: true } }
        );

        res.json({ success: true, message: "Workout completed", calories: finalCalories, log });

    } catch (error) {
        console.error("Complete Workout Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/workout/history
export const getWorkoutHistory = async (req, res) => {
    try {
        const user = await getUser(req.userId);
        const history = await WorkoutLog.find({ userId: user._id, completed: true })
            .sort({ date: -1 })
            .limit(10);
        res.json({ success: true, history });
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/workout/edit
export const editWorkout = async (req, res) => {
    try {
        const { date, updates } = req.body;
        const user = await getUser(req.userId);
        const targetDate = new Date(date);
        
        console.log(`[Workout] Editing plan for ${user.name} on ${targetDate.toDateString()}`);

        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0,0,0,0);
        
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23,59,59,999);

        // Find plan covering this date
        const plan = await WeeklyPlan.findOne({ 
            userId: user._id, 
            week_start: { $lte: endOfDay },
            week_end: { $gte: startOfDay }
        });

        if (!plan) {
            return res.status(404).json({ success: false, message: "No plan found for this date" });
        }

        // Find day index
        const targetDateStr = targetDate.toDateString();
        const dayIndex = plan.days.findIndex(d => new Date(d.date).toDateString() === targetDateStr);

        if (dayIndex === -1) {
            return res.status(404).json({ success: false, message: "Day not found in plan" });
        }

        // Apply updates
        const currentWorkout = plan.days[dayIndex].workout;
        
        // Merge updates (allow updating title, type, duration, intensity)
        plan.days[dayIndex].workout = {
            ...currentWorkout,
            ...updates
        };

        // Also update main day fields if provided
        if (updates.readiness) plan.days[dayIndex].readiness = normalizeReadiness(updates.readiness);
        // Note: phase is usually fixed but could be updated if needed

        await plan.save();

        res.json({ success: true, plan });

    } catch (error) {
        console.error("Edit Workout Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
