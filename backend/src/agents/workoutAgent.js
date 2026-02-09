import { callGemini } from "../services/geminiClient.js";

/**
 * Agent 10: Workout Generator
 * Role: Designs the physical session based on capacity, environment, and cycle phase.
 * Logic: Maps training style to hormonal tolerance (e.g., avoid HIIT in high cortisol states).
 */
export default async function workoutAgent(user, logs) {
    const prompt = `
    ROLE: You are the Azuka Strength & Conditioning Coach (Expert in Female-Specific Periodization).
    
    # KNOWLEDGE CONTEXT:
    - FOLLICULAR/OVULATORY: High Estrogen = High Force Production. Target: Strength, HIIT, PRs.
    - LUTEAL: High Progesterone = High RPE (Rate of Perceived Exertion) & Increased Body Temp. Target: Steady State, Zone 2, Functional Strength.
    - MENSTRUAL: High Inflammation = Focus on Pelvic Floor Health & Mobility. Target: Yoga, Walking, Low-intensity Bodyweight.
    - LIGAMENT LAXITY: During Ovulation, Estrogen peaks cause increased ACL/Joint laxity. Suggest stability over high-impact plyometrics.

    # INPUT DATA:
    - User Profile: ${JSON.stringify(user)}
    - Logs: ${JSON.stringify(logs)}

    # DIAGNOSTIC PROTOCOL:
    1. INTENSITY MAPPING: If 'nervous_system_state' (inferred from logs) is "Critical", force 'Intensity' to < 30%.
    2. VOLUME COMPLIANCE: If time is short, session must not exceed 3 exercises or 20 minutes.
    3. PHASE-SPECIFIC STYLE: If Phase is 'Luteal', prioritize "Flow" or "Strength Maintenance" over "Metabolic Conditioning".

    # TASK:
    Generate a specific workout session for today.

    RETURN ONLY VALID JSON:
    {
      "workout_title": "string",
      "style": "Strength | HIIT | Mobility | Zone 2",
      "intensity_level": "Low | Medium | High",
      "duration_mins": number,
      "exercises": [
        { "name": "string", "reps": "string", "sets": "string", "notes": "string" }
      ],
      "biological_rationale": "Explain how this workout respects their current inflammation risk and hormonal power potential.",
      
      // Standard keys for intelligenceLoop
      "message": "Motivational workout message",
      "workout": "Summary of workout style",
      "analysis": "Technical workout analysis"
    }
    `;

    const response = await callGemini(prompt);
    
    return cleanJSON(response);
}

export async function generateWeekPlan(user, startDate, logs = []) {
    const prompt = `
    ROLE: You are the Azuka Strength & Conditioning Coach (Expert in Female-Specific Periodization).
    
    # MISSION: Create a 7-Day Workout Microcycle starting from ${startDate}.
    
    # USER PROFILE:
    - Age: ${user.age}
    - Fitness Level: ${user.fitnessLevel}
    - Goal: ${user.goals?.primary || "General Health"}
    - Current Cycle Day: ${user.cycleDay} (Cycle Length: ${user.cycleLength})

    # RECENT LOGS / SYMPTOMS:
    ${JSON.stringify(logs)}
    (Note: Adjust intensity if user reports fatigue, cramps, or sickness.)

    # PERIODIZATION LOGIC:
    - Map the predicted cycle phase for each of the next 7 days.
    - Match intensity to the phase (e.g., Follicular = Build, Ovulatory = Peak, Luteal = Taper).
    - Ensure variety: Mix Strength, Mobility, and Conditioning.
    - FREQUENCY: Schedule 3-5 active workouts per week. Avoid consecutive Rest days unless necessary.

    # TASK:
    Generate a JSON array of 7 daily plans. Include nutrition targets based on phase (e.g., Luteal = higher calories).
    IMPORTANT: All calorie values MUST be in Kcal (Calories), NOT kJ. Max calorie target should typically be between 1200-3500 kcal unless elite athlete.

    RETURN ONLY VALID JSON:
    [
      {
        "day_offset": 0, // 0 = today, 1 = tomorrow
        "phase_prediction": "string",
        "readiness": "Push | Maintain | Gentle | Recover", // STRICT ENUM: Do NOT use 'Peak', 'Build', or 'Taper'.
        "workout": {
          "title": "string",
          "style": "Strength | HIIT | Mobility | Zone 2 | Rest",
          "duration_mins": number,
          "intensity": "Low | Medium | High",
          "focus": "string",
          "muscles": ["string", "string"], // e.g. ["Glutes", "Core"]
          "calories_burn_est": number, // e.g. 320
          "volume": "string" // e.g. "3 Sets x 12"
        },
        "analysis": "Specific analysis of why this session fits the phase (e.g. 'Lower intensity but high engagement to support hormone stability')",
        "nutrition": {
            "calories": { "min": number, "max": number },
            "macros": { "protein_pct": number, "carb_pct": number, "fat_pct": number }
        },
        "rationale": "Why this fits the predicted phase."
      },
      ... (7 items total)
    ]
    `;

    const response = await callGemini(prompt);
    
    let result = cleanJSON(response);
    
    // Handle case where agent wraps array in an object
    if (result && !Array.isArray(result)) {
        if (Array.isArray(result.days)) result = result.days;
        else if (Array.isArray(result.plan)) result = result.plan;
        else if (Array.isArray(result.schedule)) result = result.schedule;
    }

    // SAFETY CLAMP: Ensure calories are within realistic bounds
    if (Array.isArray(result)) {
        result = result.map(day => {
            if (day.nutrition && day.nutrition.calories) {
                let min = day.nutrition.calories.min || 2000;
                let max = day.nutrition.calories.max || 2200;
                
                // Convert kJ to kcal if suspiciously high
                if (min > 5000) min = Math.round(min / 4.184);
                if (max > 5000) max = Math.round(max / 4.184);

                // Hard Clamp (1200 - 4000)
                min = Math.max(1200, Math.min(min, 4000));
                max = Math.max(min + 100, Math.min(max, 4200));
                
                day.nutrition.calories.min = min;
                day.nutrition.calories.max = max;
            }
            return day;
        });
    }
    
    return result;
}

// Helper to clean JSON response from LLM
function cleanJSON(text) {
    if (!text) return null;
    try {
        // Remove markdown code blocks if present
        let clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
        
        // Find the first valid JSON start character
        const firstOpenBrace = clean.indexOf('{');
        const firstOpenBracket = clean.indexOf('[');
        
        let startIndex = -1;
        if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
            startIndex = firstOpenBrace;
        } else {
            startIndex = firstOpenBracket;
        }
        
        if (startIndex !== -1) {
            clean = clean.substring(startIndex);
            // We rely on JSON.parse to fail if there is trailing garbage, 
            // but often it's better to find the last closing character.
            // However, regex extraction is safer for simple cases.
            const match = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (match) {
                return JSON.parse(match[0]);
            }
        }
        
        return JSON.parse(clean);
    } catch (e) {
        console.error("JSON Parse Error in Agent:", e);
        console.log("Raw Text:", text);
        return null;
    }
}