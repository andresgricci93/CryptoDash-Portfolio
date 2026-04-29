import Parser from 'rss-parser';

const parser = new Parser();
const RSS_URL = 'https://cointelegraph.com/rss';

let newsCache = { data: [], fetchedAt: null };
const CACHE_TTL = 30 * 60 * 1000;

const fetchFreshNews = async (limit) => {
  const feed = await parser.parseURL(RSS_URL);

  if (!feed?.items?.length) return [];

  return feed.items.slice(0, limit).map(item => ({
    title: item.title,
    source: 'CoinTelegraph',
    url: item.link,
    body: item.contentSnippet || item.title,
    published: Math.floor(new Date(item.pubDate).getTime() / 1000),
    categories: item.categories?.join(', ') || ''
  }));
};

export const getLatestCryptoNews = async (limit = 5) => {
  const cacheIsValid = newsCache.data.length > 0 &&
    (Date.now() - newsCache.fetchedAt) < CACHE_TTL;

  if (cacheIsValid) {
    return { items: newsCache.data.slice(0, limit), isCached: true, cachedAt: newsCache.fetchedAt };
  }

  try {
    const fresh = await fetchFreshNews(limit);
    if (fresh.length > 0) {
      newsCache = { data: fresh, fetchedAt: Date.now() };
      return { items: fresh, isCached: false, cachedAt: Date.now() };
    }
  } catch (error) {
    console.error('[News] RSS fetch failed:', error.message);
  }

  if (newsCache.data.length > 0) {
    return { items: newsCache.data.slice(0, limit), isCached: true, cachedAt: newsCache.fetchedAt };
  }

  return { items: [], isCached: false, cachedAt: null };
};

export const formatNewsForPrompt = (newsItems) => {
  if (newsItems == null) return '';

  // Reject the wrapper object returned by getLatestCryptoNews so callers see a
  // precise error instead of a vague "newsItems.map is not a function".
  if (!Array.isArray(newsItems)) {
    const receivedType = typeof newsItems;
    const keys = receivedType === 'object' ? Object.keys(newsItems) : null;
    const looksLikeWrapper = Array.isArray(keys) && keys.includes('items');

    const err = new TypeError(
      `formatNewsForPrompt expected an array of news items but received ${receivedType}` +
      (keys ? ` with keys [${keys.join(', ')}]` : '') +
      (looksLikeWrapper
        ? '. Hint: getLatestCryptoNews() returns { items, isCached, cachedAt }; pass news.items instead of news.'
        : '')
    );
    err.code = 'INVALID_NEWS_ITEMS';
    err.received = { type: receivedType, keys };
    throw err;
  }

  if (newsItems.length === 0) return '';

  return newsItems.map((item, index) => {
    const date = new Date(item.published * 1000).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const snippet = item.body || 'No description available';

    return `
${index + 1}. ${item.title}
   Source: ${item.source} | Published: ${date}
   Content: ${snippet}
   URL: ${item.url}
`.trim();
  }).join('\n\n');
};
