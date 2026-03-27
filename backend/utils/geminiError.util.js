/**
 * Normalize Google Generative AI errors (e.g. 429 + RetryInfo) for API responses.
 */
export const formatGeminiChatErrorPayload = (error) => {
  const status = error?.status ?? error?.statusCode ?? 500;
  let retryDelay = null;

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

  return {
    status,
    retryDelay,
    message: error?.message || 'Error generating chat response',
    code: status === 429 ? 'RATE_LIMIT' : 'GEMINI_ERROR'
  };
};

export const httpStatusFromGeminiPayload = (payload) => {
  const httpStatus = payload?.status;
  if (typeof httpStatus === 'number' && httpStatus >= 400 && httpStatus < 600) return httpStatus;
  return 500;
};
