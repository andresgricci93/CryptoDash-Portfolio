import { Crypto } from '../models/crypto.model.js';
import { CryptoStatic } from '../models/cryptostatic.model.js';
import { getMarketsURL, getCoinDetailURL } from '../config/api.config.js';
import axios from 'axios';

// Fetch from CoinGecko and save to DB (called by external cron job)
export const fetchAndCacheCryptos = async () => {
  try {
    console.log('Fetching crypto data from CoinGecko...');
    
    const response = await axios.get(getMarketsURL(), {
      params: { x_cg_demo_api_key: process.env.COINGECKO_API_KEY }
    });
    
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
          high_24h: crypto.high_24h,
          low_24h: crypto.low_24h,
          ath: crypto.ath,
          ath_date: crypto.ath_date,
          atl: crypto.atl,
          atl_date: crypto.atl_date,
          circulating_supply: crypto.circulating_supply,
          total_supply: crypto.total_supply,
          max_supply: crypto.max_supply,
          total_volume: crypto.total_volume,
          lastUpdated: new Date()
        },
        upsert: true
      }
    }));
    
    await Crypto.bulkWrite(cryptoUpdates);
    console.log(`✅ Updated ${response.data.length} cryptocurrencies`);
    
  } catch (error) {
    console.error('❌ Error in fetchAndCacheCryptos:', error.message);
    throw error;
  }
};

// GET /cryptos - Return cached cryptos from DB
export const getCachedCryptos = async (req, res) => {
  try {
    const cryptos = await Crypto.find()
      .sort({ market_cap: -1 })
      .limit(160);
    
    res.json(cryptos);
    
  } catch (error) {
    console.error('Error in getCachedCryptos:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching cryptos' 
    });
  }
};

// Fetch static data for all cryptos (called by external cron job)
export const fetchAndCacheAllCryptosStatic = async () => {
  try {
    console.log('🔄 Starting fetchAndCacheAllCryptosStatic...');
    
    const cryptoList = await Crypto.find({}, 'coinId').lean();
    const coinIds = cryptoList.map(c => c.coinId);
    
    console.log(`📋 Found ${coinIds.length} cryptos to update`);
    
    const batchSize = 5;
    let updated = 0;
    
    for (let i = 0; i < coinIds.length; i += batchSize) {
      const batch = coinIds.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (coinId) => {
          try {
            const response = await axios.get(getCoinDetailURL(coinId), {
              params: { x_cg_demo_api_key: process.env.COINGECKO_API_KEY }
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
            console.log(`✅ ${coinId} (${updated}/${coinIds.length})`);
            
          } catch (error) {
            if (error.response?.status === 429) {
              console.error(`⏸ Rate limited on ${coinId}`);
            } else {
              console.error(`❌ Error on ${coinId}:`, error.message);
            }
          }
        })
      );
      
      if (i + batchSize < coinIds.length) {
        await new Promise(resolve => setTimeout(resolve, 25000));
      }
    }
    
    console.log(`✅ Updated ${updated} cryptos static data`);
    
  } catch (error) {
    console.error('❌ Error in fetchAndCacheAllCryptosStatic:', error.message);
    throw error;
  }
};

// GET /crypto/:coinId/dynamic - Return dynamic data from DB
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
    
    res.json({
      success: true,
      data: {
        current_price: crypto.current_price,
        market_cap: crypto.market_cap,
        total_volume: crypto.total_volume,
        price_change_percentage_24h: crypto.price_change_percentage_24h,
        high_24h: crypto.high_24h,
        low_24h: crypto.low_24h,
        circulating_supply: crypto.circulating_supply,
        total_supply: crypto.total_supply,
        max_supply: crypto.max_supply,
        ath: crypto.ath,
        ath_date: crypto.ath_date,
        atl: crypto.atl,
        atl_date: crypto.atl_date,
        last_updated: crypto.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error in getCryptoDynamic:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching dynamic data'
    });
  }
};

// GET /crypto/:coinId/static - Return static data from DB
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
    
    res.json({
      success: true,
      data: cryptoStatic
    });
    
  } catch (error) {
    console.error('Error in getCryptoStatic:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching static data'
    });
  }
};
