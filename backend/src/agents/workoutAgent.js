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
    
    return JSON.parse(response.replace(/```json|```/g, ""));
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

    # TASK:
    Generate a JSON array of 7 daily plans.

    RETURN ONLY VALID JSON:
    [
      {
        "day_offset": 0, // 0 = today, 1 = tomorrow
        "phase_prediction": "string",
        "workout": {
          "title": "string",
          "style": "Strength | HIIT | Mobility | Zone 2 | Rest",
          "duration_mins": number,
          "intensity": "Low | Medium | High",
          "focus": "string"
        },
        "rationale": "Why this fits the predicted phase."
      },
      ... (7 items total)
    ]
    `;

    const response = await callGemini(prompt);
    return JSON.parse(response.replace(/```json|```/g, ""));
}