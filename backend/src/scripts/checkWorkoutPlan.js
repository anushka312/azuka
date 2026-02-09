
import mongoose from 'mongoose';
import User from '../models/User.js';
import WeeklyPlan from '../models/WeeklyPlan.js';
import dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });

const checkPlan = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const user = await User.findOne({ email: 'alicia@demo.com' });
        if (!user) {
            console.log("Alicia not found");
            return;
        }

        console.log(`Checking plan for user: ${user._id}`);

        const plans = await WeeklyPlan.find({ userId: user._id }).sort({ week_start: -1 });
        console.log(`Found ${plans.length} plans.`);

        if (plans.length > 0) {
            const latest = plans[0];
            console.log("Latest Plan Start:", latest.week_start);
            console.log("Latest Plan End:", latest.week_end);
            console.log("Days:", latest.days.length);
            
            const today = new Date();
            today.setHours(0,0,0,0);
            
            const todayPlan = latest.days.find(d => {
                const dDate = new Date(d.date);
                dDate.setHours(0,0,0,0);
                return dDate.getTime() === today.getTime();
            });

            if (todayPlan) {
                console.log("Today's Plan:", JSON.stringify(todayPlan.workout, null, 2));
            } else {
                console.log("No plan found for today in the latest weekly plan.");
                console.log("Plan Dates:", latest.days.map(d => d.date));
            }
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

checkPlan();
