import mongoose from "mongoose";

const CalendarSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  title: String,
  type: { type: String, enum: ["workout",  "note"] },

  planned: Boolean,
  completed: Boolean,

  date: Date,
  phase: String,

  refType: String,   // "WorkoutLog" or "FoodLog"
  refId: mongoose.Schema.Types.ObjectId
});

export default mongoose.model("Calendar", CalendarSchema);
