import { SUPPORTED_FIAT_CODES } from '../../currencies.js';
import { STRICT_PREFERENCE_SIGNAL } from '../../../services/chatPreferenceGate/chatPreferenceStrictSignal.js';

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** @type {{ phrase: string, code: string }[]} */
const _pairs = [];

function add(code, phrases) {
  for (const p of phrases) {
    _pairs.push({ phrase: p.toLowerCase(), code });
  }
}

add('USD', [
  'us dollar',
  'us dollars',
  'american dollar',
  'usd',
  'dollar',
  'dollars',
]);
add('EUR', ['euro', 'euros', 'eur']);
add('GBP', ['british pound', 'pound sterling', 'sterling', 'gbp', 'pound', 'pounds']);
add('JPY', ['japanese yen', 'jpy', 'yen']);
add('CAD', ['canadian dollar', 'cad', 'loonie']);
add('AUD', ['australian dollar', 'aud']);
add('CHF', ['swiss franc', 'chf']);
add('CNY', ['chinese yuan', 'renminbi', 'yuan', 'cny']);
add('INR', ['indian rupee', 'inr', 'rupee']);
add('BRL', ['brazilian real', 'brl']);
add('RUB', ['russian ruble', 'rub', 'ruble']);
add('KRW', ['south korean won', 'korean won', 'krw']);
add('MXN', ['mexican peso', 'mxn']);
add('SGD', ['singapore dollar', 'sgd']);
add('HKD', ['hong kong dollar', 'hkd']);
add('NOK', ['norwegian krone', 'nok']);
add('SEK', ['swedish krona', 'swedish crown', 'sek']);
add('DKK', ['danish krone', 'dkk']);
add('PLN', ['polish zloty', 'zloty', 'pln']);
add('TRY', ['turkish lira', 'try', 'lira']);
add('ZAR', ['south african rand', 'zar', 'rand']);
add('THB', ['thai baht', 'baht', 'thb']);
add('CZK', ['czech koruna', 'czk']);
add('ILS', ['israeli shekel', 'shekel', 'ils']);
add('ARS', ['argentine peso', 'ars']);

/** Longest phrase first so e.g. "canadian dollar" beats "dollar". */
const FIAT_ALIAS_ENTRIES_SORTED = [..._pairs].sort(
  (a, b) => b.phrase.length - a.phrase.length
);

/**
 * True if the message mentions any dashboard / API fiat (codes or English names).
 * Used by chatPreferenceGate broad-tier market signal.
 */
export function messageReferencesSupportedFiat(message) {
  if (!message || typeof message !== 'string') return false;
  const lower = message.toLowerCase();

  for (const { phrase } of FIAT_ALIAS_ENTRIES_SORTED) {
    if (phrase.includes(' ') || phrase.length >= 5) {
      if (lower.includes(phrase)) return true;
    } else if (new RegExp(`\\b${escapeRe(phrase)}\\b`, 'i').test(message)) {
      return true;
    }
  }

  const upperWords = message.match(/\b[A-Z]{3}\b/g) || [];
  if (upperWords.some((w) => SUPPORTED_FIAT_CODES.has(w))) return true;

  const lowerWords = lower.match(/\b[a-z]{3}\b/g) || [];
  return lowerWords.some((w) => SUPPORTED_FIAT_CODES.has(w.toUpperCase()));
}

/**
 * Resolve a single ISO fiat code from English text / ISO tokens. Returns null if ambiguous or unknown.
 */
export function extractChatFiatCodeFromMessage(message) {
  if (!message || typeof message !== 'string') return null;
  const trimmed = message.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();

  const upperHits = trimmed.match(/\b[A-Z]{3}\b/g) || [];
  const fromUpper = [...new Set(upperHits)].filter((c) => SUPPORTED_FIAT_CODES.has(c));
  if (fromUpper.length === 1) return fromUpper[0];
  if (fromUpper.length > 1) return null;

  for (const { phrase, code } of FIAT_ALIAS_ENTRIES_SORTED) {
    if (phrase.includes(' ') || phrase.length >= 5) {
      if (lower.includes(phrase)) return code;
    } else if (new RegExp(`\\b${escapeRe(phrase)}\\b`, 'i').test(trimmed)) {
      return code;
    }
  }

  const lowerHits = lower.match(/\b[a-z]{3}\b/g) || [];
  const fromLower = [...new Set(lowerHits)]
    .map((w) => w.toUpperCase())
    .filter((c) => SUPPORTED_FIAT_CODES.has(c));
  if (fromLower.length === 1) return fromLower[0];

  return null;
}

/**
 * When the user uses strict preference language and names a supported fiat, return that ISO code for persistence.
 */
export function tryPersistChatFiatFromMessage(message) {
  if (!message || typeof message !== 'string') return null;
  if (!STRICT_PREFERENCE_SIGNAL.test(message.trim())) return null;
  const code = extractChatFiatCodeFromMessage(message);
  if (!code || !SUPPORTED_FIAT_CODES.has(code)) return null;
  return code;
}
