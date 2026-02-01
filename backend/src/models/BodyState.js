import mongoose from "mongoose";

const BodyStateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  cycle: { // cycle agent
    day: { type: Number, min: 1, max: 35 },
    phase: { type: String, enum: ["menstrual", "follicular", "ovulatory", "luteal"] },
    predicted_next_phase: String
  },

  physiology: { //cycle agent
    energy: { type: Number, min: 0, max: 1 },
    fatigue: { type: Number, min: 0, max: 1 },
    inflammation_risk: { type: Number, min: 0, max: 1 }
  },

  sleep: {
    hours: Number,
    quality_score: { type: Number, min: 0, max: 1 },
    soreness: Number
  },

  symptoms: [String],

  stress: {  //cyle agent
    score: { type: Number, min: 0, max: 1 },
    cortisol_risk: { type: Number, min: 0, max: 1 },
    nervous_system_state: String
  },

  metabolic: { //cyle agent
    fuel_risk: { type: Number, min: 0, max: 1 },
    carb_need: { type: Number, min: 0, max: 1 },
    daily_calorie_band: {
      min: Number,
      max: Number
    }
  },

  behavior: {
    adherence_risk: { type: Number, min: 0, max: 1 },
    motivation_state: String,
    missed_sessions_7d: Number
  },

  date: { type: Date, default: Date.now }
});

export default mongoose.model("BodyState", BodyStateSchema);
