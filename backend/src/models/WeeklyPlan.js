import mongoose from "mongoose";

const DayPlanSchema = new mongoose.Schema({
  date: { type: Date, required: true },

  phase: {
    type: String,
    enum: ["menstrual", "follicular", "ovulatory", "luteal"],
    required: true
  },

  readiness: {
    type: String,
    enum: ["Push", "Maintain", "Gentle", "Recover"],
    required: true
  },

  workout: {
    title: String,
    type: String,        // strength, hiit, yoga, walk
    duration_min: Number,
    intensity: String
  },

  calorie_target: {
    min: Number,
    max: Number
  },

  status: {
    type: String,
    enum: ["planned", "completed", "missed", "rescheduled"],
    default: "planned"
  },

  auto_replanned: {
    type: Boolean,
    default: false
  },

  notes: String
});

const WeeklyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  week_start: { type: Date, required: true },
  week_end: { type: Date, required: true },

  goal: {
    primary: String,
    secondary: String
  },

  days: [DayPlanSchema],

  system_version: {
    type: String,
    default: "v1.0"
  },

  created_at: { type: Date, default: Date.now },
  last_updated: { type: Date, default: Date.now }
});

export default mongoose.model("WeeklyPlan", WeeklyPlanSchema);
