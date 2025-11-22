

// Special cases that don't use the symbol+USDT pattern
const SPECIAL_MAPPINGS = {
    // Stablecoins - use BTC as reference
    'tether': 'BTCUSDT',
    'usd-coin': 'BTCUSDT',
    'usds': 'BTCUSDT',
    'dai': 'BTCUSDT',
    'first-digital-usd': 'BTCUSDT',
    'ethena-usde': 'BTCUSDT',
    'paypal-usd': 'BTCUSDT',
    'true-usd': 'BTCUSDT',
    
    // Wrapped tokens - use the original
    'wrapped-bitcoin': 'BTCUSDT',
    'wrapped-steth': 'ETHUSDT',
    'wrapped-eeth': 'ETHUSDT',
    'weth': 'ETHUSDT',
    'wrapped-beacon-eth': 'ETHUSDT',
    'staked-ether': 'ETHUSDT',
    'wrapped-solana': 'SOLUSDT',
    'wbnb': 'BNBUSDT',
    'wrapped-avax': 'AVAXUSDT',
    
    // Tokens that don't exist in Binance or have different names
    'binancecoin': 'BNBUSDT',
    'avalanche-2': 'AVAXUSDT',
    'polygon-ecosystem-token': 'MATICUSDT',
    'the-open-network': 'TONUSDT',
    'internet-computer': 'ICPUSDT',
    'ethereum-classic': 'ETCUSDT',
    'stellar': 'XLMUSDT',
    'cosmos': 'ATOMUSDT',
    'dogwifcoin': 'WIFUSDT',
    'worldcoin-wld': 'WLDUSDT',
    'render-token': 'RENDERUSDT',
    'hedera-hashgraph': 'HBARUSDT',
    'crypto-com-chain': 'CROUSDT',
    'blockstack': 'STXUSDT',
    'injective-protocol': 'INJUSDT',
    'xdce-crowd-sale': 'XDCUSDT',
    'havven': 'SNXUSDT',
    'elrond-erd-2': 'EGLDUSDT',
    'flare-networks': 'FLRUSDT',
    'basic-attention-token': 'BATUSDT',
    'fetch-ai': 'FETUSDT',
    'ape-and-pepe': null, // Doesn't exist in Binance
    'official-trump': null, // Meme coin, not in Binance
  };
  
  // Coins that definitely don't have a trading pair in Binance
  const UNSUPPORTED_COINS = new Set([
    'figure-heloc',
    'binance-bridged-usdt-bnb-smart-chain',
    'leo-token',
    'coinbase-wrapped-btc',
    'whitebit',
    'usdt0',
    'world-liberty-financial',
    'usd1-wlfi',
    'blackrock-usd-institutional-digital-liquidity-fund',
    'jito-staked-sol',
    'jupiter-perpetuals-liquidity-provider-token',
    'falcon-finance',
    'aster-2',
    'usdtb',
    // ... más wrapped/bridged tokens
  ]);
  
  /**
   * Converts a CoinGecko coinId to Binance WebSocket symbol
   * @param {string} coinId - The CoinGecko coinId (e.g. 'bitcoin')
   * @param {string} symbol - The coin symbol (e.g. 'btc')
   * @returns {string|null} - Binance symbol (e.g. 'btcusdt') or null if not supported
   */
  export const coinIdToBinanceSymbol = (coinId, symbol) => {
    // 1. Check if it's in the unsupported list
    if (UNSUPPORTED_COINS.has(coinId)) {
      return null;
    }
    
    // 2. Check special mappings
    if (SPECIAL_MAPPINGS.hasOwnProperty(coinId)) {
      return SPECIAL_MAPPINGS[coinId];
    }
    
    // 3. Automatic mapping: symbol + usdt
    // Convert to uppercase and add USDT
    return `${symbol.toUpperCase()}USDT`;
  };
  
  /**
   * Checks if a coin has WebSocket support in Binance
   * @param {string} coinId - The CoinGecko coinId
   * @returns {boolean}
   */
  export const isSupportedForLivePrice = (coinId) => {
    if (UNSUPPORTED_COINS.has(coinId)) {
      return false;
    }
    
    if (SPECIAL_MAPPINGS.hasOwnProperty(coinId)) {
      return SPECIAL_MAPPINGS[coinId] !== null;
    }
    
    // By default, assume it's supported
    return true;
  };
  
  /**
   * Gets the Binance symbol for multiple coins
   * @param {Array} cryptos - Array of crypto objects with coinId and symbol
   * @returns {Object} - Mapping of coinId -> binanceSymbol
   */
  export const getBulkBinanceSymbols = (cryptos) => {
    const mapping = {};
    
    cryptos.forEach(crypto => {
      const binanceSymbol = coinIdToBinanceSymbol(crypto.coinId, crypto.symbol);
      if (binanceSymbol) {
        mapping[crypto.coinId] = binanceSymbol;
      }
    });
    
    return mapping;
  };