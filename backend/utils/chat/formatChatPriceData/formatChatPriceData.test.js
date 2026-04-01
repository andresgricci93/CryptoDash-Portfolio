import { describe, it, expect } from 'vitest';
import { formatPricesForAiPrompt } from './formatChatPriceData.js';

describe('formatPricesForAiPrompt', () => {
  const sample = {
    bitcoin: { usd: 100, usd_24h_change: -1.5 },
    ethereum: { usd: 200, usd_24h_change: 2 },
  };

  it('formats USD when display is USD', () => {
    const out = formatPricesForAiPrompt(sample, 'USD', 1, '');
    expect(out).toContain('PRICES (USD');
    expect(out).toContain('BITCOIN: $100.00 (USD)');
    expect(out).toContain('ETHEREUM: $200.00 (USD)');
  });

  it('converts with EUR rate', () => {
    const out = formatPricesForAiPrompt(sample, 'EUR', 0.92, '');
    expect(out).toContain('PRICES (converted to EUR');
    expect(out).toContain('BITCOIN: €92.00 (EUR)');
    expect(out).toContain('ETHEREUM: €184.00 (EUR)');
  });

  it('falls back to USD when fx rate missing', () => {
    const out = formatPricesForAiPrompt(sample, 'EUR', null, '');
    expect(out).toContain('PRICES (USD');
  });
});
