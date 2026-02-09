
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import { calculateWeeklyEnvelope } from './src/agents/metabolicAgent.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const user = await User.findOne({ email: 'jen@demo.com' });
        if (!user) {
            console.log("User Jen not found");
            return;
        }

        console.log(`\nTesting Metabolic Agent for: ${user.name}`);
        console.log(`Stats: ${user.weight}kg, ${user.height}cm, Age: ${user.age}`);
        console.log(`Goals: ${JSON.stringify(user.goals)}`);

        console.log("\nRunning Agent...");
        const dateKey = new Date().toISOString().split('T')[0];
        const result = await calculateWeeklyEnvelope(user, dateKey);

        console.log("\n--- Agent Result ---");
        console.log(JSON.stringify(result, null, 2));

        // Validation
        const absurd = result.some(day => day.calorie_target.max > 4500 || day.calorie_target.min < 1000);
        if (absurd) {
            console.error("\n❌ FAILED: Absurd values detected!");
        } else {
            console.log("\n✅ PASSED: All values within safe range.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
