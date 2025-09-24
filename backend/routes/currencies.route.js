import express from "express";
import { getAllCurrencies } from "../controllers/currencies.controller.js";

const router = express.Router();
router.get("/currencies", getAllCurrencies);

export default router;