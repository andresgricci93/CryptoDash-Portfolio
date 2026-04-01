/**
 * USD base → display currency using the same multiplier as Mongo Currency.rate (vs USD).
 * Mirrors frontend/src/utils/convertUsdPrice.js logic.
 */
export function convertUsdPrice(usdPrice, selectedCurrency, rate) {
  if (usdPrice == null || Number.isNaN(usdPrice)) return usdPrice;
  if (selectedCurrency === 'USD') return usdPrice;
  return rate != null ? usdPrice * rate : usdPrice;
}
