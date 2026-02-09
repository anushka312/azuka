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
    
    // Robust JSON cleaning
    let cleanResponse = response.replace(/```json|```/g, "").trim();
    // If response still contains text outside JSON, try to extract JSON
    const jsonStart = cleanResponse.indexOf('{');
    const jsonEnd = cleanResponse.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
    }

    return JSON.parse(cleanResponse);
}

export async function calculateWeeklyEnvelope(user, startDate) {
    // 1. Ensure BMR is available
    let bmr = user.basalMetabolicRate;
    if (!bmr) {
        // Mifflin-St Jeor Formula (Female)
        bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age) - 161;
    }

    // 2. Ensure Activity Factor is numeric
    let activityFactor = user.activityFactor;
    if (typeof activityFactor === 'string') {
        const map = {
            "Sedentary": 1.2,
            "Lightly Active": 1.375,
            "Moderately Active": 1.55,
            "Very Active": 1.725
        };
        activityFactor = map[activityFactor] || 1.375;
    }
    if (!activityFactor) activityFactor = 1.375;

    const prompt = `
    ROLE: You are the Azuka Metabolic Engine.
    
    # MISSION: Calculate a 7-Day Caloric & Macro Envelope starting from ${startDate}.
    
    # USER PROFILE:
    - Height: ${user.height} cm
    - Weight: ${user.weight} kg
    - BMR: ${Math.round(bmr)} kcal (Calculated)
    - Activity Factor: ${activityFactor}
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
    Generate a 7-day nutritional & fitness forecast.
    IMPORTANT: All calorie values MUST be in Kcal (Calories), NOT kJ. Target range typically 1200-3500 kcal.

    IMPORTANT: RETURN ONLY VALID JSON. NO PREAMBLE. NO EXPLANATION.
    [
      {
        "day_offset": 0,
        "phase_prediction": "Menstrual | Follicular | Ovulatory | Luteal",
        "readiness": "Push | Maintain | Gentle | Recover",
        "workout": {
            "title": "string",
            "type": "Strength | HIIT | Yoga | Cardio | Rest",
            "duration_min": number,
            "intensity": "High | Moderate | Low"
        },
        "calorie_target": { "min": number, "max": number },
        "macro_split": { "protein_pct": number, "carb_pct": number, "fat_pct": number },
        "focus_nutrient": "string" 
      },
      ... (7 items total)
    ]
    `;

    const response = await callGemini(prompt);
    
    // Robust JSON cleaning
    let cleanResponse = response.replace(/```json|```/g, "").trim();
    const jsonStart = cleanResponse.indexOf('[');
    const jsonEnd = cleanResponse.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
    }
    
    let data = JSON.parse(cleanResponse);

    // POST-PROCESSING: Safety Check for Absurd Values
    data = data.map(day => {
        let min = day.calorie_target?.min || 2000;
        let max = day.calorie_target?.max || 2200;

        // If suspiciously high, it might be kJ -> convert to kcal
        if (min > 5000) min = Math.round(min / 4.184);
        if (max > 5000) max = Math.round(max / 4.184);

        // Hard Clamp (1200 - 4000)
        min = Math.max(1200, Math.min(min, 4000));
        max = Math.max(min + 100, Math.min(max, 4200));

        // NORMALIZE MACROS (Fix for 5-digit protein error)
        let { protein_pct, carb_pct, fat_pct } = day.macro_split || { protein_pct: 0.3, carb_pct: 0.4, fat_pct: 0.3 };
        
        // If agent returns integers (e.g. 30 instead of 0.3), fix it
        if (protein_pct > 1) protein_pct /= 100;
        if (carb_pct > 1) carb_pct /= 100;
        if (fat_pct > 1) fat_pct /= 100;

        // Safety clamp macros (0.05 - 0.8)
        protein_pct = Math.max(0.05, Math.min(protein_pct, 0.8));
        carb_pct = Math.max(0.05, Math.min(carb_pct, 0.8));
        fat_pct = Math.max(0.05, Math.min(fat_pct, 0.8));

        return {
            ...day,
            calorie_target: { min, max },
            macro_split: { protein_pct, carb_pct, fat_pct }
        };
    });

    return data;
}