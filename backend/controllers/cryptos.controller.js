import { Crypto } from '../models/crypto.model.js';
import { CryptoStatic } from '../models/cryptostatic.model.js';
import { getMarketsURL, getCoinDetailURL } from '../config/api.config.js';
import axios from 'axios';

const OVERVIEW_CACHE_DURATION_MINUTES = 2;

// Global lock for all processes using CoinGecko API
let isUpdating = false;
let lastUpdateAttempt = 0;
const MIN_UPDATE_INTERVAL = 60 * 1000; // 1 minute between any update

// Helper function to acquire the update lock
export const acquireUpdateLock = () => {
  const now = Date.now();
  const timeSinceLastAttempt = now - lastUpdateAttempt;
  
  if (isUpdating) {
    console.log('Update already in progress by another process');
    return false;
  }
  
  if (timeSinceLastAttempt < MIN_UPDATE_INTERVAL) {
    const timeRemaining = Math.ceil((MIN_UPDATE_INTERVAL - timeSinceLastAttempt) / 1000);
    console.log(`Too soon since last update (wait ${timeRemaining}s more)`);
    return false;
  }
  
  isUpdating = true;
  lastUpdateAttempt = now;
  console.log('Update lock acquired');
  return true;
};

// Helper function to release the update lock
export const releaseUpdateLock = () => {
  isUpdating = false;
  console.log('Update lock released');
};

export const fetchAndCacheCryptos = async () => {
  // Verify lock before executing
  if (!acquireUpdateLock()) {
    console.log('Skipping fetchAndCacheCryptos - lock not acquired');
    return;
  }
  
  try {
    console.log('Starting fetchAndCacheCryptos...');
    console.log('Fetching fresh crypto data from CoinGecko...');
    
    const response = await axios.get(getMarketsURL());
    
    const cryptoUpdates = response.data.map(crypto => ({
      updateOne: {
        filter: { coinId: crypto.id },
        update: {
          coinId: crypto.id,
          name: crypto.name,
          symbol: crypto.symbol,
          current_price: crypto.current_price,
          market_cap: crypto.market_cap,
          price_change_percentage_24h: crypto.price_change_percentage_24h,
          image: crypto.image,
          lastUpdated: new Date()
        },
        upsert: true
      }
    }));
    
    console.log('About to perform bulkWrite with', cryptoUpdates.length, 'updates');
    await Crypto.bulkWrite(cryptoUpdates);
    console.log(`Successfully updated ${response.data.length} cryptocurrencies`);
    
  } catch (error) {
    console.error('❌ ERROR in fetchAndCacheCryptos:', error.message);
    throw error;
  } finally {
    releaseUpdateLock();
  }
};

export const getCachedCryptos = async (req, res) => {
  console.log('getCachedCryptos endpoint called');
  
  try {
    console.log('Calculating cache threshold...');
    const cacheThreshold = new Date(Date.now() - OVERVIEW_CACHE_DURATION_MINUTES * 60 * 1000);
    console.log('Cache threshold:', cacheThreshold);

    console.log('Querying database for all cryptos...');
    const allCryptos = await Crypto.find()
    .sort({ market_cap: -1 })  
    .limit(160); 
    
    console.log('Found cryptos in database:', allCryptos.length);
    
    const freshCryptos = allCryptos.filter(crypto => crypto.lastUpdated >= cacheThreshold);
    console.log('Fresh cryptos found:', freshCryptos.length);
    
    if (freshCryptos.length > 0) {
      console.log(`Serving ${freshCryptos.length} fresh cached cryptos`);
      return res.json(freshCryptos);
    }
    
    if (allCryptos.length > 0) {
      console.log(`Serving ${allCryptos.length} stale cryptos`);
      
      // Try to acquire lock for background update
      if (acquireUpdateLock()) {
        console.log('🔄 Triggering background update to CoinGecko...');
        
        fetchAndCacheCryptos()
          .then(() => console.log('Background update completed successfully'))
          .catch(error => console.log('Background update failed:', error.message));
        // Lock is released in fetchAndCacheCryptos finally block
      } else {
        console.log('Background update skipped (lock not available)');
      }
      
      return res.json(allCryptos);
    }
    
    console.log('No cached data found, fetching fresh data...');
    await fetchAndCacheCryptos();
    
    console.log('Fetching newly cached data from database...');
    const newCryptos = await Crypto.find().sort({ market_cap: -1 });
    console.log('Serving', newCryptos.length, 'fresh cryptos');
    res.json(newCryptos);
    
  } catch (error) {
    console.error('ERROR in getCachedCryptos main try block:', error);
    console.error('Error stack:', error.stack);
    
    try {
      console.log('Attempting fallback data query...');
      const fallbackCryptos = await Crypto.find().sort({ market_cap: -1 });
      console.log('Fallback cryptos found:', fallbackCryptos.length);
      
      if (fallbackCryptos.length > 0) {
        console.log('Serving fallback data due to error');
        return res.json(fallbackCryptos);
      }
    } catch (fallbackError) {
      console.error('ERROR in fallback query:', fallbackError);
    }
    
    console.log('No data available, sending error response');
    res.status(500).json({ 
      success: false, 
      message: 'No data available and API failed' 
    });
  }
};

