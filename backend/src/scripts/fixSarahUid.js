
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const fixSarah = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const email = "sarah@demo.com";
        const newUid = "vBakMp0ctrbCUIN5vuZFu4jRX1z2";

        const user = await User.findOne({ email });
        if (user) {
            console.log(`Found user ${user.name} (${user.email})`);
            console.log(`Old UID: ${user.firebaseUid}`);
            user.firebaseUid = newUid;
            await user.save();
            console.log(`Updated UID to: ${newUid}`);
        } else {
            console.log("User sarah@demo.com not found!");
        }

        mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

fixSarah();
