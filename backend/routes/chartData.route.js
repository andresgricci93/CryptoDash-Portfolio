import express from 'express';
import { getHistoricalData, debugHourly, testSingleCrypto } from '../controllers/chartDB.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { populateChartDataTop10, populateChartDataTop50, populateChartDataAll } from '../controllers/chartDB.controller.js';

const router = express.Router();

// Public endpoints (no auth required)
router.get('/:coinId/historical', getHistoricalData);

// Protected endpoints (require authentication)
router.get('/populate/top10', verifyToken, populateChartDataTop10);
router.post('/populate/top50', verifyToken, populateChartDataTop50);
router.post('/populate/all', verifyToken, populateChartDataAll);

// Debug and test endpoints (protected)
router.get('/debug-hourly/:coinId', verifyToken, debugHourly);
router.post('/test/:coinId', testSingleCrypto);

export default router;