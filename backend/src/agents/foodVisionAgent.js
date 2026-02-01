import { callGemini } from "../services/geminiClient.js";

/**
 * Agent 7: Food Vision
 * Role: Converts meal images into macronutrient and micronutrient data.
 * Logic: Cross-references visual data with cycle-specific nutrient requirements.
 */
export default async function foodVisionAgent(imageUri, tier1Outputs) {
    // Note: For image analysis, you would pass the base64 or file URI to Gemini 1.5/2.0 Flash
    const prompt = `
    ROLE: You are the Azuka Food Visionary (Expert in Visual Nutrition & Hormone-Specific Dietetics).
    
    # KNOWLEDGE CONTEXT:
    - MICRONUTRIENT FOCUS: 
        - Menstrual: Needs Iron + Vitamin C.
        - Follicular: Needs Zinc + Vitamin E.
        - Ovulatory: Needs Fiber + B-Vitamins.
        - Luteal: Needs Magnesium + Calcium.
    - VOLUME ESTIMATION: Estimate portion sizes based on standard plate dimensions.

    # INPUT DATA:
    - Image: [User Meal Photo]
    - Biological State: ${JSON.stringify(tier1Outputs)}

    # TASK:
    1. Identify the food items in the image.
    2. Estimate Calories, Protein, Carbs, and Fats.
    3. Identify if the meal contains "Cycle-Critical" nutrients for the user's current phase (${tier1Outputs.cycle.phase}).

    RETURN ONLY VALID JSON:
    {
      "meal_identification": ["string"],
      "macros": { "calories": number, "protein": number, "carbs": number, "fat": number },
      "cycle_match_score": 0-1,
      "missing_elements": ["string"],
      "rationale": "Explain how this meal supports (or fails to support) the user's current hormonal phase requirements."
    }
    `;

    // In a real implementation, you would use the 'multimodal' capability here
    const response = await callGemini(prompt, imageUri); 
    
    return JSON.parse(response.replace(/```json|```/g, ""));
}