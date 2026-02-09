import { callGemini } from "../services/geminiClient.js";

/**
 * Agent: Food Vision
 * Role: Nutritional Analyst
 * Input: Image Base64
 * Output: JSON with meal ID and macros.
 */
export default async function foodVisionAgent(imageBase64) {
    const prompt = `
    ROLE: You are an expert nutritionist and food analyst.
    
    TASK: Analyze the provided food image.
    1. Identify the meal/foods.
    2. Estimate total calories and macros (Protein, Carbs, Fat) with high accuracy.
    3. If unclear, provide a best guess based on visible portion size.

    OUTPUT FORMAT (JSON ONLY):
    {
        "meal_identification": ["List of main items"],
        "macros": {
            "calories": number,
            "protein": number, // grams
            "carbs": number, // grams
            "fat": number // grams
        },
        "confidence": "high | medium | low"
    }
    `;

    try {
        const response = await callGemini(prompt, imageBase64);
        
        // Cleaning
        let cleanResponse = response.replace(/```json|```/g, "").trim();
        const jsonStart = cleanResponse.indexOf('{');
        const jsonEnd = cleanResponse.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
        }

        return JSON.parse(cleanResponse);
    } catch (error) {
        console.error("Food Vision Agent Error:", error);
        // Fallback
        return {
            meal_identification: ["Unknown Food"],
            macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
            confidence: "low"
        };
    }
}
