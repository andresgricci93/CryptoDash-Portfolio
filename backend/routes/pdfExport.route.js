import express from "express";
import { exportToPDF } from "../controllers/pdfExport.controller.js";

const router = express.Router();

router.get("/export/pdf/:noteId", exportToPDF);

export default router;