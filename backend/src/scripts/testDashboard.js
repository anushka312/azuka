
import mongoose from 'mongoose';
import User from '../models/User.js';
import BodyState from '../models/BodyState.js';
import MindsetLog from '../models/MindsetLog.js';
import WorkoutLog from '../models/WorkoutLog.js';
import WeeklyPlan from '../models/WeeklyPlan.js';
import { getHomeDashboard } from '../../controllers/homeController.js';
import dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });

const mockReq = {
    userId: null // Will be filled
};

const mockRes = {
    json: (data) => console.log("Response JSON:", JSON.stringify(data, null, 2).substring(0, 500) + "..."),
    status: (code) => ({
        json: (data) => console.log(`Error ${code}:`, data)
    })
};

const testDashboard = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'alicia@demo.com' });
        if (!user) {
            console.log("User not found");
            return;
        }
        mockReq.userId = user._id;
        
        console.log("Testing Dashboard for Alicia...");
        await getHomeDashboard(mockReq, mockRes);

    } catch (error) {
        console.error("Test Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

testDashboard();
