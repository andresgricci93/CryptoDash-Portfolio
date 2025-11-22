const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch historical chart data
 * @param {string} coinId - Coin ID (ej: 'bitcoin')
 * @param {string} timeframe - Timeframe (7D, 30D, 90D, 180D, 1YR)
 * @returns {Promise<Array>} Chart data
 */


export const fetchHistoricalData = async (coinId, timeframe) => {
  const response = await fetch(
    `${API_URL}/chart/${coinId}/historical?timeframe=${timeframe}`,
    { credentials: 'include' }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch chart data');
  }
  
  const result = await response.json();
  return result.data;
};