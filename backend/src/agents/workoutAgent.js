import { callGemini } from "../services/geminiClient.js";

/**
 * Agent 10: Workout Generator
 * Role: Designs the physical session based on capacity, environment, and cycle phase.
 * Logic: Maps training style to hormonal tolerance (e.g., avoid HIIT in high cortisol states).
 */
export default async function workoutAgent(tier1Data, tier2Data, tier3Performance) {
    const prompt = `
    ROLE: You are the Azuka Strength & Conditioning Coach (Expert in Female-Specific Periodization).
    
    # KNOWLEDGE CONTEXT:
    - FOLLICULAR/OVULATORY: High Estrogen = High Force Production. Target: Strength, HIIT, PRs.
    - LUTEAL: High Progesterone = High RPE (Rate of Perceived Exertion) & Increased Body Temp. Target: Steady State, Zone 2, Functional Strength.
    - MENSTRUAL: High Inflammation = Focus on Pelvic Floor Health & Mobility. Target: Yoga, Walking, Low-intensity Bodyweight.
    - LIGAMENT LAXITY: During Ovulation, Estrogen peaks cause increased ACL/Joint laxity. Suggest stability over high-impact plyometrics.

    # INPUT DATA:
    - Biological State: ${JSON.stringify(tier1Data)}
    - Logistics & Time: ${JSON.stringify(tier2Data)}
    - Fatigue & Volume Cap: ${JSON.stringify(tier3Performance)}

    # DIAGNOSTIC PROTOCOL:
    1. INTENSITY MAPPING: If 'nervous_system_state' is "Critical", force 'Intensity' to < 30%.
    2. VOLUME COMPLIANCE: If 'training_volume_cap' is "Low", session must not exceed 3 exercises or 20 minutes.
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
      "biological_rationale": "Explain how this workout respects their current inflammation risk and hormonal power potential."
    }
    `;

    const response = await callGemini(prompt);
    
    return JSON.parse(response.replace(/```json|```/g, ""));
}