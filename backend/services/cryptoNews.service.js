import { createHash } from 'node:crypto';
import Parser from 'rss-parser';

const NEWS_SOURCES = [
  {
    id: 'coindesk',
    name: 'CoinDesk',
    feedUrl: 'https://www.coindesk.com/arc/outboundfeeds/rss/'
  },
  {
    id: 'decrypt',
    name: 'Decrypt',
    feedUrl: 'https://decrypt.co/feed'
  },
  {
    id: 'cointelegraph',
    name: 'CoinTelegraph',
    feedUrl: 'https://cointelegraph.com/rss'
  }
];

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent']
    ]
  },
  headers: {
    'User-Agent': 'CryptoDash/1.0 (+https://crypto-dash.xyz)'
  },
  timeout: 12_000
});

const CACHE_TTL = 30 * 60 * 1000;
const ARTICLES_PER_SOURCE = 20;
const TRACKING_PARAMS = new Set([
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'ref',
  'source'
]);

let newsCache = {
  data: [],
  fetchedAt: null,
  sources: [],
  failedSources: []
};

const extractTextValue = (value) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(extractTextValue).filter(Boolean).join(' ');
  if (typeof value !== 'object') return '';

  return extractTextValue(
    value._ ??
    value['#text'] ??
    value.text ??
    value.value ??
    ''
  );
};

const decodeHtmlEntities = (value = '') => value
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replaceAll('&apos;', "'")
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .replaceAll('&nbsp;', ' ');

const cleanText = (value = '') => decodeHtmlEntities(
  extractTextValue(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim()
);

const normalizeCategories = (categories) => {
  const values = Array.isArray(categories) ? categories : [categories];
  return [...new Set(
    values
      .flatMap(category => extractTextValue(category).split(','))
      .map(category => cleanText(category))
      .filter(Boolean)
  )];
};

const getImageUrl = (item) => {
  const enclosureIsImage = typeof item.enclosure?.type === 'string' &&
    item.enclosure.type.startsWith('image/');
  const mediaContent = item.mediaContent || item['media:content'];
  const mediaThumbnail = item['media:thumbnail'];

  return (
    (enclosureIsImage ? item.enclosure.url : '') ||
    mediaContent?.url ||
    mediaContent?.$?.url ||
    mediaThumbnail?.url ||
    mediaThumbnail?.$?.url ||
    null
  );
};

/**
 * Canonicalize article links for navigation and URL-based deduplication.
 */
export const normalizeNewsUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  try {
    const parsed = new URL(url.trim());

    if (parsed.hostname.includes('cointelegraph.com')) {
      parsed.pathname = parsed.pathname.replaceAll('_', '-');
    }

    parsed.hash = '';
    [...parsed.searchParams.keys()].forEach((key) => {
      if (key.startsWith('utm_') || TRACKING_PARAMS.has(key)) {
        parsed.searchParams.delete(key);
      }
    });

    if (parsed.pathname.length > 1) {
      parsed.pathname = parsed.pathname.replace(/\/+$/, '');
    }

    return parsed.toString();
  } catch {
    return null;
  }
};

export const normalizeRssArticle = (item, source) => {
  const title = cleanText(item?.title);
  const url = normalizeNewsUrl(extractTextValue(item?.link || item?.guid));

  if (!title || !url) return null;

  const rawPublishedAt = extractTextValue(
    item.isoDate || item.pubDate || item.published || item.updated
  );
  const publishedDate = rawPublishedAt ? new Date(rawPublishedAt) : null;
  const publishedAt = publishedDate && !Number.isNaN(publishedDate.getTime())
    ? publishedDate.toISOString()
    : null;
  const summary = cleanText(
    item.contentSnippet ||
    item.summary ||
    item.description ||
    item.content ||
    title
  );
  const author = cleanText(
    item.creator ||
    item.author ||
    item['dc:creator'] ||
    ''
  ) || null;
  const id = createHash('sha256')
    .update(`${source.id}:${url}`)
    .digest('hex')
    .slice(0, 24);

  return {
    id,
    title,
    summary,
    source: source.name,
    sourceId: source.id,
    author,
    url,
    publishedAt,
    categories: normalizeCategories(item.categories),
    imageUrl: getImageUrl(item)
  };
};

const titleDeduplicationKey = (title) => cleanText(title)
  .toLocaleLowerCase('en-US')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();

