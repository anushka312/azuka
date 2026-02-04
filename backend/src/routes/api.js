import express from 'express';
import { syncDailyLog } from '../../controllers/intelligence.js';
import {
    generateWorkoutPlan,
    handleMissedWorkout,
    analyzeCravings,
    analyzeFoodImage,
    generateRecipe,
    trackCalories,
    getDigitalTwin
} from '../../controllers/autonomousFeatures.js';
import { signup, login, deleteUser } from '../../controllers/authController.js';

const router = express.Router();

// Auth
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.delete('/auth/user/:id', deleteUser);

// Original Sync
router.post('/sync', syncDailyLog);

// Autonomous Health Ecosystem Endpoints
router.post('/workout', generateWorkoutPlan);
router.post('/workout_missed', handleMissedWorkout);
router.post('/craving_analyser', analyzeCravings);
router.post('/food_vision', analyzeFoodImage);
router.post('/recipe_generator', generateRecipe);
router.post('/calories_tracker', trackCalories);
router.post('/body_analyser', getDigitalTwin);

export default router;