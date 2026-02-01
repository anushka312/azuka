import { callGemini } from "../services/geminiClient.js";

export default async function cycleAgent(userData, logs) {
    const prompt = `
    ROLE: You are the Azuka Biological Intelligence Agent (Expert Gynaecologist & Exercise Physiologist).
    
    KNOWLEDGE BASE:
    - Menstrual Phase (Day 1-5): Low hormones, high inflammation, low energy.
    - Follicular Phase (Day 6-12): Rising Estrogen, high insulin sensitivity, high energy.
    - Ovulatory (Day 13-15): Peak Estrogen, peak power, high ligament laxity risk.
    - Luteal (Day 16-28): High Progesterone, thermogenic (+0.5C temp), high cortisol reactivity, muscle breakdown (catabolic).
    
    INPUT DATA:
    ${JSON.stringify({ userData, logs })}

    # DIAGNOSTIC PROTOCOL
    Your primary task is to "Inference" the user's biological state by cross-referencing their Cycle Day with their Symptoms.

    1. SYMPTOM CLUSTERING: 
   - Look for clusters. "Anxiety + Heart Palpitations + Insomnia" = Sympathetic Overload.
   - "Bloating + Cravings + Low Mood" = Luteal Metabolic Shift.
   
    2. CONTEXTUAL OVERRIDE:
   - Symptoms ALWAYS override the calendar. 
   - If it is a "Power Day" (Day 12) but the user reports "Cramps and Fatigue," you must treat the body as "High Inflammation" and pull back intensity.

    3. HIDDEN INDICATORS:
   - Use symptoms to adjust "Fuel Risk." 
   - Example: "Sugar cravings" mean the user is failing to access fat stores in the Luteal phase. Adjust 'carb_need' to 0.9.

    TASK:
    Calculate the current Digital Body State.
    
    FORMULAS TO APPLY:
    1. inflammation_risk: Base it on cycle phase (Luteal/Menstrual = High) + Sleep Quality + Reported Soreness.
    2. cortisol_risk: If stress is high AND sleep < 7hrs, risk must be > 0.7.
    3. carb_need: High in Follicular (for performance), High in Luteal (for serotonin/blood sugar stability).

    RETURN ONLY VALID JSON (Match this structure):
    {
      "cycle": { "day": number, "phase": "string", "predicted_next_phase": "string" },
      "physiology": { "energy": 0-1, "fatigue": 0-1, "inflammation_risk": 0-1 },
      "stress": { "score": 0-1, "cortisol_risk": 0-1, "nervous_system_state": "Parasympathetic/Sympathetic/Critical" },
      "metabolic": { "fuel_risk": 0-1, "carb_need": 0-1 }
    }
  `;

    const response = await callGemini(prompt);

    return JSON.parse(response.replace(/```json|```/g, ""));
}