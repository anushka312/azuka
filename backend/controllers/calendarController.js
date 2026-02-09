import User from "../src/models/User.js";
import CalendarEvent from "../src/models/CalendarEvent.js";
import SymptomLog from "../src/models/Symptoms.js";
import FoodLog from "../src/models/FoodLog.js";
import WorkoutLog from "../src/models/WorkoutLog.js";
import MindsetLog from "../src/models/MindsetLog.js";
import BodyState from "../src/models/BodyState.js";

// Helper: Get Phase for a given date based on user's cycle
const calculatePhaseForDate = (date, cycleStart, cycleLength) => {
    const diffTime = Math.abs(date - cycleStart);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const currentDay = (diffDays % cycleLength) || cycleLength;

    if (currentDay <= 5) return "menstrual";
    if (currentDay <= 13) return "follicular";
    if (currentDay <= 17) return "ovulatory";
    return "luteal";
};

// GET: /calendar/month?year=2026&month=1 (Month is 0-indexed)
export const getCalendarMonth = async (req, res) => {
    try {
        const { year, month } = req.query;
        // In prod: const userId = req.userId;
        let user;
        if (req.userId) {
            user = await User.findById(req.userId);
        }
        if (!user) user = await User.findOne();
        
        if (!user) return res.status(404).json({ message: "User not found" });

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, parseInt(month) + 1, 0);

        // 1. Fetch Logs for this range
        const [events, symptoms, foods, workouts, mindsets] = await Promise.all([
            CalendarEvent.find({ userId: user._id, date: { $gte: startDate, $lte: endDate } }),
            SymptomLog.find({ userId: user._id, date: { $gte: startDate, $lte: endDate } }),
            FoodLog.find({ userId: user._id, date: { $gte: startDate, $lte: endDate } }),
            WorkoutLog.find({ userId: user._id, date: { $gte: startDate, $lte: endDate } }),
            MindsetLog.find({ userId: user._id, date: { $gte: startDate, $lte: endDate } })
        ]);

        // 2. Build Daily Map
        const daysInMonth = endDate.getDate();
        const calendarData = [];

        // Last period start date for phase calc
        // Assuming lastPeriod is a Date or string in user model
        const lastPeriodDate = new Date(user.lastPeriod || new Date()); 
        
        // Reset time to midnight for accurate day calc
        lastPeriodDate.setHours(0,0,0,0);

        for (let d = 1; d <= daysInMonth; d++) {
            const currentDate = new Date(year, month, d);
            currentDate.setHours(0,0,0,0);
            
            const dateStr = currentDate.toISOString().split('T')[0];

            // Determine Phase
            // Fix: Add 1 to make it 1-based index (Day 1 is start of period)
            const diffTime = currentDate - lastPeriodDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; 
            const currentDay = ((diffDays - 1) % user.cycleLength) + 1;

            let phase = "follicular"; // Default
            if (currentDay <= 5) phase = "menstrual";
            else if (currentDay <= 13) phase = "follicular";
            else if (currentDay <= 17) phase = "ovulatory";
            else phase = "luteal";
            
            // Check logs
            const daySymptoms = symptoms.filter(s => s.date.toISOString().startsWith(dateStr));
            const dayFood = foods.filter(f => f.date.toISOString().startsWith(dateStr));
            const dayWorkout = workouts.filter(w => w.date.toISOString().startsWith(dateStr));
            const dayMindset = mindsets.filter(m => m.date.toISOString().startsWith(dateStr));

            // Determine Icon (Priority: Symptom > Workout > Phase Default)
            let icon = 'leaf';
            if (phase === 'menstrual') icon = 'crescent';
            if (phase === 'ovulatory') icon = 'star';
            if (phase === 'luteal') icon = 'petal';

            // if (dayWorkout.length > 0) icon = 'dumbbell'; // Or some workout icon
            
            // Calculate Total Calories
            const totalCalories = dayFood.reduce((sum, f) => sum + (f.calories || 0), 0);

            calendarData.push({
                date: d,
                fullDate: dateStr,
                phase,
                icon,
                calories: totalCalories,
                hasWorkout: dayWorkout.length > 0,
                workoutDetails: dayWorkout.length > 0 ? {
                    type: dayWorkout[0].type || dayWorkout[0].activityType || 'Workout',
                    duration: dayWorkout[0].duration || 0
                } : null,
                symptoms: daySymptoms.map(s => s.symptoms).flat(),
                mood: dayMindset.length > 0 ? dayMindset[0].mood : (daySymptoms.length > 0 ? daySymptoms[0].mood : null),
                moodNote: dayMindset.length > 0 ? dayMindset[0].notes : null
            });
        }

        // Add padding for start of month
        const firstDayIndex = startDate.getDay(); // 0 = Sunday
        const padding = Array(firstDayIndex).fill(null);

        res.json({
            success: true,
            data: [...padding, ...calendarData]
        });

    } catch (error) {
        console.error("Calendar Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// POST: /calendar/log
// Unified endpoint to log symptoms/notes from Calendar
export const logCalendarEvent = async (req, res) => {
    try {
        const { date, type, data } = req.body; 
        // type: 'symptom', 'note', 'workout_manual', 'mood', 'food'
        
        // Use req.userId if available from middleware, fallback to findOne for dev
        let user = req.userId ? await User.findById(req.userId) : await User.findOne();
        if (!user) return res.status(404).json({ message: "User not found" });

        const logDate = new Date(date);

        if (type === 'symptom') {
            const newLog = await SymptomLog.create({
                userId: user._id,
                date: logDate,
                symptoms: data.symptoms || [],
                mood: data.mood,
                cravings: data.cravings
            });
            return res.json({ success: true, log: newLog });
        }
        
        if (type === 'mood') {
             // Map string mood to numeric if needed, or use provided numeric value
             let moodScore = 75; // Default Good
             if (typeof data.mood === 'number') {
                 moodScore = data.mood;
             } else if (typeof data.mood === 'string') {
                 const lower = data.mood.toLowerCase();
                 if (lower.includes('good') || lower.includes('happy')) moodScore = 85;
                 else if (lower.includes('neutral') || lower.includes('okay')) moodScore = 50;
                 else if (lower.includes('bad') || lower.includes('sad')) moodScore = 20;
             }

             const newLog = await MindsetLog.create({
                 userId: user._id,
                 date: logDate,
                 mood: moodScore,
                 notes: data.note || data.details || `Mood: ${data.mood}`
             });
             return res.json({ success: true, log: newLog });
        }

        if (type === 'workout') {
            const newLog = await WorkoutLog.create({
                userId: user._id,
                date: logDate,
                type: data.workoutType || 'manual',
                duration: data.duration,
                caloriesBurned: data.calories,
                notes: data.notes
            });
            return res.json({ success: true, log: newLog });
        }

        if (type === 'food') {
            // Check if log exists for this day
            let log = await FoodLog.findOne({ userId: user._id, date: logDate });
            
            if (log) {
                if (data.items && Array.isArray(data.items)) {
                    log.entries.push(...data.items);
                }
                if (data.calories) {
                    log.total_calories = (log.total_calories || 0) + Number(data.calories);
                }
                await log.save();
            } else {
                log = await FoodLog.create({
                    userId: user._id,
                    date: logDate,
                    entries: data.items || [],
                    total_calories: data.calories || 0
                });
            }
            return res.json({ success: true, log });
        }

        if (type === 'body') {
            // BodyState is usually one per day, update if exists
            // Flatten data or map specific fields if necessary
            // Assuming data contains: sleep, stress, physiology, etc. or partial updates
            
            const updateData = {};
            if (data.sleep) updateData.sleep = data.sleep;
            if (data.stress) updateData.stress = data.stress;
            if (data.physiology) updateData.physiology = data.physiology;
            if (data.weight) updateData['metabolic.weight'] = data.weight; // Example mapping if schema had weight there, but schema has it in User? 
            // Wait, BodyState schema doesn't have top-level weight. It has metabolic.
            // Let's check BodyState schema again.
            // It has cycle, physiology, sleep, stress, metabolic, behavior.
            // No direct weight field? 
            // Ah, User model has weight. BodyState might not track daily weight unless added.
            // Let's assume data maps to schema fields directly.
            
            const log = await BodyState.findOneAndUpdate(
                { userId: user._id, date: logDate },
                { $set: data }, // simple merge
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
            return res.json({ success: true, log });
        }

        // Default fallback
        const event = await CalendarEvent.create({
            userId: user._id,
            date: logDate,
            title: data.title || 'Event',
            type: type || 'event',
            details: data
        });

        res.json({ success: true, log: event });

    } catch (error) {
         console.error("Log Error:", error);
         res.status(500).json({ message: "Server Error" });
    }
};