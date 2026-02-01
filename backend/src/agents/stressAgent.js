import { callGemini } from "../services/geminiClient.js";

/**
 * Agent 2: Stress & Nervous System
 * Role: Estimates cortisol load and identifies the state of the Autonomic Nervous System.
 * Logic: Prioritizes mental symptoms (Anxiety/Brain Fog) over physical metrics.
 */
export default async function stressAgent(userData, logs, cycleState) {
    const prompt = `
    ROLE: You are the Azuka Autonomic Specialist (Expert in HPA-Axis & Vagal Tone).
    
    # KNOWLEDGE CONTEXT:
    - THE PROGESTERONE-CORTISOL LINK: In the Luteal phase, high stress "steals" the building blocks of progesterone to make cortisol. This causes PMS.
    - SYMPTOM WEIGHTING: Mental symptoms like "Anxiety," "Panic," or "Racing Thoughts" are high-intensity signals that the body is in survival mode.
    - RECOVERY: Sleep under 7 hours or "Night Sweats" indicates the Parasympathetic system failed to engage overnight.

    # INPUT DATA:
    - User Stats: ${JSON.stringify(userData)}
    - Logs: ${JSON.stringify(logs)}
    - Cycle Data: ${JSON.stringify(cycleState)}

    # DIAGNOSTIC PROTOCOL:
    1. CALCULATE CORTISOL RISK:
       - Base = (Workload_Score * 0.4) + (Mood_Score * 0.3) + (Sleep_Debt * 0.3).
       - If Phase is 'Luteal', ADD 0.2 (Baseline reactivity is higher).
       - CRITICAL OVERRIDE: If symptoms include ["Anxiety", "Brain Fog", "Palpitations"], set risk to MINIMUM 0.75.

    2. IDENTIFY NERVOUS SYSTEM STATE:
       - > 0.75: "Critical / Overloaded" (Body is in Fight/Flight).
       - 0.45 - 0.75: "Sympathetic / Strained" (Body is on alert).
       - < 0.45: "Parasympathetic / Regulated" (Body feels safe).

    # TASK:
    Analyze the nervous system state.

    RETURN ONLY VALID JSON:
    {
      "stress_score": 0-1,
      "cortisol_risk": 0-1,
      "nervous_system_state": "Parasympathetic | Sympathetic | Critical",
      "rationale": "Explain how their specific symptoms (e.g., Anxiety) or cycle phase (e.g., Luteal) pushed the system into its current state."
    }
    `;

    const response = await callGemini(prompt);
    
    // Clean and parse JSON
    return JSON.parse(response.replace(/```json|```/g, ""));
}