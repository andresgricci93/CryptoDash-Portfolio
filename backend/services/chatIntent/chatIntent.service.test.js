import { describe, it, expect } from 'vitest';
import { shouldPreferFavoriteCoinsForPriceFetch } from './chatIntent.service.js';

describe('shouldPreferFavoriteCoinsForPriceFetch', () => {
  it('is false for empty or non-strings', () => {
    expect(shouldPreferFavoriteCoinsForPriceFetch('')).toBe(false);
    expect(shouldPreferFavoriteCoinsForPriceFetch('   ')).toBe(false);
    expect(shouldPreferFavoriteCoinsForPriceFetch(null)).toBe(false);
  });

  it('is true for generic price asks without asset keywords', () => {
    expect(shouldPreferFavoriteCoinsForPriceFetch('current crypto prices')).toBe(true);
    expect(shouldPreferFavoriteCoinsForPriceFetch('what are the latest prices')).toBe(true);
    expect(shouldPreferFavoriteCoinsForPriceFetch("what's the price")).toBe(true);
  });

  it('is false when a supported asset is mentioned', () => {
    expect(shouldPreferFavoriteCoinsForPriceFetch('bitcoin price')).toBe(false);
    expect(shouldPreferFavoriteCoinsForPriceFetch("what's the price of ETH")).toBe(false);
  });

  it('is false for unrelated chat', () => {
    expect(shouldPreferFavoriteCoinsForPriceFetch('summarize my note about taxes')).toBe(false);
  });
});
