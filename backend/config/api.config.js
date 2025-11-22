// CoinGecko API Configuration
export const COINGECKO_API = {
  BASE_URL: 'https://api.coingecko.com/api/v3',
  
  ENDPOINTS: {
    MARKETS: '/coins/markets',
    COIN_DETAIL: '/coins/{id}',
    HISTORICAL: '/coins/{id}/market_chart',
    KLINES: '/coins/{id}/ohlc'
  },
  
  PARAMS: {
    VS_CURRENCY: 'usd',
    PER_PAGE: 160,
    ORDER: 'market_cap_desc',
    SPARKLINE: false,
    PRICE_CHANGE_PERCENTAGE: '24h'
  }
};

// Binance API Configuration
export const BINANCE_API = {
  BASE_URL: 'https://api.binance.com/api/v3',
  
  ENDPOINTS: {
    KLINES: '/klines',
    TICKER_24H: '/ticker/24hr',
    TICKER_PRICE: '/ticker/price'
  },
  
  INTERVALS: {
    ONE_MINUTE: '1m',
    FIVE_MINUTES: '5m',
    ONE_HOUR: '1h',
    FOUR_HOURS: '4h',
    ONE_DAY: '1d'
  }
};

// Helper function to build CoinGecko markets URL
export const buildMarketsURL = () => {
  const { BASE_URL, ENDPOINTS, PARAMS } = COINGECKO_API;
  return `${BASE_URL}${ENDPOINTS.MARKETS}?vs_currency=${PARAMS.VS_CURRENCY}&order=${PARAMS.ORDER}&per_page=${PARAMS.PER_PAGE}&page=1&sparkline=${PARAMS.SPARKLINE}&price_change_percentage=${PARAMS.PRICE_CHANGE_PERCENTAGE}`;
};

// Helper function to build CoinGecko coin detail URL
export const buildCoinDetailURL = (coinId, priceChangePercentages = '7d,14d,30d,60d,200d,1y') => {
  const { BASE_URL, ENDPOINTS } = COINGECKO_API;
  const endpoint = ENDPOINTS.COIN_DETAIL.replace('{id}', coinId);
  return `${BASE_URL}${endpoint}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false&price_change_percentage=${priceChangePercentages}`;
};

// Helper function to build Binance klines URL
export const buildBinanceKlinesURL = (symbol, interval, limit = 1440) => {
  const { BASE_URL, ENDPOINTS } = BINANCE_API;
  return `${BASE_URL}${ENDPOINTS.KLINES}?symbol=${symbol}&interval=${interval}&limit=${limit}`;
};

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// ============================================================================
// LEGACY FUNCTIONS - Keep for backward compatibility
// These functions are used by existing controllers and services
// TODO: Migrate all usages to the helper functions above
// ============================================================================

// Markets Overview - 250 cryptos
export const getMarketsURL = () => {
  return `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=160&page=1&sparkline=false&price_change_percentage=24h`;
};

// - Detail for a specific crypto (static data)
export const getCoinDetailURL = (coinId) => {
  return `${COINGECKO_BASE}/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`;
};

// - Chart Data
export const getChartDataURL = (coinId, days) => {
  return `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
};