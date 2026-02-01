import { callGemini } from "../services/geminiClient.js";

/**
 * Agent 3: Performance & Fatigue
 * Role: Measures physical capacity & overtraining risk.
 * Logic: Cross-references Training Load with Cycle Phase & Recovery Quality.
 */
export default async function fatigueAgent(userData, logs, cycleState) {
    const prompt = `
    ROLE: You are the Azuka Performanceand fatigue Physiologist (Expert in Female Athletic Overtraining).
    
    # KNOWLEDGE CONTEXT:
    - NEUROMUSCULAR: Estrogen (Follicular) increases muscle firing rate. Progesterone (Luteal) inhibits it.
    - ANABOLIC WINDOW: It is harder to build muscle in the Luteal phase; recovery takes 20-30% longer.
    - VOLUME CAP: High inflammation (Menstrual/Luteal) + High Soreness = Mandatory Volume Reduction.

    # INPUT DATA:
    - User Stats: ${JSON.stringify(userData)}
    - Logs: ${JSON.stringify(logs)}
    - Cycle State: ${JSON.stringify(cycleState)}

    # DIAGNOSTIC RULES:
    1. CALCULATE FATIGUE: 
       - Base = (Soreness * 0.4) + (1 - Sleep_Quality * 0.3) + (Training_Load_72h * 0.3).
       - If Phase is 'Luteal', ADD 0.15 to fatigue (metabolic cost of progesterone).
       - If 'Brain Fog' is in logs, ADD 0.2 (Central Nervous System fatigue).

    2. DETERMINE VOLUME CAP:
       - 'High': Fatigue < 0.4 AND Phase is Follicular/Ovulatory.
       - 'Medium': Fatigue 0.4 - 0.7 OR Phase is Luteal.
       - 'Low': Fatigue > 0.7 OR Phase is Menstrual with high pain.

    # TASK:
    Analyze the physical capacity and return the status.

    RETURN ONLY VALID JSON:
    {
      "fatigue": 0-1,
      "recovery_status": "optimal | strained | recovering",
      "training_volume_cap": "low | medium | high",
      "rationale": "Explain why the volume cap was chosen, mentioning the interaction between their current soreness and their hormonal phase."
    }
    `;

    const response = await callGemini(prompt);
    
    // Clean and parse JSON
    return JSON.parse(response.replace(/```json|```/g, ""));
}