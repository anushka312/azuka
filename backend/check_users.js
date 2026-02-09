
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const users = await User.find({}, 'name email isOnboarded age fitnessLevel goals');
        
        console.log("\n--- Users Found ---");
        users.forEach(u => {
            console.log(`ID: ${u._id}`);
            console.log(`Name: ${u.name}`);
            console.log(`Email: ${u.email}`);
            console.log(`Onboarded: ${u.isOnboarded}`);
            console.log(`Details: Age ${u.age}, Goals: ${JSON.stringify(u.goals)}`);
            console.log("-------------------");
        });

        if (users.length === 0) {
            console.log("No users found.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
