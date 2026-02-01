import mongoose from "mongoose";

const FoodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, required: true },

  entries: [
    {
      type: { type: String, enum: ["photo", "manual"] },
      food: String,
      calories: Number,
      macros: {
        carbs: Number,
        protein: Number,
        fat: Number
      }
    }
  ],

  total_calories: Number
});

export default mongoose.model("FoodLog", FoodLogSchema);
