import { callGemini } from "../services/geminiClient.js";

/**
 * Agent 4: Metabolic & Fuel
 * Role: Detects under-fueling and blood sugar instability.
 * Logic: Calculates the 'Fuel Gap' based on metabolic increases in the Luteal phase.
 */
export default async function metabolicAgent(userData, logs, cycleState) {
    const prompt = `
    ROLE: You are the Azuka Metabolic Specialist (Expert in Female Endocrinology & Nutrition).
    
    # KNOWLEDGE CONTEXT:
    - THE LUTEAL SHIFT: Resting Metabolic Rate (RMR) increases by 5-10% (100-300 kcal). Progesterone promotes fat oxidation but impairs carbohydrate (glycogen) storage.
    - SEROTONIN DROP: Estrogen/Progesterone withdrawal triggers a drop in serotonin, causing "Sugar Cravings" as the brain seeks a quick neurochemical lift.
    - PROTEIN NEEDS: Protein breakdown is higher in the Luteal phase; leucine requirements increase to maintain muscle mass.

    # INPUT DATA:
    - User Stats: ${JSON.stringify(userData)}
    - Logs: ${JSON.stringify(logs)}
    - Cycle Data: ${JSON.stringify(cycleState)}

    # DIAGNOSTIC PROTOCOL:
    1. CALCULATE FUEL RISK:
       - Base = (Calorie_Deficit_Reported * 0.4) + (Fatigue_Score * 0.3) + (Cravings_Frequency * 0.3).
       - If Phase is 'Luteal', ADD 0.25 to Fuel Risk (due to increased RMR).
    
    2. CALCULATE CARB NEED (0-1):
       - If Follicular: 0.5 (Stable insulin sensitivity).
       - If Ovulatory: 0.8 (Peak glycogen demand for peak power).
       - If Luteal: 0.9 (Crucial for blood sugar stability and serotonin production).

    # TASK:
    Analyze the metabolic state and provide fueling targets.

    RETURN ONLY VALID JSON:
    {
      "fuel_risk": 0-1,
      "carb_need": 0-1,
      "recommended_calorie_adjustment": "+number | -number",
      "rationale": "Explain the biological reason for the carb need (e.g., 'Progesterone is increasing your calorie burn' or 'Estrogen is making you insulin sensitive')."
    }
    `;

    const response = await callGemini(prompt);
    
    return JSON.parse(response.replace(/```json|```/g, ""));
}