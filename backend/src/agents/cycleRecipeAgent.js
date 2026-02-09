import { callGemini } from "../services/geminiClient.js";

/**
 * Agent 8: Cycle Recipe
 * Role: Generates precision meals based on hormonal needs, fuel risk, and available time.
 * Logic: Matches ingredients to phase-specific micronutrient requirements.
 */
export default async function cycleRecipeAgent(tier1Data, tier2Data) {
    const prompt = `
    ROLE: You are the Azuka Culinary Nutritionist (Expert in Phase-Syncing Meals).
    
    # KNOWLEDGE CONTEXT (Nutrient Targets):
    - MENSTRUAL: Iron + Vitamin C (Absorption) + B12. Focus on "Warming/Grounding" (Soups, Stews).
    - FOLLICULAR: Zinc + Vitamin E + Probiotics. Focus on "Light/Fresh" (Fermented foods, lean protein).
    - OVULATORY: Fiber + Antioxidants + B-Vitamins. Focus on "Estrogen Metabolism" (Cruciferous veggies).
    - LUTEAL: Magnesium + Calcium + Complex Carbs + Tryptophan (Serotonin). Focus on "Satiety/Blood Sugar Stability."

    # INPUT DATA:
    - Biological Needs: ${JSON.stringify(tier1Data)}
    - Logistics & Feasibility: ${JSON.stringify(tier2Data)}

    # DIAGNOSTIC PROTOCOL:
    1. CARB MATCHING: Set meal carbohydrate complexity based on 'carb_need' (${tier1Data.metabolic.carb_need}).
    2. FRICTION REDUCTION: If 'max_time_commitment_mins' is low, suggest a "10-minute" or "No-cook" version.
    3. MICRONUTRIENT INJECTION: Explicitly state which "Power Ingredient" addresses today's specific symptom (e.g., Spinach for Iron).

    # NAMING CONVENTION:
    - The 'meal_name' MUST be culinary and descriptive (e.g., "Lemon Herb Salmon with Quinoa").
    - DO NOT use "medical" or "phase-based" names (e.g., "Follicular Phase Salad", "Period Power Stew").

    # TASK:
    Generate one primary meal suggestion that fits the user's constraints and current phase.

    RETURN ONLY VALID JSON:
    {
      "meal_name": "string (Culinary name only)",
      "ingredients": ["string (quantity + item)"],
      "instructions": ["string (step-by-step cooking instructions)"],
      "prep_time_mins": number,
      "macros": { "calories": number, "protein": number, "carbs": number, "fat": number },
      "power_nutrients": { "nutrient_name": "reason for this phase" },
      "biological_rationale": "Why this meal is perfect for Day ${tier1Data.cycle.day} and their current stress/energy levels."
    }
    `;

    const response = await callGemini(prompt);
    
    return JSON.parse(response.replace(/```json|```/g, ""));
}