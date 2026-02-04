// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age:{type: Number, required: true} ,
  height: { type: Number }, // cm
  weight: { type: Number }, // kg
  activityLevel: { type: String, enum: ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"], default: "Sedentary" },
  cycleDay: Number,
  cycleLength: Number,
  lastPeriod: Date,
  goals: {
    primary: String,
    secondary: String,
    target_weight: Number
  },
  basalMetabolicRate: { type: Number, default: 1400 }, // Default BMR
  activityFactor: { type: Number, default: 1.2 }, // Sedentary default
  stressBaseline: {type: Number, default: 0.5},
  energyBaseline: {type: Number, default: 0.5},
  timeWindows: [String],
  foodPrefs: [String],
  allergies: [String]
}, {timestamps : true});

export default mongoose.model("User", UserSchema);
