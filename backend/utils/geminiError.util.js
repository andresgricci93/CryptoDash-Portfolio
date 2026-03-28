/**
 * Normalize LLM provider errors (Gemini, Groq, etc.) into a consistent
 * payload for the frontend: { status, retryDelay, message, code }.
 */
export const formatGeminiChatErrorPayload = (error) => {
  const status = error?.status ?? error?.statusCode ?? error?.status_code ?? 500;
  let retryDelay = null;

  // Gemini: RetryInfo in protobuf errorDetails
  const errorDetails = error?.errorDetails;
  if (Array.isArray(errorDetails)) {
    for (const detail of errorDetails) {
      const protobufTypeUri = detail?.['@type'] || '';
      if (protobufTypeUri.includes('RetryInfo') && detail.retryDelay != null) {
        retryDelay = typeof detail.retryDelay === 'string' ? detail.retryDelay : String(detail.retryDelay);
        break;
      }
    }
  }

  // Groq / OpenAI-style: nested error.error.type / error.error.message
  const nestedError = error?.error;
  const isGroqRateLimit = nestedError?.type === 'tokens' || nestedError?.code === 'rate_limit_exceeded';
  const rawMessage = nestedError?.message || error?.message || '';

  const isRateLimit = status === 429 || status === 413 || isGroqRateLimit
    || rawMessage.includes('rate_limit') || rawMessage.includes('Too Many Requests');

  const userMessage = isRateLimit
    ? 'The AI service is temporarily overloaded. Please wait a moment and try again.'
    : rawMessage || 'Error generating chat response';

  return {
    status,
    retryDelay,
    message: userMessage,
    code: isRateLimit ? 'RATE_LIMIT' : 'AI_ERROR'
  };
};

export const httpStatusFromGeminiPayload = (payload) => {
  const httpStatus = payload?.status;
  if (typeof httpStatus === 'number' && httpStatus >= 400 && httpStatus < 600) return httpStatus;
  return 500;
};
