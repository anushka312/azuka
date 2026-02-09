import FoodLog from "../src/models/FoodLog.js";
import Recipe from "../src/models/Recipe.js";
import User from "../src/models/User.js";
import { calculateWeeklyEnvelope } from "../src/agents/metabolicAgent.js";
import foodVisionAgent from "../src/agents/foodVisionAgent.js"; // Import Food Vision
import { getCache, setCache } from "../src/utils/cache.js";

// Helper to get user
const getUser = async (userId) => {
    if (userId) {
        const user = await User.findById(userId);
        if (user) return user;
    }
    // Fallback
    let user = await User.findOne();
    if (!user) {
        user = await User.create({
            name: "Demo User",
            email: `demo_${Date.now()}@azuka.com`,
            age: 28,
            fitnessLevel: "Intermediate",
            cycleDay: 14,
            cycleLength: 28,
            goals: { primary: "Energy", secondary: "Strength" }
        });
    }
    return user;
};

// POST /api/food/analyze
export const analyzeImage = async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ success: false, message: "No image provided" });
        }

        console.log("[Food] Analyzing image...");
        
        let result;
        // FORCE OFFLINE LOGIC (USER REQUEST: NO AGENTS) -> REVERTED: AGENTS ENABLED
        if (false) {
             console.log("[Food] Using Dummy Analysis (No Agent)");
             result = {
                 food_name: "Grilled Chicken Salad",
                 calories: 450,
                 macros: { protein: 40, carbs: 15, fat: 20 },
                 confidence: 0.95
             };
        } else {
             result = await foodVisionAgent(imageBase64);
        }
        
        // Return analysis (Frontend will confirm to log it)
        res.json({ success: true, analysis: result });

    } catch (error) {
        console.error("Food Analysis Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/food/dashboard
export const getFoodDashboard = async (req, res) => {
    try {
        const user = await getUser(req.userId);
        const today = new Date();
        today.setHours(0,0,0,0);
        const dateKey = today.toISOString().split('T')[0];
        
        // 1. Get Today's Log
        let log = await FoodLog.findOne({ 
            userId: user._id, 
            date: today 
        });

        if (!log) {
            // Return empty state
            log = { entries: [], total_calories: 0 };
        }

        // 2. Get Targets (using Shared Cache from Home)
        const envelopeKey = `envelope_${user._id.toString()}_${dateKey}`;
        let metabolicData = getCache(envelopeKey);
        
        if (!metabolicData) {
            // BYPASS AGENT FOR DEMO USER or FALLBACK
            // Calculate dynamic targets based on user goals
            // REVERTED: AGENTS ENABLED (Set to false to use Agent)
            if (false) {
                console.log(`[Food] Using Offline/Dummy Envelope for User: ${user.name}`);
            
                // 1. Calculate BMR (Mifflin-St Jeor)
                const bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age) - 161; // Female formula
                
                // 2. Activity Factor
                const activityFactors = {
                    "Sedentary": 1.2,
                    "Lightly Active": 1.375,
                    "Moderately Active": 1.55,
                    "Very Active": 1.725
                };
                const tdee = bmr * (activityFactors[user.activityLevel] || 1.2);
                
                // 3. Goal Adjustment
                let targetCalories = tdee;
                let goalLabel = "Maintenance";
    
                if (user.goals && user.goals.target_weight) {
                    // Check if user is in healthy BMI range to apply weight loss logic
                    // BMI = weight / (height/100)^2
                    const heightM = user.height / 100;
                    const bmi = user.weight / (heightM * heightM);
                    
                    if (bmi >= 18.5 && bmi <= 24.9) {
                        if (user.goals.target_weight < user.weight) {
                            targetCalories = tdee - 300; // Moderate deficit
                            goalLabel = "Weight Loss";
                        } else if (user.goals.target_weight > user.weight) {
                            targetCalories = tdee + 200; // Lean gain
                            goalLabel = "Muscle Gain";
                        }
                    }
                } else if (user.goals?.primary === 'Weight Loss') {
                     // Fallback if no target weight set but goal is weight loss
                     targetCalories = tdee - 250;
                }
    
                // Create 7 days of data
                metabolicData = Array(7).fill({
                    calorie_target: { min: Math.round(targetCalories - 100), max: Math.round(targetCalories + 100) },
                    macro_split: { protein_pct: 0.3, carb_pct: 0.4, fat_pct: 0.3 } // Standard Azuka split
                });
            } else {
                 // REAL AGENT CALL
                 console.log(`[Food] Cache miss. Running Metabolic Agent for ${user.name}...`);
                 metabolicData = await calculateWeeklyEnvelope(user, dateKey);
                 
                 // Cache the result
                 if(metabolicData) setCache(envelopeKey, metabolicData);
            }
        } else {
            console.log(`[Food] Serving cached envelope.`);
        }

        // Extract today's target from the envelope
        // metabolicData is a 7-day array. Day 0 is today.
        // Structure: [{ calorie_target: { min, max }, ... }]
        const todayData = metabolicData[0];
        let targetCalories = todayData?.calorie_target ? 
            Math.round((todayData.calorie_target.min + todayData.calorie_target.max) / 2) : 
            2000;
        
        // Safety Clamp (1200 - 4000)
        targetCalories = Math.max(1200, Math.min(targetCalories, 4000));
            
        const targets = {
            calories: targetCalories,
            protein: Math.round((targetCalories * (todayData?.macro_split?.protein_pct || 0.25)) / 4), 
            carbs: Math.round((targetCalories * (todayData?.macro_split?.carb_pct || 0.45)) / 4),   
            fat: Math.round((targetCalories * (todayData?.macro_split?.fat_pct || 0.30)) / 9)     
        };

        // 3. Calculate Totals
        let current = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        if (log.entries) {
            log.entries.forEach(e => {
                const c = Number(e.calories) || 0;
                const p = Number(e.macros?.protein) || 0;
                const carb = Number(e.macros?.carbs) || 0;
                const f = Number(e.macros?.fat) || 0;

                // Sanity check to ignore bad data (e.g. 56880 protein)
                if (c < 10000) current.calories += c;
                if (p < 1000) current.protein += p;
                if (carb < 1000) current.carbs += carb;
                if (f < 1000) current.fat += f;
            });
        }

        res.json({
            success: true,
            data: {
                summary: current,
                targets: targets,
                meals: log.entries || []
            }
        });

    } catch (error) {
        console.error("Food Dashboard Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/food/log
export const logFood = async (req, res) => {
    try {
        const { name, calories, protein, carbs, fat, type } = req.body;
        const user = await getUser(req.userId);
        const today = new Date();
        today.setHours(0,0,0,0);

        let log = await FoodLog.findOne({ userId: user._id, date: today });
        if (!log) {
            log = new FoodLog({ userId: user._id, date: today, entries: [], total_calories: 0 });
        }

        const newEntry = {
            type: type || "manual",
            food: name,
            calories: Math.min(parseInt(calories) || 0, 5000),
            macros: {
                protein: Math.min(parseInt(protein) || 0, 1000),
                carbs: Math.min(parseInt(carbs) || 0, 1000),
                fat: Math.min(parseInt(fat) || 0, 1000)
            }
        };

        log.entries.push(newEntry);
        log.total_calories += newEntry.calories;
        await log.save();

        res.json({ success: true, log });

    } catch (error) {
        console.error("Log Food Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/food/recipes
export const getRecipes = async (req, res) => {
    try {
        const user = await getUser(req.userId);
        // Get saved recipes + maybe some default ones
        const recipes = await Recipe.find({ userId: user._id }).sort({ created_at: -1 });
        
        // Map favorites
        const recipesWithFavs = recipes.map(r => ({
            ...r.toObject(),
            isFavorite: user.favoriteRecipes?.includes(r._id) || false
        }));

        res.json({ success: true, recipes: recipesWithFavs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/food/recipe/favorite
export const toggleFavorite = async (req, res) => {
    try {
        const user = await getUser(req.userId);
        const { recipeId } = req.body;

        if (!recipeId) return res.status(400).json({ success: false, message: "Recipe ID required" });

        const index = user.favoriteRecipes.indexOf(recipeId);
        let isFavorite = false;

        if (index === -1) {
            user.favoriteRecipes.push(recipeId);
            isFavorite = true;
        } else {
            user.favoriteRecipes.splice(index, 1);
            isFavorite = false;
        }

        await user.save();
        res.json({ success: true, isFavorite });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/food/recipe/save
export const saveRecipe = async (req, res) => {
    try {
        const user = await getUser(req.userId);
        const recipeData = req.body;
        
        const newRecipe = await Recipe.create({
            userId: user._id,
            ...recipeData
        });

        res.json({ success: true, recipe: newRecipe });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
