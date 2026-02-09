
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import WeeklyPlan from "../models/WeeklyPlan.js";
import SymptomLog from "../models/Symptoms.js";
import FoodLog from "../models/FoodLog.js";
import WorkoutLog from "../models/WorkoutLog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in .env file");
    process.exit(1);
}

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // 1. Cleanup Demo User
    const existingUser = await User.findOne({ email: "demo@azuka.app" });
    if (existingUser) {
        await WeeklyPlan.deleteMany({ userId: existingUser._id });
        await SymptomLog.deleteMany({ userId: existingUser._id });
        await FoodLog.deleteMany({ userId: existingUser._id });
        await WorkoutLog.deleteMany({ userId: existingUser._id });
        await User.deleteOne({ _id: existingUser._id });
        console.log("Cleaned up old demo data");
    }

    // 2. Create Demo User
    const user = await User.create({
      name: "Alicia",
      email: "demo@azuka.app",
      age: 24,
      height: 165,
      weight: 60,
      activityLevel: "Moderately Active",
      cycleDay: 22, // Luteal
      cycleLength: 28,
      lastPeriod: new Date(new Date().setDate(new Date().getDate() - 22)),
      goals: {
        primary: "Weight Loss",
        secondary: "Energy",
        target_weight: 55
      },
      basalMetabolicRate: 1380,
      activityFactor: 1.55,
      stressBaseline: 0.4,
      energyBaseline: 0.6,
      foodPrefs: ["Vegetarian", "High Protein"],
      allergies: ["Peanuts"],
      isOnboarded: true
    });
    console.log("Created User:", user.name);

    // 3. Create Weekly Plan (Current Week)
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        d.setHours(0,0,0,0);
        
        // Mock logic for plan
        const isPast = d < today;
        const isToday = d.toDateString() === today.toDateString();
        
        days.push({
            date: d,
            phase: "luteal",
            readiness: i % 2 === 0 ? "Maintain" : "Gentle",
            workout: {
                title: i % 2 === 0 ? "Strength Foundations" : "Active Recovery Walk",
                type: i % 2 === 0 ? "strength" : "walk",
                duration_min: 45,
                intensity: "Medium"
            },
            calorie_target: { min: 1800, max: 2000 },
            // Adjusted macros to match ~1900 kcal (130p/200c/65f)
            macro_targets: { protein: 130, carbs: 200, fats: 65 },
            analysis: "Focus on protein and stability exercises during Luteal phase.",
            status: isPast ? "completed" : (isToday ? "planned" : "planned"),
            notes: "Focus on form."
        });

        // If completed, add to WorkoutLog for Calendar
        if (isPast) {
             await WorkoutLog.create({
                 userId: user._id,
                 date: d,
                 type: i % 2 === 0 ? "strength" : "walk",
                 duration: 45,
                 caloriesBurned: i % 2 === 0 ? 300 : 150,
                 notes: "Completed according to plan."
             });
        }
    }

    await WeeklyPlan.create({
        userId: user._id,
        week_start: startOfWeek,
        week_end: new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000),
        goal: user.goals,
        days: days
    });
    console.log("Created Weekly Plan");

    // 4. Create Logs (History)
    // Yesterday Symptom
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await SymptomLog.create({
        userId: user._id,
        date: yesterday,
        symptoms: ["Bloating", "Cravings (Sweet)"],
        mood: "Neutral"
    });

    // Today Food
    await FoodLog.create({
        userId: user._id,
        date: today,
        entries: [
            { name: "Oatmeal & Berries", calories: 350, protein: 12, carbs: 55, fat: 6, time: "08:00" }
        ],
        total_calories: 350
    });

    console.log("Created Logs");
    console.log("SEED COMPLETE. Demo User ID:", user._id);

  } catch (e) {
    console.error("Seed Error:", e);
  } finally {
    mongoose.connection.close();
  }
};

seed();
