import { describe, it, expect } from 'vitest';
import { convertUsdPrice } from './convertUsdPrice.js';

describe('convertUsdPrice', () => {
  it('leaves USD unchanged', () => {
    expect(convertUsdPrice(65803.42, 'USD', null)).toBe(65803.42);
  });

  it('converts to EUR with exact multiplier (matches store behaviour)', () => {
    const rates = [{ code: 'EUR', rate: 0.92 }];
    expect(convertUsdPrice(100, 'EUR', rates)).toBe(92);
    expect(convertUsdPrice(65803.42, 'EUR', rates)).toBeCloseTo(65803.42 * 0.92, 10);
  });

  it('falls back to USD value when rate missing', () => {
    expect(convertUsdPrice(50, 'EUR', [])).toBe(50);
    expect(convertUsdPrice(50, 'EUR', [{ code: 'GBP', rate: 0.79 }])).toBe(50);
  });

  it('handles nullish price', () => {
    expect(convertUsdPrice(null, 'EUR', [{ code: 'EUR', rate: 0.92 }])).toBe(null);
    expect(convertUsdPrice(undefined, 'EUR', [{ code: 'EUR', rate: 0.92 }])).toBe(undefined);
  });
});
