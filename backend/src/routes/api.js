import express from 'express';
import { syncDailyLog } from '../../controllers/intelligence.js';

const router = express.Router();

router.post('/sync', syncDailyLog);

export default router;