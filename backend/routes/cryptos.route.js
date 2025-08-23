import {getAllCryptos, getCryptoMockData} from "../controllers/cryptos.controller.js";

import express from "express";

const router = express.Router();

router.get("/cryptos", getAllCryptos)
router.get("/cryptomockdata", getCryptoMockData );


export default router;