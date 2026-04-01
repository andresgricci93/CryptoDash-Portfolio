import { SUPPORTED_FIAT_CODES } from '../../currencies.js';

/**
 * Fiat code for chat price formatting only (independent of dashboard dropdown / profile).
 * - If `preferredCurrencyChat` is set and matches a dashboard/API fiat → use it.
 * - Otherwise → USD (user did not specify a chat currency).
 *
 * Same codes as the dashboard currency dropdown (`SUPPORTED_FIAT_CODES` / Currency collection).
 */
export function resolveChatDisplayCurrency(preferredCurrencyChat) {
  const raw =
    typeof preferredCurrencyChat === 'string'
      ? preferredCurrencyChat.trim().toUpperCase()
      : '';
  if (!raw || !SUPPORTED_FIAT_CODES.has(raw)) return 'USD';
  return raw;
}
