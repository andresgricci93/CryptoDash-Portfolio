import {ChartDaily} from '../models/chartDaily.model.js';
import { ChartHourly } from '../models/chartHourly.model.js';
import { ChartFourHourly } from '../models/chartFourHourly.model.js';
import { Crypto } from '../models/crypto.model.js';  
import { COINGECKO_TO_BINANCE } from '../utils/coinGeckoToBinance.js'
import axios from 'axios';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getHistoricalData = async (req, res) => {
  try {
    const { coinId } = req.params;
    const { timeframe } = req.query;

    console.log('=== DEBUG getHistoricalData ===');
    console.log('coinId:', coinId);
    console.log('timeframe:', timeframe);
    console.log(`Fetching ${timeframe} data for ${coinId}`);

    let data = [];
    let endDate = new Date();
    let startDate = new Date();

    if (timeframe === '7D') {
      // 7D: HOURLY data (1h) - ~240 points
      startDate.setDate(endDate.getDate() - 10);
      
      const startTimestamp = startDate.getTime();
      const endTimestamp = endDate.getTime();

      const hourlyData = await ChartHourly.find({
        coinId,
        timestamp: { $gte: startTimestamp, $lte: endTimestamp }
      })
      .sort({ timestamp: 1 })
      .lean();
      
      console.log(`Found ${hourlyData.length} hourly data points`);

      data = hourlyData.map(item => ({
        time: Math.floor(item.timestamp / 1000),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        value: item.close
      }));
      
    } else if (timeframe === '30D') {
      // 30D: HOURLY data (1h) - ~720 points
      startDate.setDate(endDate.getDate() - 30);
      
      const startTimestamp = startDate.getTime();
      const endTimestamp = endDate.getTime();

      const hourlyData = await ChartHourly.find({
        coinId,
        timestamp: { $gte: startTimestamp, $lte: endTimestamp }
      })
      .sort({ timestamp: 1 })
      .lean();

      console.log(`Found ${hourlyData.length} hourly data points for 30D`);

      data = hourlyData.map(item => ({
        time: Math.floor(item.timestamp / 1000),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        value: item.close
      }));
      
    } else if (timeframe === '90D' || timeframe === '180D') {
      // 90D and 180D: 4-HOUR data - ~540 and ~1000 points
      const daysMap = { '90D': 90, '180D': 180 };
      const days = daysMap[timeframe];
      
      startDate.setDate(endDate.getDate() - days);
      
      const startTimestamp = startDate.getTime();
      const endTimestamp = endDate.getTime();

      const fourHourlyData = await ChartFourHourly.find({
        coinId,
        timestamp: { $gte: startTimestamp, $lte: endTimestamp }
      })
      .sort({ timestamp: 1 })
      .lean();

      console.log(`Found ${fourHourlyData.length} 4-hourly data points for ${timeframe}`);

      data = fourHourlyData.map(item => ({
        time: Math.floor(item.timestamp / 1000),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        value: item.close
      }));
      
    } else if (timeframe === '1YR') {
      // 1YR: DAILY data (1d) - ~365 points
      startDate.setDate(endDate.getDate() - 365);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const dailyData = await ChartDaily.find({
        coinId,
        date: { $gte: startDateStr, $lte: endDateStr }
      })
      .sort({ date: 1 })
      .lean();

      console.log(`Found ${dailyData.length} data points for 1YR`);

      data = dailyData.map(item => ({
        time: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        value: item.close
      }));
    }

    res.json({
      success: true,
      data
    });
    
  } catch (error) {
    console.error('Error in getHistoricalData:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const fetchOHLCData = async (coinId, days) => {
  try {
    const url = `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=hourly`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${coinId}:`, error.message);
    return [];
  }
};

const populateDailyForCrypto = async (coinId) => {
  const ohlcData = await fetchBinanceKlinesDaily(coinId, 365); 
  
  console.log(`Binance returns ${ohlcData?.length || 0} points for ${coinId}`);
  
  if (!ohlcData || ohlcData.length === 0) {
    return { inserted: 0, updated: 0 };
  }
  
  let inserted = 0;
  let updated = 0;
  
  for (const [timestamp, open, high, low, close] of ohlcData) {
    const date = new Date(timestamp);
    const dateString = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
    
    try {
      const existing = await ChartDaily.findOne({ coinId, date: dateString });
      
      if (existing) {
        // Already exists, update
        await ChartDaily.updateOne(
          { coinId, date: dateString },
          { open, high, low, close, volume: 0, lastUpdated: new Date() }
        );
        updated++;
      } else {
        // Doesn't exist, insert
        await ChartDaily.create({
          coinId,
          date: dateString,
          open,
          high,
          low,
          close,
          volume: 0,
          lastUpdated: new Date()
        });
        inserted++;
      }
    } catch (error) {
      console.error(`Error saving ${coinId} on ${dateString}:`, error.message);
    }
  }
  
  return { inserted, updated };
};

const populateHourlyForCrypto = async (coinId) => {
  const ohlcData = await fetchBinanceKlines(coinId, 90);
  
  console.log(`Binance returned ${ohlcData?.length || 0} points for ${coinId}`); 

  if (!ohlcData || ohlcData.length === 0) {
    return { inserted: 0, updated: 0 };
  }
  
  let inserted = 0;
  let updated = 0;
  
  for (const [timestamp, open, high, low, close] of ohlcData) {
    try {
      const existing = await ChartHourly.findOne({ coinId, timestamp });
      
      if (existing) {
        await ChartHourly.updateOne(
          { coinId, timestamp },
          { open, high, low, close, volume: 0, lastUpdated: new Date() }
        );
        updated++;
      } else {
        await ChartHourly.create({
          coinId,
          timestamp,
          open,
          high,
          low,
          close,
          volume: 0,
          lastUpdated: new Date()
        });
        inserted++;
      }
    } catch (error) {
      console.error(`Error saving hourly ${coinId}:`, error.message);
    }
  }
  
  return { inserted, updated };
};

/*============================================================
// POPULATE CHARTS STRATEGY
============================================================*/


const fetchBinanceKlines = async (coinId, days) => {
  const symbol = COINGECKO_TO_BINANCE[coinId];

  if (!symbol) {
    console.log(`${coinId} not available on Binance, using CoinGecko`);
    return fetchOHLCData(coinId, days);
  }
  
  try {
    const interval = '1h'; // Hourly data
    const limit = Math.min(days * 24, 1000); // Max 1000
    
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await axios.get(url);
    
    // Binance returns: [timestamp, open, high, low, close, volume, ...]
    return response.data.map(candle => [
      candle[0],              // timestamp in ms
      parseFloat(candle[1]),  // open
      parseFloat(candle[2]),  // high
      parseFloat(candle[3]),  // low
      parseFloat(candle[4])   // close
    ]);
  } catch (error) {
    console.error(`Error fetching from Binance:`, error.message);
    // Fallback to CoinGecko
    return fetchOHLCData(coinId, days);
  }
};

const fetchBinanceKlinesDaily = async (coinId, days) => {
  const symbol = COINGECKO_TO_BINANCE[coinId];
  if (!symbol) {
    console.log(`${coinId} not available on Binance, using CoinGecko`);
    return fetchOHLCData(coinId, days);
  }
  
  try {
    const interval = '1d'; // Daily interval, not '1h'
    const limit = Math.min(days, 1000); // days directly, not days * 24
    
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await axios.get(url);
    
    console.log(`Binance daily returned ${response.data.length} points for ${coinId}`);
    
    return response.data.map(candle => [
      candle[0],              // timestamp in ms
      parseFloat(candle[1]),  // open
      parseFloat(candle[2]),  // high
      parseFloat(candle[3]),  // low
      parseFloat(candle[4])   // close
    ]);
  } catch (error) {
    console.error(`Error fetching daily from Binance:`, error.message);
    return fetchOHLCData(coinId, days);
  }
};

// Fetch 4-hour klines
const fetchBinanceKlinesFourHourly = async (coinId, days) => {
  const symbol = COINGECKO_TO_BINANCE[coinId];

  if (!symbol) {
    console.log(`${coinId} not available on Binance for 4h`);
    return [];
  }
  
  try {
    const interval = '4h'; // Data every 4 hours
    const limit = Math.min(days * 6, 1000); // 6 candles per day (24h / 4h)
    
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await axios.get(url);
    
    console.log(`Binance 4h returned ${response.data.length} points for ${coinId}`);
    
    return response.data.map(candle => [
      candle[0],              // timestamp in ms
      parseFloat(candle[1]),  // open
      parseFloat(candle[2]),  // high
      parseFloat(candle[3]),  // low
      parseFloat(candle[4])   // close
    ]);
  } catch (error) {
    console.error(`Error fetching 4h from Binance:`, error.message);
    return [];
  }
};


export const populateChartDataTop10 = async (req, res) => {
  try {
    console.log('Starting chart data population (Top 10)...\n');
    
    // Get top 10 cryptos by market cap
    const topCryptos = await Crypto.find()
      .sort({ market_cap: -1 })
      .limit(10)
      .select('coinId name')
      .lean();
    
    console.log(`Found ${topCryptos.length} cryptos to populate\n`);
    
    let totalInserted = 0;
    let totalUpdated = 0;
    
    for (let i = 0; i < topCryptos.length; i++) {
      const crypto = topCryptos[i];
      console.log(`\n[${i + 1}/${topCryptos.length}] Processing ${crypto.name} (${crypto.coinId})...`);
      
      // Populate daily data
      const dailyResult = await populateDailyForCrypto(crypto.coinId);
      console.log(`  Daily: ${dailyResult.inserted} inserted, ${dailyResult.updated} updated`);
      await delay(30000); 
      
      // Populate hourly data
      const hourlyResult = await populateHourlyForCrypto(crypto.coinId);
      console.log(`  Hourly: ${hourlyResult.inserted} inserted, ${hourlyResult.updated} updated`);
      await delay(30000); 

      // Populate 4-hour data
      const fourHourlyResult = await populateFourHourlyForCrypto(crypto.coinId);
      console.log(`  4-Hourly: ${fourHourlyResult.inserted} inserted, ${fourHourlyResult.updated} updated`);
      await delay(30000); 

      totalInserted += dailyResult.inserted + hourlyResult.inserted + fourHourlyResult.inserted;
      totalUpdated += dailyResult.updated + hourlyResult.updated + fourHourlyResult.updated;
      
      // Delay between cryptos (rate limit)
      if (i < topCryptos.length - 1) {
        console.log('  Waiting 60 seconds...');
        await delay(60000);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('POPULATION COMPLETE!');
    console.log(`Total inserted: ${totalInserted}`);
    console.log(`Total updated: ${totalUpdated}`);
    console.log('='.repeat(50));
    
    res.json({
      success: true,
      message: 'Chart data populated successfully',
      stats: {
        cryptosProcessed: topCryptos.length,
        totalInserted,
        totalUpdated
      }
    });
    
  } catch (error) {
    console.error('Error populating chart data:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Populate 4-hour data for a crypto
const populateFourHourlyForCrypto = async (coinId) => {
  const ohlcData = await fetchBinanceKlinesFourHourly(coinId, 180); // 180 days = 1000 points max
  
  if (!ohlcData || ohlcData.length === 0) {
    return { inserted: 0, updated: 0 };
  }
  
  let inserted = 0;
  let updated = 0;
  
  for (const [timestamp, open, high, low, close] of ohlcData) {
    try {
      const existing = await ChartFourHourly.findOne({ coinId, timestamp });
      
      if (existing) {
        await ChartFourHourly.updateOne(
          { coinId, timestamp },
          { open, high, low, close, volume: 0, lastUpdated: new Date() }
        );
        updated++;
      } else {
        await ChartFourHourly.create({
          coinId,
          timestamp,
          open,
          high,
          low,
          close,
          volume: 0,
          lastUpdated: new Date()
        });
        inserted++;
      }
    } catch (error) {
      console.error(`Error saving 4h ${coinId}:`, error.message);
    }
  }
  
  return { inserted, updated };
};

export const populateChartDataAll = async (req, res) => {
  console.log('FUNCTION CALLED - populateChartDataAll (250)'); 
  try {
    console.log('Starting FULL chart data population (250 cryptos)...\n');
    
    const allCryptos = await Crypto.find()
      .sort({ market_cap: -1 })
      .limit(250)
      .select('coinId name')
      .lean();
    
    console.log(`Found ${allCryptos.length} cryptos to populate\n`);
    
    let totalInserted = 0;
    let totalUpdated = 0;
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    const results = [];
    
    for (let i = 0; i < allCryptos.length; i++) {
      const crypto = allCryptos[i];
      console.log(`\n[${i + 1}/${allCryptos.length}] Processing ${crypto.name} (${crypto.coinId})...`);
      
      if (!COINGECKO_TO_BINANCE[crypto.coinId]) {
        console.log(`${crypto.coinId} not available on Binance - SKIPPED`);
        skippedCount++;
        results.push({
          coinId: crypto.coinId,
          name: crypto.name,
          status: 'skipped',
          reason: 'No Binance mapping'
        });
        continue;
      }
      
      try {
        const dailyResult = await populateDailyForCrypto(crypto.coinId);
        console.log(`  Daily: ${dailyResult.inserted} inserted, ${dailyResult.updated} updated`);
        await delay(30000);
        
        const hourlyResult = await populateHourlyForCrypto(crypto.coinId);
        console.log(`  Hourly: ${hourlyResult.inserted} inserted, ${hourlyResult.updated} updated`);
        await delay(30000);

        const fourHourlyResult = await populateFourHourlyForCrypto(crypto.coinId);
        console.log(`  4-Hourly: ${fourHourlyResult.inserted} inserted, ${fourHourlyResult.updated} updated`);

        totalInserted += dailyResult.inserted + hourlyResult.inserted + fourHourlyResult.inserted;
        totalUpdated += dailyResult.updated + hourlyResult.updated + fourHourlyResult.updated;
        
        successCount++;
        results.push({
          coinId: crypto.coinId,
          name: crypto.name,
          status: 'success',
          daily: dailyResult,
          hourly: hourlyResult,
          fourHourly: fourHourlyResult
        });
        
      } catch (error) {
        console.error(`ERROR processing ${crypto.coinId}:`, error.message);
        errorCount++;
        results.push({
          coinId: crypto.coinId,
          name: crypto.name,
          status: 'error',
          error: error.message
        });
      }
      
      if (i < allCryptos.length - 1) {
        console.log('  Waiting 60 seconds...');
        await delay(60000);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('FULL POPULATION COMPLETE (250)!');
    console.log(`Total inserted: ${totalInserted}`);
    console.log(`Total updated: ${totalUpdated}`);
    console.log(`Success: ${successCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('='.repeat(60));
    
    res.json({
      success: true,
      message: 'Full chart data populated (250 cryptos)',
      stats: {
        total: allCryptos.length,
        success: successCount,
        skipped: skippedCount,
        errors: errorCount,
        totalInserted,
        totalUpdated
      },
      details: results
    });
    
  } catch (error) {
    console.error('Error populating all cryptos:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const populateChartDataTop50 = async (req, res) => {
  console.log('FUNCTION CALLED - populateChartDataTop50'); 
  try {
    console.log('Starting chart data population (Top 50)...\n');
    
    const topCryptos = await Crypto.find()
      .sort({ market_cap: -1 })
      .limit(50)
      .select('coinId name')
      .lean();
    
    console.log(`Found ${topCryptos.length} cryptos to populate\n`);
    
    let totalInserted = 0;
    let totalUpdated = 0;
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    const results = []; // Detailed log
    
    for (let i = 0; i < topCryptos.length; i++) {
      const crypto = topCryptos[i];
      console.log(`\n[${i + 1}/${topCryptos.length}] Processing ${crypto.name} (${crypto.coinId})...`);
      
      // Check if exists on Binance
      if (!COINGECKO_TO_BINANCE[crypto.coinId]) {
        console.log(`${crypto.coinId} not available on Binance - SKIPPED`);
        skippedCount++;
        results.push({
          coinId: crypto.coinId,
          name: crypto.name,
          status: 'skipped',
          reason: 'No Binance mapping'
        });
        continue;
      }
      
      try {
        // Populate daily data
        const dailyResult = await populateDailyForCrypto(crypto.coinId);
        console.log(`  Daily: ${dailyResult.inserted} inserted, ${dailyResult.updated} updated`);
        await delay(30000);
        
        // Populate hourly data
        const hourlyResult = await populateHourlyForCrypto(crypto.coinId);
        console.log(`  Hourly: ${hourlyResult.inserted} inserted, ${hourlyResult.updated} updated`);
        await delay(30000);

        // Populate 4-hour data
        const fourHourlyResult = await populateFourHourlyForCrypto(crypto.coinId);
        console.log(`  4-Hourly: ${fourHourlyResult.inserted} inserted, ${fourHourlyResult.updated} updated`);

        totalInserted += dailyResult.inserted + hourlyResult.inserted + fourHourlyResult.inserted;
        totalUpdated += dailyResult.updated + hourlyResult.updated + fourHourlyResult.updated;
        
        successCount++;
        results.push({
          coinId: crypto.coinId,
          name: crypto.name,
          status: 'success',
          daily: dailyResult,
          hourly: hourlyResult,
          fourHourly: fourHourlyResult
        });
        
      } catch (error) {
        console.error(`ERROR processing ${crypto.coinId}:`, error.message);
        errorCount++;
        results.push({
          coinId: crypto.coinId,
          name: crypto.name,
          status: 'error',
          error: error.message
        });
      }
      
      // Delay between cryptos
      if (i < topCryptos.length - 1) {
        console.log('  Waiting 60 seconds...');
        await delay(60000);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('TOP 50 POPULATION COMPLETE!');
    console.log(`Total inserted: ${totalInserted}`);
    console.log(`Total updated: ${totalUpdated}`);
    console.log(`Success: ${successCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('='.repeat(60));
    
    res.json({
      success: true,
      message: 'Top 50 chart data populated',
      stats: {
        total: topCryptos.length,
        success: successCount,
        skipped: skippedCount,
        errors: errorCount,
        totalInserted,
        totalUpdated
      },
      details: results
    });
    
  } catch (error) {
    console.error('Error populating top 50:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const debugHourly = async (req, res) => {
  const { coinId } = req.params;
  
  const total = await ChartHourly.countDocuments({ coinId });
  const newest = await ChartHourly.find({ coinId }).sort({ timestamp: -1 }).limit(5).lean();
  
  res.json({
    coinId,
    total,
    newest: newest.map(d => ({
      timestamp: d.timestamp,
      date: new Date(d.timestamp).toISOString()
    }))
  });
};

// Test endpoint to populate single crypto quickly
export const testSingleCrypto = async (req, res) => {
  const { coinId } = req.params;
  
  console.log(`Testing ${coinId}...`);
  
  try {
    const dailyResult = await populateDailyForCrypto(coinId);
    console.log(`Daily: ${dailyResult.inserted} inserted, ${dailyResult.updated} updated`);
    await delay(30000);
    
    const hourlyResult = await populateHourlyForCrypto(coinId);
    console.log(`Hourly: ${hourlyResult.inserted} inserted, ${hourlyResult.updated} updated`);
    await delay(30000);
    
    const fourHourlyResult = await populateFourHourlyForCrypto(coinId);
    console.log(`4-Hourly: ${fourHourlyResult.inserted} inserted, ${fourHourlyResult.updated} updated`);
    
    res.json({
      success: true,
      coinId,
      results: {
        daily: dailyResult,
        hourly: hourlyResult,
        fourHourly: fourHourlyResult
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};