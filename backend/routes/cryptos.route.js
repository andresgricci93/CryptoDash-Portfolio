import {getAllCryptos} from "../controllers/cryptos.controller.js";
import express from "express";

const router = express.Router();

router.get("/cryptos", getAllCryptos)

export default router;