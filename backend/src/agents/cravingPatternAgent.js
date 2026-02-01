import { callGemini } from "../services/geminiClient.js";

/**
 * Agent 9: Craving Pattern
 * Role: Identifies recurring loops between cycle phase, stress, and food desire.
 * Logic: Uses historical log data to predict and "swap" cravings for biological solutions.
 */
export default async function cravingPatternAgent(historicalLogs, tier1Data) {
    const prompt = `
    ROLE: You are the Azuka Behavioral Neuroscientist (Expert in Dopamine Loops & Nutritional Psychology).
    
    # KNOWLEDGE CONTEXT:
    - THE MAGNESIUM LOOP: Chocolate cravings are often a signal for Magnesium (common in Luteal phase).
    - THE CORTISOL CRUNCH: Salty/Crunchy cravings are often a signal of Adrenal fatigue/High Cortisol.
    - THE DOPAMINE DROP: Sugar cravings in the late Luteal phase are often the brain seeking a dopamine hit to compensate for falling Estrogen.

    # INPUT DATA:
    - Historical Patterns: ${JSON.stringify(historicalLogs)}
    - Current Biological State: ${JSON.stringify(tier1Data)}

    # DIAGNOSTIC PROTOCOL:
    1. IDENTIFY THE LOOP: Look for correlations (e.g., "Every Day 26 + High Stress = Late Night Sugar").
    2. DECODE THE NEED: Is the craving Physical (Fuel), Emotional (Dopamine), or Chemical (Micro-nutrient)?
    3. THE "AZUKA SWAP": Suggest a "Crowding Out" strategy (e.g., "Eat 2 dates with almond butter 30 mins BEFORE the usual craving time").

    # TASK:
    Analyze the craving pattern and provide a proactive intervention.

    RETURN ONLY VALID JSON:
    {
      "detected_pattern": "string",
      "biological_trigger": "string",
      "predicted_craving_risk": 0-1,
      "azuka_swap": {
        "item": "string",
        "timing": "string",
        "reason": "string"
      },
      "rationale": "Explain how this swap solves the underlying biological deficit (e.g. Magnesium or Serotonin)."
    }
    `;

    const response = await callGemini(prompt);
    
    return JSON.parse(response.replace(/```json|```/g, ""));
}