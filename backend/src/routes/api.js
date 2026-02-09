import express from 'express';
import { syncDailyLog } from '../../controllers/intelligence.js';
import {
    handleMissedWorkout,
    analyzeCravings,
    analyzeSymptoms, // New
    generateRecipe,
    trackCalories,
    getDigitalTwin
} from '../../controllers/autonomousFeatures.js';
import { signup, login, deleteUser, getUserProfile, updateUserProfile } from '../../controllers/authController.js';
import { auth } from '../middleware/authMiddleware.js';

import { getHomeDashboard } from '../../controllers/homeController.js';
import { getCalendarMonth, logCalendarEvent } from '../../controllers/calendarController.js';
import { getWorkoutPlan, completeWorkout, getWorkoutHistory, regeneratePlan, editWorkout } from '../../controllers/workoutController.js';
import { getFoodDashboard, logFood, getRecipes, saveRecipe, analyzeImage, toggleFavorite } from '../../controllers/foodController.js';
import { getForecast } from '../../controllers/forecastController.js';
import { getMindsetHistory, saveCheckIn } from '../../controllers/mindsetController.js';

const router = express.Router();

// Home Dashboard
router.get('/home/dashboard', auth, getHomeDashboard);

// Forecast
router.get('/forecast', auth, getForecast);

// Mindset
router.get('/mindset/history', auth, getMindsetHistory);
router.post('/mindset/checkin', auth, saveCheckIn);

// Calendar
router.get('/calendar/month', auth, getCalendarMonth);
router.post('/calendar/log', auth, logCalendarEvent);

// Workout
router.get('/workout/plan', auth, getWorkoutPlan);
router.get('/workout/history', auth, getWorkoutHistory);
router.post('/workout/complete', auth, completeWorkout);
router.post('/workout/regenerate', auth, regeneratePlan); // New Endpoint
router.post('/workout/edit', auth, editWorkout); // New Endpoint

// Food
router.get('/food/dashboard', auth, getFoodDashboard);
router.post('/food/log', auth, logFood);
router.get('/food/recipes', auth, getRecipes);
router.post('/food/recipe/save', auth, saveRecipe);
router.post('/food/recipe/favorite', auth, toggleFavorite);
router.post('/food/analyze', auth, analyzeImage); // New Endpoint

// Auth
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.get('/auth/profile', auth, getUserProfile);
router.put('/auth/profile', auth, updateUserProfile);
router.delete('/auth/user/:id', deleteUser);

// Original Sync
router.post('/sync', syncDailyLog);

// Autonomous Health Ecosystem Endpoints (Legacy/Specific)
// router.post('/workout', generateWorkoutPlan); // Replaced by regeneratePlan
router.post('/workout_missed', auth, handleMissedWorkout);
router.post('/craving_analyser', auth, analyzeCravings);
router.post('/symptoms/analyze', auth, analyzeSymptoms); // New
// router.post('/food_vision', analyzeFoodImage); // Replaced by analyzeImage
router.post('/recipe_generator', auth, generateRecipe);
router.post('/calories_tracker', trackCalories);
router.post('/body_analyser', getDigitalTwin);

export default router;