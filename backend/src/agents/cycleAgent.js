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
    
    // Robust JSON cleaning
    let cleanResponse = response.replace(/```json|```/g, "").trim();
    const jsonStart = cleanResponse.indexOf('{');
    const jsonEnd = cleanResponse.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
    }
    
    const parsed = JSON.parse(cleanResponse);

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

export async function generateCycleForecast(user, startDate) {
    const prompt = `
    ROLE: Azuka Cycle Strategist.
    
    # MISSION: Predict 7-Day Cycle & Energy Forecast starting from ${startDate}.
    
    # USER PROFILE:
    - Cycle Day: ${user.cycleDay}
    - Cycle Length: ${user.cycleLength}
    
    # LOGIC:
    1. Project the cycle phase for the next 7 days.
    2. Estimate Energy Levels (0-100) based on phase.
       - Follicular/Ovulatory: High Energy.
       - Luteal/Menstrual: Lower Energy.
    3. Identify Risks (e.g., "Bloating", "Fatigue", "ACL Risk").
    
    # TASK:
    Generate a 7-day forecast.
    
    IMPORTANT: RETURN ONLY VALID JSON.
    [
      {
        "day_offset": 0,
        "phase": "string",
        "energy": number,
        "symptom_risk": ["string"],
        "workout_focus": "string"
      },
      ...
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
    
    return JSON.parse(cleanResponse);
}