const CRYPTO_RELEVANCE_PATTERN =
  /\b(bitcoin|btc|ethereum|ether|eth|crypto(?:currency|currencies)?|blockchain|tokeni[sz](?:e|ed|ation)|tokens?|stablecoins?|defi|decentralized finance|solana|sol|xrp|ripple|dogecoin|doge|cardano|ada|avalanche|avax|polkadot|dot|chainlink|link|litecoin|ltc|zcash|altcoins?|memecoins?|nfts?|web3|coinbase|binance|kraken|on-chain|digital assets?|spot etfs?|mining|miners?|wallets?)\b/i;

export const isCryptoRelevantArticle = (article) => {
  const searchableText = [
    article.title,
    article.summary,
    ...(article.categories || [])
  ].join(' ');

  return CRYPTO_RELEVANCE_PATTERN.test(searchableText);
};

export const deduplicateNewsArticles = (articles) => {
  const seenUrls = new Set();
  const seenTitles = new Set();

  return articles.filter((article) => {
    const titleKey = titleDeduplicationKey(article.title);
    if (seenUrls.has(article.url) || seenTitles.has(titleKey)) return false;

    seenUrls.add(article.url);
    seenTitles.add(titleKey);
    return true;
  });
};

const fetchSource = async (source) => {
  const feed = await parser.parseURL(source.feedUrl);
  if (!feed?.items?.length) return [];

  return feed.items
    .slice(0, ARTICLES_PER_SOURCE)
    .map(item => normalizeRssArticle(item, source))
    .filter(article => article && isCryptoRelevantArticle(article));
};

export const fetchFreshNews = async () => {
  const results = await Promise.allSettled(
    NEWS_SOURCES.map(async (source) => ({
      source,
      articles: await fetchSource(source)
    }))
  );
  const articles = [];
  const sources = [];
  const failedSources = [];

  results.forEach((result, index) => {
    const source = NEWS_SOURCES[index];
    if (result.status === 'fulfilled') {
      articles.push(...result.value.articles);
      sources.push(source.name);
      return;
    }

    failedSources.push(source.name);
    console.warn(`[News] ${source.name} RSS fetch failed:`, result.reason?.message || result.reason);
  });

  const sortedArticles = articles.toSorted((left, right) => {
    const leftTime = left.publishedAt ? Date.parse(left.publishedAt) : 0;
    const rightTime = right.publishedAt ? Date.parse(right.publishedAt) : 0;
    return rightTime - leftTime;
  });

  return {
    items: deduplicateNewsArticles(sortedArticles),
    sources,
    failedSources
  };
};

const createNewsResponse = (items, limit, options = {}) => ({
  items: items.slice(0, limit),
  isCached: options.isCached ?? false,
  cachedAt: options.cachedAt ?? null,
  sources: options.sources ?? [],
  failedSources: options.failedSources ?? []
});

export const getLatestCryptoNews = async (limit = 5) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 50);
  const cacheIsValid = newsCache.data.length > 0 &&
    (Date.now() - newsCache.fetchedAt) < CACHE_TTL;

  if (cacheIsValid) {
    return createNewsResponse(newsCache.data, safeLimit, {
      isCached: true,
      cachedAt: newsCache.fetchedAt,
      sources: newsCache.sources,
      failedSources: newsCache.failedSources
    });
  }

  try {
    const fresh = await fetchFreshNews();
    if (fresh.items.length > 0) {
      const fetchedAt = Date.now();
      newsCache = {
        data: fresh.items,
        fetchedAt,
        sources: fresh.sources,
        failedSources: fresh.failedSources
      };

      return createNewsResponse(fresh.items, safeLimit, {
        cachedAt: fetchedAt,
        sources: fresh.sources,
        failedSources: fresh.failedSources
      });
    }
  } catch (error) {
    console.error('[News] RSS aggregation failed:', error.message);
  }

  if (newsCache.data.length > 0) {
    return createNewsResponse(newsCache.data, safeLimit, {
      isCached: true,
      cachedAt: newsCache.fetchedAt,
      sources: newsCache.sources,
      failedSources: newsCache.failedSources
    });
  }

  return createNewsResponse([], safeLimit, {
    failedSources: NEWS_SOURCES.map(source => source.name)
  });
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
    const date = item.publishedAt
      ? new Date(item.publishedAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
      })
      : 'Unknown date';

    const snippet = item.summary || 'No description available';

    return `
${index + 1}. ${item.title}
   Source: ${item.source} | Published: ${date}
   Content: ${snippet}
   URL: ${item.url}
`.trim();
  }).join('\n\n');
};
