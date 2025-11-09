import express from 'express';
import { generateReport,chat } from '../controllers/ai.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Generate AI report - protected route
router.post('/generate-report', verifyToken, generateReport);
router.post('/chat', verifyToken, chat);

export default router;