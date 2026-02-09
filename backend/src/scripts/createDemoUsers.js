
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import BodyState from '../models/BodyState.js';
import MindsetLog from '../models/MindsetLog.js';
import WorkoutLog from '../models/WorkoutLog.js';
import FoodLog from '../models/FoodLog.js';
import WeeklyPlan from '../models/WeeklyPlan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing in .env");
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log(`MongoDB Connected to database: ${mongoose.connection.name}`);
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    }
};

const users = [
    // 1. Onboarded: Weight Loss (Alicia Profile)
    {
        name: "Alicia (Demo)",
    email: "alicia@demo.com",
    age: 28,
    height: 165,
    weight: 65, // Adjusted to BMI 23.8 (Healthy) to test Weight Loss feature
    activityLevel: "Moderately Active",
    cycleDay: 24, // Luteal
    cycleLength: 28,
    lastPeriod: new Date(new Date().setDate(new Date().getDate() - 24)),
    goals: { primary: "Weight Loss", secondary: "Energy", target_weight: 60 },
    isOnboarded: true,
        basalMetabolicRate: 1450,
        activityFactor: 1.55,
        firebaseUid: "demo_uid_alicia" // Placeholder, will be updated on signup
    },
    // 2. Onboarded: Muscle Gain (Sarah)
    {
        name: "Sarah (Muscle)",
        email: "sarah@demo.com",
        age: 24,
        height: 170,
        weight: 62,
        activityLevel: "Very Active",
        cycleDay: 5, // Follicular
        cycleLength: 29,
        lastPeriod: new Date(new Date().setDate(new Date().getDate() - 5)),
        goals: { primary: "Muscle Gain", secondary: "Strength", target_weight: 66 },
        isOnboarded: true,
        basalMetabolicRate: 1550,
        activityFactor: 1.725,
        firebaseUid: "demo_uid_sarah"
    },
    // 3. Onboarded: PCOS/Maintenance (Jen)
    {
        name: "Jen (PCOS)",
        email: "jen@demo.com",
        age: 30,
        height: 160,
        weight: 75,
        activityLevel: "Lightly Active",
        cycleDay: 14, // Ovulation (irregular)
        cycleLength: 35,
        lastPeriod: new Date(new Date().setDate(new Date().getDate() - 14)),
        goals: { primary: "Maintenance", secondary: "Hormone Balance", target_weight: 70 },
        isOnboarded: true,
        basalMetabolicRate: 1400,
        activityFactor: 1.375,
        firebaseUid: "demo_uid_jen"
    },
    // 4. Non-Onboarded 1
    {
        name: "New User 1",
        email: "new1@demo.com",
        age: 0, // Placeholder
        isOnboarded: false,
        firebaseUid: "demo_uid_new1"
    },
    // 5. Non-Onboarded 2
    {
        name: "New User 2",
        email: "new2@demo.com",
        age: 0,
        isOnboarded: false,
        firebaseUid: "demo_uid_new2"
    }
];

