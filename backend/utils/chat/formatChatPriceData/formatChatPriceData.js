import { convertUsdPrice } from '../../convertUsdPrice.js';
import { getCurrencySymbol } from '../../currencies.js';

const formatAmount = (n) =>
  typeof n === 'number'
    ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : String(n);

/**
 * @param {Record<string, { usd: number, usd_24h_change?: number }>} prices - CoinGecko simple/price shape
 * @param {string} displayCode - e.g. EUR, USD
 * @param {number | null | undefined} fxRate - Currency.rate from DB (undefined for USD)
 * @param {string} priceAgeSuffix - e.g. " (cached from …)"
 */
export function formatPricesForAiPrompt(prices, displayCode, fxRate, priceAgeSuffix = '') {
  const code = (displayCode || 'USD').toUpperCase();
  const useUsd = code === 'USD' || fxRate == null;
  const label = useUsd ? 'USD' : code;
  const sym = getCurrencySymbol(label);

  const header = useUsd
    ? 'PRICES (USD, from market feed).'
    : `PRICES (converted to ${label} using your saved exchange rate vs USD; 24h % still refers to USD pair).`;

  const lines = Object.entries(prices)
    .map(([crypto, d]) => {
      const val = useUsd ? d.usd : convertUsdPrice(d.usd, code, fxRate);
      const pct = d.usd_24h_change != null ? `${d.usd_24h_change.toFixed(2)}%` : 'n/a';
      return `${crypto.toUpperCase()}: ${sym}${formatAmount(val)} (${label}) (24h: ${pct})`;
    })
    .join(' | ');

  return `${header}\n${lines}${priceAgeSuffix}`;
}
