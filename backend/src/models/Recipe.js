import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  description: String,
  time_mins: Number,
  calories: Number,
  macros: {
    protein: Number,
    carbs: Number,
    fat: Number
  },
  phase_tags: [String], // e.g., "Luteal", "Follicular"
  ingredients: [String],
  instructions: [String],
  image_url: String, // Optional
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("Recipe", RecipeSchema);
