// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  age:{type: Number, required: true} ,
  cycleLength: Number,
  lastPeriod: Date,
  goals: {
    primary: String,
    secondary: String,
    target_weight: Number
  },
  stressBaseline: {type: Number, default: 0.5},
  energyBaseline: {type: Number, default: 0.5},
  timeWindows: [String],
  foodPrefs: [String],
  allergies: [String]
}, {timestamps : true});

export default mongoose.model("User", UserSchema);
