import User from "../src/models/User.js";
import BodyState from "../src/models/BodyState.js";
import MindsetLog from "../src/models/MindsetLog.js";
import WorkoutLog from "../src/models/WorkoutLog.js";
import SymptomLog from "../src/models/Symptoms.js";
import WeeklyPlan from "../src/models/WeeklyPlan.js";
import dailyBriefingAgent from "../src/agents/dailyBriefingAgent.js";
import { getCache, setCache } from "../src/utils/cache.js";

// Helper: Calculate Cycle Phase
const calculatePhase = (day, length = 28) => {
    if (day <= 5) return "Menstrual";
    if (day <= 13) return "Follicular";
    if (day <= 17) return "Ovulatory";
    return "Luteal";
};

// Helper: Get Phase Color
const getPhaseColor = (phase) => {
    switch (phase) {
        case "Menstrual": return "#BB8585"; // Rose
        case "Follicular": return "#95B8B1"; // Teal
        case "Ovulatory": return "#c4af3dff"; // Cream/Gold
        case "Luteal": return "#83965F"; // Forest
        default: return "#BB8585";
    }
};

// Helper: Normalize Phase to Enum
const normalizePhase = (phaseInput) => {
    const p = phaseInput?.toLowerCase() || "";
    if (p.includes("menstru")) return "menstrual";
    if (p.includes("follicular")) return "follicular";
    if (p.includes("ovulat")) return "ovulatory";
    if (p.includes("luteal")) return "luteal";
    return "follicular"; // Safe fallback
};

// Helper: Normalize Readiness to Enum
const normalizeReadiness = (input) => {
    const val = input?.toLowerCase() || "";
    if (val.includes("push") || val.includes("peak") || val.includes("high")) return "Push";
    if (val.includes("maintain") || val.includes("build") || val.includes("medium")) return "Maintain";
    if (val.includes("gentle") || val.includes("light") || val.includes("flow")) return "Gentle";
    if (val.includes("recover") || val.includes("rest") || val.includes("taper")) return "Recover";
    return "Maintain"; // Safe fallback
};

