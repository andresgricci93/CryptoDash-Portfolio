export const newsQueryKey = ['news', 'edition', 'latest'];

export const fetchNews = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/news/editions/latest`
  );
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || 'Failed to fetch crypto news');
  }

  return {
    edition: payload.data,
    meta: payload.meta || {}
  };
};
