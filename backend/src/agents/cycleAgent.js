import { callGemini } from "../services/geminiClient.js";

export default async function cycleAgent(user, logs) {
  const prompt = `
ROLE: Azuka Biological Intelligence Agent.

KNOWLEDGE BASE:
- Menstrual: Inflammation ↑, Energy ↓
- Follicular: Insulin Sensitivity ↑, Energy ↑
- Ovulatory: Power Peak, Ligament Risk ↑
- Luteal: Cortisol Reactivity ↑, Muscle Breakdown Risk ↑

INPUT DATA:
- Current: ${JSON.stringify({
    cycle_day: user.cycleDay,
    symptoms: logs.symptoms,
    mood: logs.mood, // Assuming mood is in logs based on usage
    sleep: logs.sleepHours
  })}
- User Profile: ${JSON.stringify({
    age: user.age,
    cycleLength: user.cycleLength
})}

TASK: Calculate Digital Body State.

RETURN ONLY JSON:
{
  "cycle": { "day": number, "phase": "string", "predicted_next_phase": "string" },
  "physiology": { "energy": 0-1, "fatigue": 0-1, "inflammation_risk": 0-1 },
  "stress": { "score": 0-1, "cortisol_risk": 0-1, "nervous_system_state": "string" },
  "metabolic": { 
      "fuel_risk": 0-1, 
      "carb_need": 0-1,
      "daily_calorie_band": { "min": number, "max": number }
  },
  
  // CRITICAL: Standardized keys for the intelligenceLoop
  "message": "A 1-sentence expert inference for the user dashboard.",
  "workout": "Suggested movement style based on physiology",
  "analysis": "Technical notes for the bioSummary"
}
`;

  try {
    const response = await callGemini(prompt);
    const cleanJson = response.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    // UNWRITTEN LOGIC: Manual Validation
    // If the AI gives a weird day/phase combo, we fix it here.
    if (parsed.cycle.day > 14 && parsed.cycle.phase === "Follicular") {
        parsed.cycle.phase = "Luteal";
    }

    return parsed;
  } catch (error) {
    console.error("CycleAgent failure:", error);
    return null; 
  }
}