import { describe, it, expect } from 'vitest';
import { SUPPORTED_FIAT_CODES } from '../../currencies.js';
import {
  extractChatFiatCodeFromMessage,
  messageReferencesSupportedFiat,
  tryPersistChatFiatFromMessage,
} from './chatFiatFromMessage.js';

describe('messageReferencesSupportedFiat', () => {
  it('is false for unrelated text', () => {
    expect(messageReferencesSupportedFiat('What is the price of SOL?')).toBe(false);
  });

  it.each([
    ['MXN', 'show me prices in MXN'],
    ['TRY', 'display in Turkish lira'],
    ['ZAR', 'use South African rand'],
    ['THB', 'chart in THB'],
    ['CZK', 'values in czk'],
    ['ILS', 'report in Israeli shekel'],
    ['ARS', 'totals in Argentine peso'],
    ['NOK', 'spreadsheet in norwegian krone'],
    ['SEK', 'table in SEK'],
    ['DKK', 'list in danish krone'],
    ['PLN', 'export in zloty please'],
    ['HKD', 'figures in HKD'],
    ['SGD', 'quote in singapore dollar'],
    ['KRW', 'price in korean won'],
    ['BRL', 'amount in brazilian real'],
    ['RUB', 'sum in rubles'],
    ['INR', 'balance in indian rupee'],
    ['CNY', 'line in chinese yuan'],
    ['CHF', 'row in CHF'],
    ['AUD', 'cell in australian dollar'],
    ['CAD', 'field in canadian dollar'],
    ['JPY', 'cell in yen'],
    ['GBP', 'note in pounds'],
    ['EUR', 'memo in euros'],
    ['USD', 'footer in USD'],
  ])('detects %s in broad-style phrase', (code, msg) => {
    expect(messageReferencesSupportedFiat(msg)).toBe(true);
  });
});

describe('extractChatFiatCodeFromMessage', () => {
  it('returns null when two ISO codes appear', () => {
    expect(extractChatFiatCodeFromMessage('compare EUR and GBP')).toBeNull();
  });

  it('prefers explicit ISO when alone', () => {
    expect(extractChatFiatCodeFromMessage('switch to MXN now')).toBe('MXN');
  });
});

describe('tryPersistChatFiatFromMessage — strict intent + every dropdown fiat', () => {
  it.each([
    ['USD', 'I want to change to US dollar'],
    ['EUR', 'I want to change to euro'],
    ['GBP', 'switch to british pound'],
    ['JPY', 'from now on use japanese yen'],
    ['CAD', 'I want to switch to canadian dollar'],
    ['AUD', 'always use australian dollar for prices'],
    ['CHF', 'set my default currency to swiss franc'],
    ['CNY', 'by default I want chinese yuan'],
    ['INR', 'change my currency to indian rupee'],
    ['BRL', 'switch to brazilian real please'],
    ['RUB', 'I prefer russian ruble'],
    ['KRW', 'remember that I use korean won'],
    ['MXN', 'I want to change to mexican peso'],
    ['SGD', 'I want to switch to singapore dollar'],
    ['HKD', "I'd like to change to hong kong dollar"],
    ['NOK', 'switch to norwegian krone'],
    ['SEK', 'from now on show prices in swedish krona'],
    ['DKK', 'always use danish krone'],
    ['PLN', 'set my default currency to polish zloty'],
    ['TRY', 'I want to change to turkish lira'],
    ['ZAR', 'switch to south african rand'],
    ['THB', 'I prefer thai baht'],
    ['CZK', 'change my currency to czech koruna'],
    ['ILS', 'I want to change to israeli shekel'],
    ['ARS', 'switch to argentine peso'],
  ])('persists %s — %s', (code, msg) => {
    expect(tryPersistChatFiatFromMessage(msg)).toBe(code);
  });

  it('accepts uppercase ISO with strict wording', () => {
    expect(tryPersistChatFiatFromMessage('I want to change to PLN')).toBe('PLN');
  });

  it('returns null without strict intent', () => {
    expect(tryPersistChatFiatFromMessage('I want mexican peso prices only today')).toBeNull();
  });

  it('returns null for unknown fiat', () => {
    expect(tryPersistChatFiatFromMessage('I want to change to space credits')).toBeNull();
  });

  it('persistence examples cover every supported fiat code', () => {
    const messages = [
      'I want to change to US dollar',
      'I want to change to euro',
      'switch to british pound',
      'from now on use japanese yen',
      'I want to switch to canadian dollar',
      'always use australian dollar for prices',
      'set my default currency to swiss franc',
      'by default I want chinese yuan',
      'change my currency to indian rupee',
      'switch to brazilian real please',
      'I prefer russian ruble',
      'remember that I use korean won',
      'I want to change to mexican peso',
      'I want to switch to singapore dollar',
      "I'd like to change to hong kong dollar",
      'switch to norwegian krone',
      'from now on show prices in swedish krona',
      'always use danish krone',
      'set my default currency to polish zloty',
      'I want to change to turkish lira',
      'switch to south african rand',
      'I prefer thai baht',
      'change my currency to czech koruna',
      'I want to change to israeli shekel',
      'switch to argentine peso',
    ];
    const got = new Set(messages.map((m) => tryPersistChatFiatFromMessage(m)));
    expect(got.size).toBe(SUPPORTED_FIAT_CODES.size);
    for (const c of SUPPORTED_FIAT_CODES) {
      expect(got.has(c)).toBe(true);
    }
  });
});
