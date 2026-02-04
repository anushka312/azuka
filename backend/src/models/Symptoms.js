// models/SymptomLog.js
import mongoose from "mongoose";

const SymptomLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  date: {
    type: Date,
    default: Date.now,
    index: true
  },

  symptoms: {
    type: [String],
    required: true
  },

  mood: { type: String },          // optional
  cravings: [String]               // optional
});

export default mongoose.model("SymptomLog", SymptomLogSchema);
