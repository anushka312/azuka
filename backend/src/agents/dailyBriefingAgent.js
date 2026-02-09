import { callGemini } from "../services/geminiClient.js";

/**
 * Agent: Daily Briefing (Consolidated)
 * Role: Your holistic health strategist.
 * Frequency: Runs ONCE per day (or on-demand for replanning).
 * 
 * Responsibilities:
 * 1. Analyze Metabolic State (Fuel Risk, Carb Need).
 * 2. Analyze Psychological State (Motivation, Adherence).
 * 3. Review/Update Weekly Plan (Check for missed workouts).
 */
export default async function dailyBriefingAgent(user, logs, currentPlan, cycleState, forceNewPlan = false) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Construct the context efficiently
    const context = {
        user: {
            name: user.name,
            age: user.age,
            weight: user.weight, // kg
            height: user.height, // cm
            activity_level: user.activityLevel,
            target_weight: user.goals?.target_weight,
            phase: cycleState.phase,
            cycle_day: cycleState.day,
            goals: user.goals,
            fitness_level: user.fitnessLevel
        },
        recent_logs: logs.slice(0, 3), // Last 3 entries for trend analysis
        current_plan_status: forceNewPlan ? "Force_New" : (currentPlan ? "Active" : "None"),
        last_workout: currentPlan?.days?.find(d => d.status === 'completed') || "None"
    };

    const prompt = `
    ROLE: You are Azuka, an elite female health strategist.
    
    # MISSION:
    Provide a daily briefing and check if the workout plan needs adjustment. Calculate precise calorie targets based on biometrics and cycle phase.
    
    # CONTEXT:
    - User: ${JSON.stringify(context.user)}
    - Today: ${today}
    - Recent Logs (Symptoms/Mood): ${JSON.stringify(context.recent_logs)}
    - Current Plan Status: ${context.current_plan_status}

    # CALCULATION RULES (CRITICAL):
    1. **BMR (Mifflin-St Jeor for Women)**: (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161.
    2. **TDEE**: BMR * Activity Multiplier (Sedentary=1.2, Light=1.375, Mod=1.55, Very=1.725).
    3. **GOAL ADJUSTMENT**:
       - If weight > target_weight: Deficit of -300 to -500 kcal.
       - If weight < target_weight: Surplus of +200 to +300 kcal.
       - If weight == target_weight: Maintenance.
    4. **CYCLE ADJUSTMENT (The Azuka Method)**:
       - **Follicular/Ovulation**: Stick to the Calculated Deficit (High energy, high control).
       - **Luteal/Menstrual**: ADD +150-250 kcal to the target. (Higher BMR, combat cravings, prevent binging). 
       - *Note: This makes the plan sustainable for women unlike linear male plans.*

    # KNOWLEDGE BASE:
    - LUTEAL PHASE: Higher BMR (+100-300kcal), lower serotonin (cravings), higher protein need.
    - FOLLICULAR PHASE: High insulin sensitivity, high pain tolerance, best for HIIT/Strength.
    - NEW USER: If logs are empty, assume baseline/average stats for the phase.

    # TASK 1: METABOLIC & MINDSET CHECK
    - Calculate 'Fuel Risk' (0-1) and 'Carb Need' (0-1) based on Phase.
    - Assess 'Motivation' (Stable/Variable/Low) based on Phase + Logs.
    - **SYMPTOM INTERACTION**: If multiple symptoms are present (e.g., ["Bloating", "Sugar Craving"]), analyze their combined biological signal. Does one exacerbate the other? Adjust recommendations to address the CLUSTER of symptoms, not just individual ones.
    
    # TASK 2: PLANNING
    - If "current_plan_status" is "None" or "Force_New", generate a 7-day plan structure.
    - If "Active", provide a "Focus" for today.

    # OUTPUT FORMAT (JSON ONLY):
    {
      "metabolic": {
        "fuel_risk": 0.0-1.0,
        "carb_need": 0.0-1.0,
        "rationale": "One sentence biological explanation."
      },
      "psychology": {
        "motivation_state": "stable | variable | low",
        "adherence_risk": 0.0-1.0,
        "rationale": "One sentence mindset tip."
      },
      "plan_action": "keep | generate_new",
      "today_focus": {
        "workout_type": "string",
        "nutrition_tip": "string",
        "calculated_calories": number
      },
      "new_plan_preview": [] // Array of 7 objects: { day_offset: number, phase_prediction: string, readiness: "Push|Maintain|Gentle|Recover", workout: { title, type, duration_mins, intensity }, calorie_target: { min: number, max: number }, macro_split: { protein_pct, carb_pct, fat_pct } }
    }
    `;

    try {
        console.log(`[DailyBriefingAgent] Generating briefing for ${user.name} (Plan: ${context.current_plan_status})`);
        const response = await callGemini(prompt);
        
        // Cleaning
        let cleanResponse = response.replace(/```json|```/g, "").trim();
        const jsonStart = cleanResponse.indexOf('{');
        const jsonEnd = cleanResponse.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
        }

        let data = JSON.parse(cleanResponse);

        // SAFETY CHECKS & CLAMPING
        if (data.today_focus && data.today_focus.calculated_calories) {
            let cals = data.today_focus.calculated_calories;
            // Check for kJ vs kcal confusion (if > 5000)
            if (cals > 5000) cals = Math.round(cals / 4.184);
            // Hard clamp
            data.today_focus.calculated_calories = Math.max(1200, Math.min(cals, 4000));
        }

        if (data.new_plan_preview && Array.isArray(data.new_plan_preview)) {
            data.new_plan_preview = data.new_plan_preview.map(day => {
                let min = day.calorie_target?.min || 2000;
                let max = day.calorie_target?.max || 2200;

                // Calories Check
                if (min > 5000) min = Math.round(min / 4.184);
                if (max > 5000) max = Math.round(max / 4.184);
                min = Math.max(1200, Math.min(min, 4000));
                max = Math.max(min + 100, Math.min(max, 4200));

                // Macros Check
                let { protein_pct, carb_pct, fat_pct } = day.macro_split || { protein_pct: 0.3, carb_pct: 0.4, fat_pct: 0.3 };
                
                if (protein_pct > 1) protein_pct /= 100;
                if (carb_pct > 1) carb_pct /= 100;
                if (fat_pct > 1) fat_pct /= 100;

                protein_pct = Math.max(0.05, Math.min(protein_pct, 0.8));
                carb_pct = Math.max(0.05, Math.min(carb_pct, 0.8));
                fat_pct = Math.max(0.05, Math.min(fat_pct, 0.8));

                return {
                    ...day,
                    calorie_target: { min, max },
                    macro_split: { protein_pct, carb_pct, fat_pct }
                };
            });
        }

        return data;
    } catch (error) {
        console.error("Daily Briefing Agent Error:", error);
        // Fallback safety
        return {
            metabolic: { fuel_risk: 0.5, carb_need: 0.5, rationale: "Standard maintenance." },
            psychology: { motivation_state: "stable", adherence_risk: 0.1, rationale: "Stay consistent." },
            plan_action: "keep",
            today_focus: { workout_type: "Rest", nutrition_tip: "Hydrate" }
        };
    }
}
