/**
 * Two-level gate: decide whether to call a small LLM to extract / persist chat preferences.
 * Level strict — clear "default / habit" language.
 * Level broad — currency or crypto + presentation verb (needs LLM to disambiguate one-shot vs persistent).
 */

import { messageReferencesSupportedFiat } from '../../utils/chat/chatFiatFromMessage/chatFiatFromMessage.js';
import { STRICT_PREFERENCE_SIGNAL } from './chatPreferenceStrictSignal.js';

const CRYPTO_SIGNAL =
  /\b(btc|bitcoin|eth|ethereum|ether|xrp|ripple|sol|solana|ada|cardano|dot|polkadot)\b/i;

const PRESENTATION_VERB =
  /\b(show|display|give me|see|list|use)\b/i;

/**
 * @param {string | null | undefined} message
 * @returns {'none' | 'strict' | 'broad'}
 */
export const getPreferenceDetectionTier = (message) => {
  if (!message || typeof message !== 'string') return 'none';
  const trimmed = message.trim();
  if (!trimmed) return 'none';

  if (STRICT_PREFERENCE_SIGNAL.test(trimmed)) return 'strict';

  const hasMarketSignal = messageReferencesSupportedFiat(trimmed) || CRYPTO_SIGNAL.test(trimmed);
  if (hasMarketSignal && PRESENTATION_VERB.test(trimmed)) return 'broad';

  return 'none';
};
