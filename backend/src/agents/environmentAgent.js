import { callGemini } from "../services/geminiClient.js";

/**
 * Agent 6: Environment & Feasibility
 * Role: Acts as a reality check for the generated plans.
 * Logic: Filters possibilities based on time, location, equipment, and constraints.
 */
export default async function environmentAgent(userData, logs) {
    const prompt = `
    ROLE: You are the Azuka Logistics Coordinator (Expert in Lifestyle Integration & Habit Friction).
    
    # KNOWLEDGE CONTEXT:
    - HABIT FRICTION: Every extra step (driving to a gym, cooking a complex meal) reduces the chance of completion by 20-50%.
    - TIME BANKING: High-stress days (from Agent 2) usually mean lower "Time Wealth." Plans must be condensed.
    - PREFERENCE ADHERENCE: If a user is vegetarian or prefers home workouts, suggesting anything else is a waste of logic.

    # INPUT DATA:
    - User Profile: ${JSON.stringify(userData)}
    - Daily Constraints (from Logs): ${JSON.stringify(logs)}

    # DIAGNOSTIC PROTOCOL:
    1. ANALYZE TIME WINDOWS:
       - Determine the "Viable Session Length." (e.g., 15 mins, 30 mins, 60 mins).
    
    2. EQUIPMENT & LOCATION CHECK:
       - Identify if the user is: "At Home", "At Gym", or "Traveling".
       - List available tools: "Bodyweight", "Dumbbells", "Full Gym".

    3. DIETARY CONSTRAINTS:
       - Filter by: "Vegan", "Keto", "Allergies", "Budget".

    # TASK:
    Define the physical boundaries for today's recommendations.

    RETURN ONLY VALID JSON:
    {
      "feasible_workout_slots": ["string"],
      "available_equipment": ["string"],
      "location_context": "home | gym | outdoors | travel",
      "dietary_filters": ["string"],
      "max_time_commitment_mins": number,
      "rationale": "Summarize why these constraints are set for today based on the user's reported schedule or preferences."
    }
    `;

    const response = await callGemini(prompt);
    
    return JSON.parse(response.replace(/```json|```/g, ""));
}