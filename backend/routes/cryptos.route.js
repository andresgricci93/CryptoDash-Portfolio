import {getCachedCryptos} from "../controllers/cryptos.controller.js";

import express from "express";

const router = express.Router();


router.get("/cryptos", getCachedCryptos);

export default router;