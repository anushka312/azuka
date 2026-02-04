import { callGemini } from "../services/geminiClient.js";

/**
 * Agent 11: Master Orchestrator
 * Role: The "Central Brain" that synthesizes all 10 agents into a cohesive Daily Path.
 * Logic: Conflict resolution, priority management, and psychological framing.
 */
async function masterOrchestrator(allAgentOutputs) {
    const prompt = `
    ROLE: You are the Azuka CEO (The Master Biological Planner).
    
    # MISSION:
    You receive the outputs from 10 specialized agents. Your goal is to synthesize them into "One Simple Path" for the user. 
    
    # CONFLICT RESOLUTION RULES:
    1. STRESS TRUMPS ENERGY: If Stress Agent reports "Critical," you MUST downgrade any "High Intensity" workout from Agent 10, regardless of the Cycle Phase.
    2. FUEL TRUMPS WORKOUT: If Metabolic Agent reports "High Fuel Risk," you must emphasize the Recipe/Meal over the Workout.
    3. PSYCHOLOGY IS THE FILTER: Use the "Recommended Tone" from Agent 5 to write every word of the output.

    # INPUT DATA:
    - All Agent Data: ${JSON.stringify(allAgentOutputs)}

    # TASK:
    1. Create a "Mindset Message": A 1-sentence hook that explains the 'Vibe' of the day (e.g., "Today is about protection, not production").
    2. Finalize "Today's Plan": Select the most relevant Workout, Meal, and Behavioral Tip.
    3. Generate "Biological Insights": Explain the 'Why' behind the plan using data from Tier 1.

    RETURN ONLY VALID JSON:
    {
      "mindset_message": "string",
      "daily_brief": "A short summary of the day's biological focus.",
      "today_plan": {
        "workout_summary": "string",
        "nutrition_focus": "string",
        "primary_action": "string"
      },
      "biological_status": {
        "dominant_phase": "string",
        "primary_risk": "string",
        "system_state": "string"
      },
      "rationale": "The master reasoning for how you resolved conflicts between agents."
    }
    `;

    const response = await callGemini(prompt);
    
    return JSON.parse(response.replace(/```json|```/g, ""));
}

masterOrchestrator.determineRoute = async function(logs) {
    const prompt = `
    ROLE: Triage Nurse for Biological Systems.
    
    INPUT: ${JSON.stringify(logs)}
    
    TASK: Determine which specialist agent is most needed right now based on symptoms and logs.
    Available Agents: 'cycle', 'stress', 'workout'.
    
    RETURN ONLY JSON:
    {
        "targetAgent": "cycle" | "stress" | "workout",
        "readinessScore": 0.0 to 1.0 (based on overall vibe)
    }
    `;
    
    try {
        const response = await callGemini(prompt);
        return JSON.parse(response.replace(/```json|```/g, ""));
    } catch (e) {
        console.error("Triage failed", e);
        return { targetAgent: 'workout', readinessScore: 0.5 };
    }
};

export default masterOrchestrator;