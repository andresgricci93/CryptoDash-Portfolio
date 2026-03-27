/**
 * Parse Google RetryInfo.retryDelay (e.g. "38s", "4s") to milliseconds.
 * Adds buffer because the suggested delay is often too short for quota windows.
 */
export const parseRetryDelayMs = (retryDelay, { minMs = 8000, maxMs = 120_000, bufferMs = 5000 } = {}) => {
  if (retryDelay == null) return minMs + bufferMs;
  const delayString = String(retryDelay).trim();
  const durationMatch = delayString.match(/^(\d+(?:\.\d+)?)s$/i);
  const parsed = durationMatch ? parseFloat(durationMatch[1]) * 1000 : minMs;
  const clamped = Math.min(Math.max(parsed, minMs), maxMs);
  return clamped + bufferMs;
};
