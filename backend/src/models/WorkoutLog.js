import mongoose from "mongoose";

const WorkoutLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, required: true },

  planned: {
    activityType: String,
    duration_min: Number,
    intensity: String
  },

  completed: { type: Boolean, default: false },

  self_logged: {
    activityType: String,
    duration_min: Number,
    calories_burned: Number
  },

  source: { type: String, enum: ["planned", "self", "imported"] },

  auto_recalculated: { type: Boolean, default: false }
});

export default mongoose.model("WorkoutLog", WorkoutLogSchema);
