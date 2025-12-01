import { getCachedCryptos, getCryptoDynamic, getCryptoStatic, fetchAndCacheCryptos, fetchAndCacheAllCryptosStatic } from "../controllers/cryptos.controller.js";
import express from "express";

const router = express.Router();

router.get("/cryptos", getCachedCryptos);
router.get("/crypto/:coinId/dynamic", getCryptoDynamic);
router.get("/crypto/:coinId/static", getCryptoStatic);

// Cron job endpoint - updates dynamic crypto data (prices)
router.get("/cron/update-cryptos", async (req, res) => {
  const cronSecret = req.query.secret || req.headers['x-cron-secret'];
  
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  
  try {
    await fetchAndCacheCryptos();
    res.json({ success: true, message: "Crypto prices updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Force refresh static data (manual trigger)
router.get("/cron/update-static", async (req, res) => {
  const cronSecret = req.query.secret || req.headers['x-cron-secret'];
  
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  
  res.json({ 
    success: true,
    message: "Started fetching static data. This will take 5-10 minutes."
  });
  
  fetchAndCacheAllCryptosStatic().catch(err => {
    console.error("Error in update-static:", err);
  });
});

export default router;