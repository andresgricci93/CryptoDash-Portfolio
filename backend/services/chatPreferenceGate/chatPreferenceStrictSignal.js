/**
 * Phrases that imply the user is setting a persistent preference (chat or app).
 * Shared by chatPreferenceGate and chat fiat persistence so behavior stays aligned.
 */
export const STRICT_PREFERENCE_SIGNAL =
  /\b(from now on|from now|by default|as default|always use|always show|set my|change my|switch to|i prefer|remember (?:to|that)|save (?:my|this) (?:preference|default)|update my (?:preference|default)|i want to\s+(?:change|switch)\s+to|i'?d like to\s+(?:change|switch)\s+to)\b/i;
