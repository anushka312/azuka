
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in .env file");
    process.exit(1);
}

const check = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const email = "anushka031205@gmail.com";
    const user = await User.findOne({ email });

    if (user) {
        console.log("User found:", user.email);
        console.log("Current Data:", JSON.stringify(user.toJSON(), null, 2));

        let changed = false;
        if (!user.age) {
            user.age = 20; // Default
            changed = true;
            console.log("Fixing missing age");
        }
        if (!user.cycleLength) {
            user.cycleLength = 28;
            changed = true;
        }
        if (!user.goals) {
            user.goals = { primary: "Health" };
            changed = true;
        }

        if (changed) {
            await user.save();
            console.log("User updated with required fields");
        } else {
            console.log("User data looks valid");
        }
    } else {
        console.log("User not found in DB");
    }

  } catch (e) {
    console.error("Error:", e);
  } finally {
    mongoose.connection.close();
  }
};

check();
