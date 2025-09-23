import { Crypto } from '../models/crypto.model.js';
import axios from 'axios';

const CACHE_DURATION_MINUTES = 2;

export const fetchAndCacheCryptos = async () => {
  try {
    console.log('Starting fetchAndCacheCryptos...');
    console.log('Fetching fresh crypto data from CoinGecko...');
    
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h'
    );
    
    console.log('CoinGecko API response received, data length:', response.data.length);
    
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
    console.error('ERROR in fetchAndCacheCryptos:', error.message);
    console.error('Full error details:', error);
    throw error;
  }
};

export const getCachedCryptos = async (req, res) => {
  console.log('getCachedCryptos endpoint called');
  
  try {
    console.log('Calculating cache threshold...');
    const cacheThreshold = new Date(Date.now() - CACHE_DURATION_MINUTES * 60 * 1000);
    console.log('Cache threshold:', cacheThreshold);

    console.log('Querying database for all cryptos...');
    const allCryptos = await Crypto.find().sort({ 
      lastUpdated: -1, 
      market_cap: -1  
    });
    
    console.log('Found cryptos in database:', allCryptos.length);
    
    const freshCryptos = allCryptos.filter(crypto => crypto.lastUpdated >= cacheThreshold);
    console.log('Fresh cryptos found:', freshCryptos.length);
    
    if (freshCryptos.length > 0) {
      console.log(`Serving ${freshCryptos.length} fresh cached cryptos`);
      return res.json(freshCryptos);
    }
    
    if (allCryptos.length > 0) {
      console.log(`Serving ${allCryptos.length} stale cryptos, updating in background...`);
      
      fetchAndCacheCryptos().catch(error => 
        console.log('Background update failed:', error.message)
      );
      
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