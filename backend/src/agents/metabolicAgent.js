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

export async function calculateWeeklyEnvelope(user, startDate) {
    const prompt = `
    ROLE: You are the Azuka Metabolic Engine.
    
    # MISSION: Calculate a 7-Day Caloric & Macro Envelope starting from ${startDate}.
    
    # USER PROFILE:
    - Height: ${user.height} cm
    - Weight: ${user.weight} kg
    - BMR: ${user.basalMetabolicRate}
    - Activity Factor: ${user.activityFactor}
    - Current Cycle Day: ${user.cycleDay}
    - Goal: ${user.goals?.primary || "Maintenance"}

    # LOGIC:
    1. TDEE CALCULATION: Start with BMR * Activity Factor.
    2. GOAL ADJUSTMENT:
       - "Fat Loss": Subtract 300-500 kcal from TDEE.
       - "Muscle Gain": Add 200-300 kcal to TDEE.
       - "Maintenance": Use TDEE.
    3. PHASE ADJUSTMENT (Apply on top of Goal):
       - Luteal Phase: ADD 100-200 kcal (to support RMR increase).
       - Menstrual Phase: Maintenance (Prioritize comfort).
       - Follicular Phase: Strict adherence to Goal Adjustment.

    # TASK:
    Generate a 7-day nutritional forecast.

    RETURN ONLY VALID JSON:
    [
      {
        "day_offset": 0,
        "phase_prediction": "string",
        "calorie_target": { "min": number, "max": number },
        "macro_split": { "protein_pct": number, "carb_pct": number, "fat_pct": number },
        "focus_nutrient": "string" // e.g., Magnesium, Iron
      },
      ... (7 items total)
    ]
    `;

    const response = await callGemini(prompt);
    return JSON.parse(response.replace(/```json|```/g, ""));
}