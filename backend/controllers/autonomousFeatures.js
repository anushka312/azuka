import WeeklyPlan from "../src/models/WeeklyPlan.js";
import User from "../src/models/User.js";
import BodyState from "../src/models/BodyState.js";
import workoutAgent, { generateWeekPlan } from "../src/agents/workoutAgent.js";
import metabolicAgent, { calculateWeeklyEnvelope } from "../src/agents/metabolicAgent.js";
import cravingPatternAgent from "../src/agents/cravingPatternAgent.js";
import foodVisionAgent from "../src/agents/foodVisionAgent.js";
import cycleRecipeAgent from "../src/agents/cycleRecipeAgent.js";
import intelligenceLoop from "../src/services/intelligenceLoop.js";

// --- Helper to get mock user if auth is missing for demo ---
const getUser = async (req) => {
    // TEST MODE: Bypass DB entirely
    if (req.body.test_mode) {
        return {
            _id: "mock_user_id",
            name: "Test User",
            age: 28,
            weight: 65, // kg
            height: 170, // cm
            gender: "female",
            activityLevel: "active",
            fitnessLevel: "Intermediate",
            cycleDay: req.body.cycle_day || 14,
            cycleLength: 28,
            goals: { primary: "Energy", secondary: "Strength" },
            basalMetabolicRate: 1450,
            activityFactor: 1.55
        };
    }

    // In production, req.user.id from middleware
    // For now, return a mock or find the first user
    try {
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
    } catch (e) {
        console.warn("DB User lookup failed, returning mock:", e.message);
        return {
             _id: "offline_mock",
             cycleDay: 14,
             goals: { primary: "Maintenance" }
        };
    }
};

// --- Helper to calculate phase based on day ---
const calculatePhase = (day, length = 28) => {
    // Simplified phase logic
    if (day <= 5) return "Menstrual";
    if (day <= 13) return "Follicular";
    if (day <= 17) return "Ovulatory";
    return "Luteal";
};

/**
 * /workout - The Strategist
 * Generates a 7-day workout plan based on cycle phase.
 */
