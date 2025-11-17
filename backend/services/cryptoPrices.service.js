import axios from 'axios';

/**
 * Supported cryptocurrencies with their aliases
 */
const SUPPORTED_CRYPTOS = [
  { id: 'bitcoin', keywords: ['bitcoin', 'btc'] },
  { id: 'ethereum', keywords: ['ethereum', 'eth', 'ether'] },
  { id: 'cardano', keywords: ['cardano', 'ada'] },
  { id: 'solana', keywords: ['solana', 'sol'] },
  { id: 'polkadot', keywords: ['polkadot', 'dot'] },
];

/**
 * Get current prices for specific cryptocurrencies
 * @param {Array} cryptoIds - Array of crypto IDs like ['bitcoin', 'ethereum']
 * @returns {Promise<Object>} Price data
 */
export const getCurrentPrices = async (cryptoIds = ['bitcoin', 'ethereum']) => {
  try {
    const ids = cryptoIds.join(',');
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto prices:', error.message);
    return null;
  }
};

/**
 * Detect crypto mentions in user query
 * @param {string} query - User's question
 * @returns {Array} Array of detected crypto IDs
 */
export const detectCryptoMentions = (query) => {
  const lowerQuery = query.toLowerCase();
  const detected = new Set();
  
  SUPPORTED_CRYPTOS.forEach(crypto => {
    const hasMatch = crypto.keywords.some(keyword => 
      lowerQuery.includes(keyword)
    );
    
    if (hasMatch) {
      detected.add(crypto.id);
    }
  });
  
  return Array.from(detected);
};