export const getHomeDashboard = async (req, res) => {
    try {
        // 1. Get User
        // In production, use req.userId from auth middleware
        // For demo, if no userId, try to find a user or use dummy
        let user = req.userId ? await User.findById(req.userId) : await User.findOne({ email: 'demo@azuka.app' });
        if (!user && !req.userId) user = await User.findOne(); // Fallback to any user if demo not found

        // FIX: Ensure demo user name is not "John" if it was accidentally set
        if (user && user.name === 'John') {
            console.log("Correcting user name from John to Alicia");
            user.name = 'Alicia';
            await user.save();
        }
        
        if (!user) {
            // Fallback for demo if no user exists
            user = {
                _id: "demo_user",
                name: "Alicia",
                cycleDay: 22,
                cycleLength: 28,
                goals: { primary: "Health" },
                height: 165,
                weight: 60,
                basalMetabolicRate: 1400, // Approximate default
                activityFactor: 1.2
            };
        }

        const userId = user._id.toString();
        const dateKey = new Date().toISOString().split('T')[0];

        // --- CHECK SHARED CACHE ---
        const dashboardKey = `dashboard_${userId}_${dateKey}`;
        const cachedDashboard = getCache(dashboardKey);
        
        if (cachedDashboard) {
            console.log(`[Cache] Serving dashboard for ${user.name}`);
            return res.json({ success: true, ...cachedDashboard });
        }

        // 2. Calculate Phase Info
        const currentPhase = calculatePhase(user.cycleDay, user.cycleLength);
        const phaseColor = getPhaseColor(currentPhase);
        const cycleProgress = Math.round((user.cycleDay / user.cycleLength) * 100);

        // 3. Get Current Plan from DB (if any)
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const dbPlan = await WeeklyPlan.findOne({
            userId: user._id,
            "days.date": today
        }).sort({ created_at: -1 });

        // 4. Run Consolidated Daily Briefing Agent
        // Fetch real logs for context
        const todayStart = new Date();
        todayStart.setHours(0,0,0,0);
        
        const [todayBody, todayMind, todayWorkout, todaySymptoms] = await Promise.all([
            BodyState.findOne({ userId: user._id }).sort({ date: -1 }), // Get latest
            MindsetLog.findOne({ userId: user._id }).sort({ date: -1 }),
            WorkoutLog.findOne({ userId: user._id, date: { $gte: todayStart } }),
            SymptomLog.findOne({ userId: user._id }).sort({ date: -1 })
        ]);

        const logs = [todayBody, todayMind, todayWorkout, todaySymptoms].filter(Boolean);
        const cycleState = { phase: currentPhase, day: user.cycleDay };

        // Initialize default briefing structure
        let briefing = {
             metabolic: {
                 fuel_risk: 0.2,
                 carb_need: 0.5,
                 rationale: "Standard metabolic baseline."
             },
             psychology: {
                 motivation_state: "stable",
                 adherence_risk: 0.1,
                 rationale: "Consistent patterns detected."
             },
             plan_action: "keep",
             today_focus: {
                 workout_type: "Strength",
                 nutrition_tip: "Balanced intake.",
                 calculated_calories: 2000
             }
        };

        // BYPASS AGENT FOR DEMO USER (Offline Mode) but use Real Data if available
        // FORCE OFFLINE LOGIC FOR ALL USERS (USER REQUEST: NO AGENTS) -> REVERTED: AGENTS ENABLED
            if (false && (user.email === 'demo@azuka.app' || user.email.includes('demo'))) {
              console.log(`[Home] Using Offline Logic for User: ${user.name}`);
              
              // Dynamic Calorie Calculation (Consistent with FoodController)
              const bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age) - 161;
              const tdee = bmr * (user.activityFactor || 1.2);
              let targetCalories = Math.round(tdee);
              
              if (user.goals && (user.goals.primary === 'Weight Loss' || (user.goals.goals && user.goals.goals.includes('Weight Loss')))) {
                   // Simple safety check or default deficit
                   targetCalories = Math.round(tdee - 300);
              }

              // Default Briefing
              briefing = {
                  metabolic: {
                      fuel_risk: 0.2,
                      carb_need: 0.8,
                      rationale: "Luteal phase requires stable blood sugar. Your body is working harder!"
                  },
                  psychology: {
                      motivation_state: "stable",
                      adherence_risk: 0.1,
                      rationale: "You've been consistent. Keep this momentum going."
                  },
                  plan_action: "keep",
                  today_focus: {
                      workout_type: "Strength Foundations",
                      nutrition_tip: "Increase complex carbs to combat cravings.",
                      calculated_calories: targetCalories
                  }
              };

            // Override with Real Data Analysis if available
            if (todayBody) {
                 // Example: High stress increases fuel risk
                 if (todayBody.stress_level > 70) {
                     briefing.metabolic.fuel_risk = 0.8;
                     briefing.psychology.motivation_state = "variable";
                     briefing.metabolic.rationale = "High stress detected. Prioritize recovery and complex carbs.";
                 }
                 // Example: Poor sleep
                 if (todayBody.sleep_quality < 50) {
                     briefing.psychology.adherence_risk = 0.7;
                     briefing.today_focus.workout_type = "Active Recovery";
                 }
            }
            
            // Sync with DB Plan if exists
            if (dbPlan) {
                const todayStr = new Date().toDateString();
                const dayPlan = dbPlan.days.find(d => d.date.toDateString() === todayStr);
                if (dayPlan) {
                     briefing.today_focus.workout_type = dayPlan.workout.title;
                     briefing.today_focus.calculated_calories = Math.round((dayPlan.calorie_target.min + dayPlan.calorie_target.max) / 2);
                }
            }
        
        } else {
            console.log(`[Home] Running Daily Briefing Agent...`);
            
            // Timeout Wrapper (8 seconds)
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Agent Timeout")), 8000)
            );

            try {
                briefing = await Promise.race([
                    dailyBriefingAgent(user, logs, dbPlan, cycleState),
                    timeoutPromise
                ]);
            } catch (err) {
                console.error("[Home] Agent Timed Out or Failed:", err.message);
                // Use Fallback
                briefing = {
                    metabolic: { fuel_risk: 0.5, carb_need: 0.5, rationale: "Data unavailable (Network Timeout). Sticking to baseline." },
                    psychology: { motivation_state: "stable", adherence_risk: 0.1, rationale: "Stay consistent." },
                    plan_action: "keep",
                    today_focus: { workout_type: "Rest", nutrition_tip: "Hydrate", calculated_calories: 2000 }
                };
            }

            // Cache the result
            if (briefing) {
                const isFallback = briefing.metabolic.rationale.includes("Timeout");
                const ttl = isFallback ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000;
                setCache(dashboardKey, briefing, ttl);
            }
        }

        // 5. Handle New Plan Generation (if Agent requested it or no plan exists)
        let weeklyForecast = [];
        let metabolicEnvelope = []; // Prepare data for Food Controller cache

        if (briefing.plan_action === 'generate_new' && briefing.new_plan_preview && briefing.new_plan_preview.length > 0) {
            console.log(`[Home] Agent generated NEW plan.`);
            
            // Save to DB
            try {
                const startDate = new Date(dateKey);
                const days = briefing.new_plan_preview.map((day, index) => {
                   const date = new Date(startDate);
                   date.setDate(date.getDate() + day.day_offset);
                   return {
                       date: date,
                       phase: normalizePhase(day.phase_prediction),
                       readiness: normalizeReadiness(day.readiness),
                       workout: day.workout || { title: "Rest", type: "Rest", duration_min: 20, intensity: "Low" },
                       calorie_target: day.calorie_target,
                       macro_targets: {
                           protein: day.macro_split?.protein_pct || 30,
                           carbs: day.macro_split?.carb_pct || 40,
                           fats: day.macro_split?.fat_pct || 30
                       },
                       status: "planned"
                   };
                });

                const newPlan = await WeeklyPlan.create({
                   userId: user._id,
                   week_start: startDate,
                   week_end: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000),
                   goal: user.goals,
                   days: days
                });
                
                // Use the new plan for forecast
                weeklyForecast = briefing.new_plan_preview;
                metabolicEnvelope = briefing.new_plan_preview; // Structure matches what Food Controller expects (mostly)

            } catch (err) {
                console.error("Failed to save WeeklyPlan:", err);
            }
        } else if (dbPlan) {
            // Use existing DB plan for forecast visualization
            const startIdx = dbPlan.days.findIndex(d => new Date(d.date).toDateString() === today.toDateString());
            if (startIdx !== -1) {
                const relevantDays = dbPlan.days.slice(startIdx, startIdx + 7);
                weeklyForecast = relevantDays.map((d, i) => ({
                    day_offset: i,
                    calorie_target: d.calorie_target,
                }));
                // Map DB days to Envelope structure
                metabolicEnvelope = relevantDays.map(d => ({
                    calorie_target: d.calorie_target,
                    macro_split: {
                        protein_pct: d.macro_targets?.protein || 0.3,
                        carb_pct: d.macro_targets?.carbs || 0.4,
                        fat_pct: d.macro_targets?.fats || 0.3
                    }
                }));
            }
        }
        
        // --- POPULATE SHARED ENVELOPE CACHE ---
        // This ensures Food Controller uses the same targets without re-running agents
        if (metabolicEnvelope.length > 0) {
            const envelopeKey = `envelope_${userId}_${dateKey}`;
            setCache(envelopeKey, metabolicEnvelope);
            console.log(`[Home] Updated shared metabolic cache.`);
        }

        // 6. Map Output to Dashboard
        // Prioritize Real Data if available for "Digital Body State", but fallback to Agent if values are missing/zero
        let bodyState = [];
        
        // Helper to get valid value or fallback
        const getValue = (primary, secondary, defaultVal = 0) => {
            return (primary !== undefined && primary !== null && primary !== 0) ? primary : (secondary || defaultVal);
        };

        // Agent predicted values
        const agentFuelRisk = Math.round(Number(briefing.metabolic.fuel_risk || 0) * 100);
        const agentCarbNeed = Math.round(Number(briefing.metabolic.carb_need || 0) * 100);
        const agentAdherence = Math.round((1 - Number(briefing.psychology.adherence_risk || 0)) * 100);
        const agentMotivation = briefing.psychology.motivation_state === 'stable' ? 90 : (briefing.psychology.motivation_state === 'variable' ? 60 : 30);
        
        bodyState = [
            {
                label: 'Sleep',
                value: getValue(todayBody?.sleep_quality, 75), // Default to good sleep if unknown
                color: getValue(todayBody?.sleep_quality, 75) > 70 ? '#83965F' : (getValue(todayBody?.sleep_quality, 75) > 40 ? '#F1ECCE' : '#BB8585')
            },
            {
                label: 'Stress',
                value: getValue(todayBody?.stress_level, agentAdherence), // Fallback to adherence proxy
                color: getValue(todayBody?.stress_level, agentAdherence) < 40 ? '#83965F' : (getValue(todayBody?.stress_level, agentAdherence) < 70 ? '#F1ECCE' : '#BB8585')
            },
            {
                label: 'Energy',
                value: getValue(todayBody?.energy_level, agentMotivation), // Fallback to motivation proxy
                color: getValue(todayBody?.energy_level, agentMotivation) > 70 ? '#83965F' : '#BB8585'
            },
            {
                label: 'Fuel Risk', 
                value: agentFuelRisk, // Agent is best source for this derived metric
                color: briefing.metabolic.fuel_risk > 0.5 ? '#BB8585' : '#83965F' 
            }
        ];

        // Chart Data
        const forecast = weeklyForecast.map(day => {
            const avgCals = (day.calorie_target?.min + day.calorie_target?.max) / 2 || 2000;
            return Math.min(Math.round((avgCals / 2500) * 100), 100); 
        });
        
        // If forecast is empty or partial (end of week), fill with dummy baseline for visual
        while (forecast.length < 7) {
             forecast.push(60 + Math.random() * 20);
        }

        // Insight
        const insightTitle = `${currentPhase} Focus`;
        const insightText = `${briefing.metabolic.rationale} ${briefing.psychology.rationale}`;

        const responseData = {
            user: {
                name: user.name,
                cycleDay: user.cycleDay,
                phase: currentPhase,
                phaseColor: phaseColor,
                cycleProgress: cycleProgress
            },
            bodyState,
            forecast,
            insight: {
                title: insightTitle,
                text: insightText
            }
        };

        // Set Dashboard Cache (TTL: 1 hour)
        setCache(dashboardKey, responseData, 3600 * 1000);

        res.json({
            success: true,
            ...responseData
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};