export const fetchAndCacheAllCryptosStatic = async () => {
  try {
    console.log('🔄 Starting fetchAndCacheAllCryptosStatic...');
    
    const cryptoList = await Crypto.find({}, 'coinId').lean();
    const coinIds = cryptoList.map(c => c.coinId);
    
    console.log(`📋 Found ${coinIds.length} cryptos to update static data`);
    
    const batchSize = 5;
    let updated = 0;
    
    for (let i = 0; i < coinIds.length; i += batchSize) {
      const batch = coinIds.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (coinId) => {
          try {
            console.log(`  Fetching static data for ${coinId}...`);
            
            const response = await axios.get(getCoinDetailURL(coinId), {
              params: {
                x_cg_demo_api_key: process.env.COINGECKO_API_KEY
              }
            });  

            const data = response.data;
            
            const staticData = {
              coinId: data.id,
              name: data.name,
              symbol: data.symbol,
              description: {
                en: data.description?.en || '',
                es: data.description?.es || ''
              },
              links: {
                homepage: data.links?.homepage || [],
                whitepaper: data.links?.whitepaper || '',
                blockchain_site: data.links?.blockchain_site || [],
                official_forum_url: data.links?.official_forum_url || [],
                twitter_screen_name: data.links?.twitter_screen_name || '',
                facebook_username: data.links?.facebook_username || '',
                subreddit_url: data.links?.subreddit_url || '',
                telegram_channel_identifier: data.links?.telegram_channel_identifier || '',
                repos_url: {
                  github: data.links?.repos_url?.github || [],
                  bitbucket: data.links?.repos_url?.bitbucket || []
                }
              },
              image: {
                thumb: data.image?.thumb || '',
                small: data.image?.small || '',
                large: data.image?.large || ''
              },
              metadata: {
                genesis_date: data.genesis_date || '',
                hashing_algorithm: data.hashing_algorithm || '',
                block_time_in_minutes: data.block_time_in_minutes || null,
                categories: data.categories || [],
                country_origin: data.country_origin || ''
              },
              lastUpdated: new Date()
            };
            
            await CryptoStatic.findOneAndUpdate(
              { coinId: coinId },
              staticData,
              { upsert: true, new: true }
            );
            
            updated++;
            console.log(`${coinId} updated (${updated}/${coinIds.length})`);
            
          } catch (error) {
            if (error.response?.status === 429) {
              console.error(`  ⏸️  Rate limited on ${coinId}, skipping...`);
            } else {
              console.error(`  ❌ Error fetching ${coinId}:`, error.message);
            }
          }
        })
      );
      
      if (i + batchSize < coinIds.length) {
        console.log('Waiting 20s before next batch...');
        await new Promise(resolve => setTimeout(resolve, 25000)); 
      }
    }
    
    console.log(`Successfully updated ${updated} cryptos static data`);
    
  } catch (error) {
    console.error('❌ ERROR in fetchAndCacheAllCryptosStatic:', error.message);
    throw error;
  }
};

export const getCryptoDynamic = async (req, res) => {
  try {
    const { coinId } = req.params;
    
    const crypto = await Crypto.findOne({ coinId }).lean();
    
    if (!crypto) {
      return res.status(404).json({
        success: false,
        message: 'Crypto not found'
      });
    }
    
    console.log(`Serving dynamic data for ${coinId}`);
    
    // Dynamic data: price, market cap, volume, price changes
    res.json({
      success: true,
      data: {
        current_price: crypto.current_price,
        market_cap: crypto.market_cap,
        total_volume: crypto.total_volume,
        price_change_percentage_24h: crypto.price_change_percentage_24h,
        price_change_percentage_7d: crypto.price_change_percentage_7d,
        price_change_percentage_30d: crypto.price_change_percentage_30d,
        high_24h: crypto.high_24h,
        low_24h: crypto.low_24h,
        circulating_supply: crypto.circulating_supply,
        total_supply: crypto.total_supply,
        max_supply: crypto.max_supply,
        ath: crypto.ath,
        atl: crypto.atl,
        last_updated: crypto.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error fetching crypto dynamic data:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching dynamic data',
      error: error.message
    });
  }
};

export const getCryptoStatic = async (req, res) => {
  try {
    const { coinId } = req.params;
    
    const cryptoStatic = await CryptoStatic.findOne({ coinId });
    
    if (!cryptoStatic) {
      return res.status(404).json({
        success: false,
        message: 'Crypto static data not found'
      });
    }
    
    console.log(`📦 Serving static data from cache for ${coinId}`);
    
    res.json({
      success: true,
      data: cryptoStatic
    });
    
  } catch (error) {
    console.error('Error fetching crypto static data:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching static data',
      error: error.message
    });
  }
};

export const debugDates = async (req, res) => {
  console.log('DEBUG DATES executed for:', req.params.coinId);
  const { coinId } = req.params;
  
  const oldest = await ChartDaily.find({ coinId }).sort({ date: 1 }).limit(5).lean();
  const newest = await ChartDaily.find({ coinId }).sort({ date: -1 }).limit(5).lean();
  const total = await ChartDaily.countDocuments({ coinId });
  
  res.json({
    total,
    oldest: oldest.map(d => d.date),
    newest: newest.map(d => d.date),
    today: new Date().toISOString().split('T')[0],
    thirtyDaysAgo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
};

// Debug endpoint to check date ranges
export const debugRange = async (req, res) => {
  const { coinId } = req.params;
  const { days } = req.query; // ?days=30
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - parseInt(days || 30));
  
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  console.log(`Searching from ${startDateStr} to ${endDateStr}`);
  
  const records = await ChartDaily.find({
    coinId,
    date: { $gte: startDateStr, $lte: endDateStr }
  }).sort({ date: 1 }).lean();
  
  res.json({
    range: `${startDateStr} to ${endDateStr}`,
    total: records.length,
    dates: records.map(r => r.date)
  });
};