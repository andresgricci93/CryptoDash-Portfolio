import { describe, it, expect } from 'vitest';
import { getPreferenceDetectionTier } from './chatPreferenceGate.service.js';

describe('getPreferenceDetectionTier', () => {
  it('returns none for empty or non-string input', () => {
    expect(getPreferenceDetectionTier('')).toBe('none');
    expect(getPreferenceDetectionTier('   ')).toBe('none');
    expect(getPreferenceDetectionTier(null)).toBe('none');
    expect(getPreferenceDetectionTier(undefined)).toBe('none');
  });

  it('returns none for normal chat without preference signals', () => {
    expect(getPreferenceDetectionTier('What is the ATH of SOL?')).toBe('none');
    expect(getPreferenceDetectionTier('Summarize my note about Ethereum')).toBe('none');
    expect(getPreferenceDetectionTier('Hi')).toBe('none');
  });

  describe('strict tier — explicit default / habit language', () => {
    it.each([
      ['From now on show prices in euros'],
      ['by default I want USD'],
      ['always use EUR for prices'],
      ['set my default currency to GBP'],
      ['switch to euros please'],
      ['I prefer pounds'],
      ['remember that I use EUR'],
      ['save my preference for BTC only'],
      ['I want to change to mexican peso'],
      ["I'd like to switch to norwegian krone"],
      ['I want to change to TRY'],
    ])('%s', (msg) => {
      expect(getPreferenceDetectionTier(msg)).toBe('strict');
    });
  });

  describe('broad tier — market terms + presentation verb (LLM disambiguation)', () => {
    it.each([
      ['Show me BTC in euros'],
      ['give me ethereum price in EUR'],
      ['display sol in dollars'],
      ['use GBP for this chart'],
      ['show SOL in mexican peso'],
      ['list ADA price in THB'],
      ['give me BTC in zloty'],
      ['display ETH in south african rand'],
    ])('%s', (msg) => {
      expect(getPreferenceDetectionTier(msg)).toBe('broad');
    });
  });

  it('strict wins over broad when both could apply', () => {
    expect(getPreferenceDetectionTier('from now on show BTC in euros')).toBe('strict');
  });
});
