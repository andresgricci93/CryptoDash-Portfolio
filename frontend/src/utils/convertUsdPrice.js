/**
 * Pure conversion: USD base price → user's display currency using API rates.
 * Same rules as useCurrencyStore.convertPrice (keeps UI and tests in sync).
 *
 * @param {number} usdPrice
 * @param {string} selectedCurrency - e.g. 'USD', 'EUR'
 * @param {{ code: string, rate: number }[] | null | undefined} currencyRates
 * @returns {number}
 */
export function convertUsdPrice(usdPrice, selectedCurrency, currencyRates) {
  if (usdPrice == null || Number.isNaN(usdPrice)) return usdPrice;
  if (selectedCurrency === 'USD') return usdPrice;

  const rate = currencyRates?.find((r) => r.code === selectedCurrency)?.rate;
  return rate ? usdPrice * rate : usdPrice;
}
