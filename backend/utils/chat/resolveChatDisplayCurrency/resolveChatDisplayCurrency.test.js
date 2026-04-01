import { describe, it, expect } from 'vitest';
import { resolveChatDisplayCurrency } from './resolveChatDisplayCurrency.js';

describe('resolveChatDisplayCurrency', () => {
  it('defaults to USD when unset or invalid', () => {
    expect(resolveChatDisplayCurrency(null)).toBe('USD');
    expect(resolveChatDisplayCurrency(undefined)).toBe('USD');
    expect(resolveChatDisplayCurrency('')).toBe('USD');
    expect(resolveChatDisplayCurrency('  ')).toBe('USD');
    expect(resolveChatDisplayCurrency('XXX')).toBe('USD');
  });

  it('accepts any dashboard/API fiat code', () => {
    expect(resolveChatDisplayCurrency('eur')).toBe('EUR');
    expect(resolveChatDisplayCurrency('GBP')).toBe('GBP');
    expect(resolveChatDisplayCurrency(' JPY ')).toBe('JPY');
    expect(resolveChatDisplayCurrency('ARS')).toBe('ARS');
  });
});
