import express from 'express';
import { generateReport } from '../controllers/ai.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Generate AI report - protected route
router.post('/generate-report', verifyToken, generateReport);

export default router;