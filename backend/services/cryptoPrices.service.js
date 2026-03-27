import axios from 'axios';

const SUPPORTED_CRYPTOS = [
  { id: 'bitcoin', keywords: ['bitcoin', 'btc'] },
  { id: 'ethereum', keywords: ['ethereum', 'eth', 'ether'] },
  { id: 'cardano', keywords: ['cardano', 'ada'] },
  { id: 'solana', keywords: ['solana', 'sol'] },
  { id: 'polkadot', keywords: ['polkadot', 'dot'] },
];

let priceCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

export const getCurrentPrices = async (cryptoIds = ['bitcoin', 'ethereum']) => {
  const cacheKey = cryptoIds.sort().join(',');
  const cached = priceCache.get(cacheKey);
  const now = Date.now();

  if (cached && (now - cached.fetchedAt) < CACHE_TTL) {
    return { data: cached.data, isCached: true, cachedAt: cached.fetchedAt };
  }

  try {
    const ids = cryptoIds.join(',');
    const apiKey = process.env.COINGECKO_API_KEY;
    const headers = apiKey ? { 'x-cg-demo-api-key': apiKey } : {};

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
      { headers }
    );

    if (response.data && Object.keys(response.data).length > 0) {
      priceCache.set(cacheKey, { data: response.data, fetchedAt: now });
      return { data: response.data, isCached: false, cachedAt: now };
    }
  } catch (error) {
    console.error('[Prices] CoinGecko fetch failed:', error.message);
  }

  if (cached) {
    return { data: cached.data, isCached: true, cachedAt: cached.fetchedAt };
  }

  return { data: null, isCached: false, cachedAt: null };
};

export const detectCryptoMentions = (query) => {
  const lowerQuery = query.toLowerCase();
  const detected = new Set();

  SUPPORTED_CRYPTOS.forEach(crypto => {
    if (crypto.keywords.some(keyword => lowerQuery.includes(keyword))) {
      detected.add(crypto.id);
    }
  });

  return Array.from(detected);
};
