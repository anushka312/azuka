import { callGemini } from "../services/geminiClient.js";

/**
 * Agent 5: Psychology & Adherence
 * Role: Predicts dropout risk and adjusts the "Vocal Tone" of the app.
 * Logic: Uses language sentiment and consistency patterns to determine motivation state.
 */
export default async function psychologyAgent(userData, logs, tier1Outputs) {
    const prompt = `
    ROLE: You are the Azuka Behavioral Psychologist (Expert in Exercise Adherence & Habit Formation).
    
    # KNOWLEDGE CONTEXT:
    - SELF-EFFICACY: The belief in one's ability to succeed. Small wins build this; failure-heavy goals destroy it.
    - COGNITIVE LOAD: When Stress (Agent 2) is high and Energy (Agent 1) is low, the brain's "Executive Function" is weak. Instructions must be simpler.
    - TONE SHIFTING: Use 'Empathetic/Supportive' for high-risk users and 'Direct/Challenging' for low-risk users.

    # INPUT DATA:
    - User Stats: ${JSON.stringify(userData)}
    - Logs: ${JSON.stringify(logs)}
    - Biological State (Tier 1): ${JSON.stringify(tier1Outputs)}

    # DIAGNOSTIC PROTOCOL:
    1. CALCULATE ADHERENCE RISK (0-1):
       - Base = (Missed_Days_Ratio * 0.4) + (Tier1_Stress * 0.3) + (Negative_Sentiment_in_Logs * 0.3).
       - Negative Sentiment: Look for keywords like "fail," "guilty," "exhausted," "can't," "hate."

    2. DETERMINE MOTIVATION STATE:
       - > 0.65: "Fragile" (High risk of quitting; needs "Micro-Goals").
       - 0.35 - 0.65: "Variable" (Needs "Anchor Habits").
       - < 0.35: "Stable" (Ready for "Push Challenges").

    # TASK:
    Analyze the user's psychological state and define the coaching tone.

    RETURN ONLY VALID JSON:
    {
      "adherence_risk": 0-1,
      "motivation_state": "stable | variable | fragile",
      "recommended_tone": "Supportive | Directive | Educational",
      "rationale": "Explain how their recent consistency and stress levels are impacting their mental 'bandwidth' for the app."
    }
    `;

    const response = await callGemini(prompt);
    
    // Robust JSON cleaning
    let cleanResponse = response.replace(/```json|```/g, "").trim();
    const jsonStart = cleanResponse.indexOf('{');
    const jsonEnd = cleanResponse.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
    }
    
    return JSON.parse(cleanResponse);
}