const seedUsers = async () => {
    await connectDB();

    console.log("Cleaning existing demo users...");
    // Remove users with these emails to avoid duplicates
    const emails = users.map(u => u.email);
    await User.deleteMany({ email: { $in: emails } });

    console.log("Creating users...");
    const createdUsers = await User.insertMany(users);
    
    console.log("------------------------------------------------");
    console.log("CREATED DEMO ACCOUNTS (Use 'Sign Up' with these emails):");
    console.log("------------------------------------------------");
    
    createdUsers.forEach(u => {
        console.log(`Email: ${u.email}`);
        console.log(`Password: (Use any password you want, e.g., 'password123')`);
        console.log(`Status: ${u.isOnboarded ? "✅ ONBOARDED" : "❌ NOT ONBOARDED"}`);
        console.log(`Profile: ${u.goals?.primary || "None"}`);
        console.log("------------------------------------------------");
    });

    // Add some logs for Alicia (Weight Loss) to show graphs
    console.log("Seeding 10 days of data for BOARDED users...");

    const boardedUsers = createdUsers.filter(u => u.isOnboarded);
    
    for (const user of boardedUsers) {
        console.log(`Generating data for ${user.name}...`);
        
        const bodyStates = [];
        const mindsetLogs = [];
        const workoutLogs = [];
        const foodLogs = [];

        for (let i = 0; i < 10; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0); // Normalize time

            // 1. Body State (Random variations)
            const sleepHours = 6 + Math.random() * 3; // 6-9 hours
            bodyStates.push({
                userId: user._id,
                date: date,
                sleep: { 
                    hours: parseFloat(sleepHours.toFixed(1)), 
                    quality_score: 0.5 + Math.random() * 0.5, // 0.5 - 1.0
                    soreness: Math.random() * 0.4 
                },
                stress: { 
                    score: Math.random() * 0.6, 
                    cortisol_risk: Math.random() * 0.5 
                },
                physiology: { 
                    energy: 0.4 + Math.random() * 0.6, 
                    fatigue: Math.random() * 0.4 
                },
                cycle: {
                    day: ((user.cycleDay - i + user.cycleLength) % user.cycleLength) || user.cycleLength,
                    phase: "luteal", // Simplified for demo
                    predicted_next_phase: "menstrual"
                }
            });

            // 2. Mindset Log
            mindsetLogs.push({
                userId: user._id,
                date: date,
                mood: Math.floor(50 + Math.random() * 50),
                energy: Math.floor(40 + Math.random() * 60),
                stress: Math.floor(Math.random() * 50),
                sleep_hours: parseFloat(sleepHours.toFixed(1)),
                sleep_quality: Math.floor(50 + Math.random() * 50),
                notes: i === 0 ? "Feeling great today!" : "Just a regular day."
            });

            // 3. Workout Log (Every other day approx)
            if (i % 2 === 0) {
                workoutLogs.push({
                    userId: user._id,
                    date: date,
                    planned: {
                        activityType: "Strength Training",
                        duration_min: 45,
                        intensity: "High"
                    },
                    completed: true,
                    self_logged: {
                        activityType: "Strength Training",
                        duration_min: 45,
                        calories_burned: 300 + Math.floor(Math.random() * 100)
                    },
                    source: "planned"
                });
            }

            // 4. Food Log
            foodLogs.push({
                userId: user._id,
                date: date,
                entries: [
                    {
                        type: "manual",
                        food: "Oatmeal with Berries",
                        calories: 350,
                        macros: { carbs: 45, protein: 12, fat: 6 }
                    },
                    {
                        type: "manual",
                        food: "Grilled Chicken Salad",
                        calories: 450,
                        macros: { carbs: 15, protein: 40, fat: 20 }
                    }
                ],
                total_calories: 800 + Math.floor(Math.random() * 500)
            });
        }

        await BodyState.insertMany(bodyStates);
        await MindsetLog.insertMany(mindsetLogs);
        await WorkoutLog.insertMany(workoutLogs);
        await FoodLog.insertMany(foodLogs);

        // 5. Weekly Plan (Current Week + Next Week)
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
        startOfWeek.setHours(0,0,0,0);

        const generateWeekPlan = async (startDate, weekOffset) => {
            const days = [];
            for(let d=0; d<7; d++){
                const pDate = new Date(startDate);
                pDate.setDate(pDate.getDate() + d);
                
                let wType = "Rest";
                let wDuration = 0;
                // Add Saturday (d=6) to the workout schedule for demo purposes
                if(d === 1 || d === 3 || d === 5 || d === 6) { // Mon, Wed, Fri, Sat
                    wType = d === 6 ? "Active Recovery" : "Strength Foundations";
                    wDuration = 45;
                }

                // Calorie Logic based on Goal
                let calMin = 1800, calMax = 2000;
                if(user.goals?.primary === 'Weight Loss') { calMin = 1400; calMax = 1600; }
                if(user.goals?.primary === 'Muscle Gain') { calMin = 2200; calMax = 2500; }

                days.push({
                    date: pDate,
                    phase: "luteal",
                    readiness: "Maintain",
                    workout: {
                        title: wType,
                        type: wType === "Rest" ? "Rest" : "Strength",
                        duration_min: wDuration,
                        intensity: wType === "Rest" ? "Low" : "Moderate"
                    },
                    calorie_target: { min: calMin, max: calMax },
                    macro_targets: { protein: 30, carbs: 40, fats: 30 },
                    status: "planned"
                });
            }

            await WeeklyPlan.create({
                userId: user._id,
                week_start: startDate,
                week_end: new Date(startDate.getTime() + 6*24*60*60*1000),
                goal: user.goals,
                days: days
            });
        };

        // Generate Current Week
        await generateWeekPlan(startOfWeek, 0);
        
        // Generate Next Week
        const nextWeekStart = new Date(startOfWeek);
        nextWeekStart.setDate(nextWeekStart.getDate() + 7);
        await generateWeekPlan(nextWeekStart, 1);
    }

    console.log("Logs & Plans seeded successfully.");

    process.exit();
};

seedUsers();