export const generateWorkoutPlan = async (req, res) => {
    try {
        const user = await getUser(req);
        const startDate = new Date();
        const logs = req.body.logs || []; // Extract logs/symptoms from request
        
        // 1. Generate Plan via Agent
        const weekPlanData = await generateWeekPlan(user, startDate.toISOString(), logs);
        
        // TEST MODE: Return immediately
        if (req.body.test_mode) {
             return res.json({ success: true, plan: weekPlanData, note: "Test Mode: DB save skipped" });
        }

        // 2. Save/Update WeeklyPlan
        // Find existing plan for this week or create new
        const startOfWeek = new Date(startDate);
        startOfWeek.setHours(0,0,0,0); // Simple logic for now
        
        let plan = await WeeklyPlan.findOne({ userId: user._id, week_start: { $lte: startDate } }).sort({ week_start: -1 });
        
        if (!plan) {
             plan = new WeeklyPlan({
                 userId: user._id,
                 week_start: startOfWeek,
                 week_end: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000),
                 days: []
             });
        }

        // Merge generated days into plan
        weekPlanData.forEach(dayData => {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + dayData.day_offset);
            
            // Check if day exists
            const existingDayIndex = plan.days.findIndex(d => d.date.toDateString() === date.toDateString());
            
            const dayObject = {
                date: date,
                phase: dayData.phase_prediction,
                readiness: dayData.workout.intensity === "High" ? "Push" : "Maintain", // Simplified mapping
                workout: {
                    title: dayData.workout.title,
                    type: dayData.workout.style,
                    duration_min: dayData.workout.duration_mins,
                    intensity: dayData.workout.intensity
                },
                notes: dayData.rationale,
                status: "planned"
            };

            if (existingDayIndex >= 0) {
                plan.days[existingDayIndex] = { ...plan.days[existingDayIndex].toObject(), ...dayObject };
            } else {
                plan.days.push(dayObject);
            }
        });

        await plan.save();
        res.json({ success: true, plan: weekPlanData });

    } catch (error) {
        console.error("Workout Plan Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * /workout_missed - The Adaptive Flow
 * Reschedules missed workouts and ripples changes.
 */
export const handleMissedWorkout = async (req, res) => {
    try {
        const { date } = req.body; // Date of missed workout
        const user = await getUser(req);
        
        // Logic: Find the plan, mark day as missed, move workout to next day, push others
        // For this MVP, we will just trigger a re-plan from tomorrow.
        
        const missedDate = new Date(date || Date.now());
        const tomorrow = new Date(missedDate);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (req.body.test_mode) {
            const newPlanData = await generateWeekPlan(user, tomorrow.toISOString());
            return res.json({ success: true, message: "Workout marked missed. Re-optimizing week.", new_plan: newPlanData, note: "Test Mode: DB update skipped" });
        }

        // 1. Mark missed
        await WeeklyPlan.updateOne(
            { userId: user._id, "days.date": missedDate },
            { $set: { "days.$.status": "missed" } }
        );

        // 2. Re-generate from tomorrow
        // In a real complex system, we'd shift. Here we just ask the agent to re-strategize from tomorrow.
        const newPlanData = await generateWeekPlan(user, tomorrow.toISOString());

        // Update future days
        // (Simplified: just returning the new suggestion for the user to confirm in a real UI)
        res.json({ success: true, message: "Workout marked missed. Re-optimizing week.", new_plan: newPlanData });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * /calories_tracker - The Metabolic Engine
 * Calculates 7-day caloric envelope.
 */
export const trackCalories = async (req, res) => {
    try {
        const user = await getUser(req);
        const startDate = new Date().toISOString();
        
        const envelope = await calculateWeeklyEnvelope(user, startDate);
        
        // Optionally save to WeeklyPlan (omitted for brevity, similar to workout)
        
        res.json({ success: true, metabolic_envelope: envelope });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * /craving_analyser - The Bio-Emotional Loop
 */
export const analyzeCravings = async (req, res) => {
    try {
        const user = await getUser(req);
        const { time, emotion, craving } = req.body;
        
        // Mock historical logs for now
        const historicalLogs = [
            { cycle_day: 26, symptom: "Sugar Craving", stress: 0.8 },
            { cycle_day: 27, symptom: "Sugar Craving", stress: 0.9 }
        ];

        // Mock current tier1 state (usually fetched from BodyState)
        const phase = calculatePhase(user.cycleDay, user.cycleLength);
        const tier1State = {
            cycle: { day: user.cycleDay, phase: phase }, 
            stress: { score: 0.8 }
        };

        const analysis = await cravingPatternAgent(historicalLogs, tier1State);
        res.json({ success: true, analysis });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * /food_vision - The Macro Parser
 */
export const analyzeFoodImage = async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        const user = await getUser(req);
        
        // TEST MODE: Mock response if no valid image provided
        if (req.body.test_mode && (!imageBase64 || imageBase64 === "test_image_string")) {
            return res.json({
                success: true,
                analysis: {
                    meal_identification: ["Grilled Chicken Salad"],
                    macros: { calories: 450, protein: 40, carbs: 15, fat: 20 },
                    cycle_match_score: 0.9,
                    missing_elements: ["Complex Carbs"],
                    rationale: "Great protein for Follicular phase, but slightly low on carbs for high energy demand."
                },
                note: "Test Mode: Mocked Vision Analysis (Agent skipped due to invalid image)"
            });
        }

        // Mock Tier 1
        const phase = calculatePhase(user.cycleDay, user.cycleLength);
        const tier1Outputs = {
            cycle: { day: user.cycleDay, phase: phase }
        };

        const analysis = await foodVisionAgent(imageBase64, tier1Outputs);
        res.json({ success: true, analysis });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * /recipe_generator - The Phase-Specific Chef
 */
export const generateRecipe = async (req, res) => {
    try {
        const user = await getUser(req);
        const { ingredients } = req.body;
        
        const phase = calculatePhase(user.cycleDay, user.cycleLength);
        // Higher carb need in Luteal/Ovulatory
        const carbNeed = (phase === "Luteal" || phase === "Ovulatory") ? 0.8 : 0.5;

        const tier1Data = {
            cycle: { day: user.cycleDay, phase: phase },
            metabolic: { carb_need: carbNeed }
        };
        
        const tier2Data = {
            max_time_commitment_mins: 30,
            available_ingredients: ingredients || []
        };

        const recipe = await cycleRecipeAgent(tier1Data, tier2Data);
        res.json({ success: true, recipe });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * /body_analyser - The Digital Twin
 */
export const getDigitalTwin = async (req, res) => {
    try {
        const user = await getUser(req);
        const logs = req.body; // symptoms, sleep, etc.
        
        const result = await intelligenceLoop(user, logs);
        res.json({ success: true, digital_twin: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
