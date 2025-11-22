import { getCachedCryptos, getCryptoDynamic, getCryptoStatic, fetchAndCacheAllCryptosStatic } from "../controllers/cryptos.controller.js";
import express from "express";

const router = express.Router();

router.get("/cryptos", getCachedCryptos);
router.get("/crypto/:coinId/dynamic", getCryptoDynamic);
router.get("/crypto/:coinId/static", getCryptoStatic);


router.get("/force-refresh", async (req, res) => {
    res.json({ 
      message: "Started fetching static data for 160 cryptos. Check logs. This will take 5-10 minutes.",
      status: "processing" 
    });
    
    
    fetchAndCacheAllCryptosStatic().catch(err => {
      console.error("Error in force-refresh:", err);
    });
  });

export default router;