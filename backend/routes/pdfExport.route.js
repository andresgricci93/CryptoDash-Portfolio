import express from "express";
import { exportToPDF, exportToWord, generateAISummary, exportSummaryToPDF, exportSummaryToWord } from "../controllers/pdfExport.controller.js";

const router = express.Router();

router.get("/export/pdf/:noteId", exportToPDF);
router.get("/export/word/:noteId", exportToWord);
router.get("/ai-summary/:noteId", generateAISummary);
router.post("/export/summary-pdf", exportSummaryToPDF);
router.post("/export/summary-word", exportSummaryToWord);


export default router;