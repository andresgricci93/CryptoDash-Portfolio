/**
 * Detect when the user wants personal notes in context vs. market snapshot only.
 * Market-only: skip RAG so the model never sees note content for that turn.
 */

const WANTS_NOTES_CONTEXT =
  /\b(my notes?|personal notes?|saved notes?|what (did|have) i (write|save|wrote)|in my note|from my note|note titled|compare.*\bnote|relat(e|ing) to (my|the) note|knowledge base|what i (have )?saved)\b/i;

const MARKET_SNAPSHOT =
  /\b(latest news|crypto news|the news|headlines?|breaking news|current (crypto )?prices?|crypto prices?|cryptoprices?|latest prices?|price of|how much is|(btc|eth|bitcoin|ethereum|sol|solana)\s+price|market (news|update)|what'?s (the )?price|give me (the )?news|news today)\b/i;

const PRICE_INTENT =
  /\b(current (crypto )?prices?|crypto prices?|cryptoprices?|latest prices?|price of|how much is|(btc|eth|bitcoin|ethereum|sol|solana)\s+price|what'?s (the )?price)\b/i;

const NEWS_INTENT =
  /\b(latest news|crypto news|the news|headlines?|breaking news|give me (the )?news|news today|market news|market update)\b/i;

export const shouldOmitNotesRAG = (message) => typeof message === 'string' && Boolean(message.trim()) && !WANTS_NOTES_CONTEXT.test(message.trim()) && MARKET_SNAPSHOT.test(message.trim());

/** When market-only: fetch/include only the sections the user asked for (prices vs news vs both). */
export const getMarketSnapshotSections = (message) => {
  if (!message || typeof message !== 'string') return { includePrices: true, includeNews: true };
  const trimmedMessage = message.trim();
  const wantsPrices = PRICE_INTENT.test(trimmedMessage);
  const wantsNews = NEWS_INTENT.test(trimmedMessage);
  if (wantsPrices && !wantsNews) return { includePrices: true, includeNews: false };
  if (wantsNews && !wantsPrices) return { includePrices: false, includeNews: true };
  return { includePrices: true, includeNews: true };
};
