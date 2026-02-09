import mongoose from "mongoose";

const MindsetLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  mood: { type: Number, min: 0, max: 100 },
  energy: { type: Number, min: 0, max: 100 },
  stress: { type: Number, min: 0, max: 100 },
  sleep_hours: Number,
  sleep_quality: { type: Number, min: 0, max: 100 },
  notes: String,
  created_at: { type: Date, default: Date.now }
});

// Composite index to ensure one log per day per user (optional, but good practice)
MindsetLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("MindsetLog", MindsetLogSchema);
