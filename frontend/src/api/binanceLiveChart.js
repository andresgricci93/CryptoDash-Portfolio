
export const fetchBinanceKlines = async (symbol, interval = '1m', limit = 240) => {
    try {
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Converts Binance format to lightweight-charts format
      return data.map(kline => ({
        time: Math.floor(kline[0] / 1000), // timestamp in seconds
        value: parseFloat(kline[4]), // close price
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
      }));
      
    } catch (error) {
      console.error('Error fetching Binance klines:', error);
      throw error;
    }
  };