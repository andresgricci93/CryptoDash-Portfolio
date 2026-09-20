import { Readability } from '@mozilla/readability';
import axios from 'axios';
import { parseHTML } from 'linkedom';

const REQUEST_TIMEOUT = 15_000;
const MIN_PARTIAL_WORDS = 40;
const MIN_FULL_TEXT_WORDS = 120;
const MAX_BODY_CHARACTERS = 60_000;
const MAX_PARAGRAPHS = 80;
const SCRAPE_CONCURRENCY = 2;
const PAYWALL_PATTERN =
  /\b(subscribe|subscription|sign in to continue|register to continue|unlock this article|already a subscriber)\b/i;

const requestHeaders = {
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
  'User-Agent': 'CryptoDash/1.0 (+https://crypto-dash.xyz)'
};

const cleanParagraph = (value = '') => String(value)
  .replace(/\s+/g, ' ')
  .replace(/\s+([.,!?;:])/g, '$1')
  .trim();

const countWords = (paragraphs) => paragraphs
  .join(' ')
  .split(/\s+/)
  .filter(Boolean)
  .length;

const limitParagraphs = (paragraphs) => {
  const limited = [];
  let totalCharacters = 0;

  for (const paragraph of paragraphs) {
    if (limited.length >= MAX_PARAGRAPHS) break;
    const remainingCharacters = MAX_BODY_CHARACTERS - totalCharacters;
    if (remainingCharacters <= 0) break;

    const value = paragraph.slice(0, remainingCharacters);
    limited.push(value);
    totalCharacters += value.length;
  }

  return limited;
};

export const fetchArticleHtml = async (url) => {
  const response = await axios.get(url, {
    headers: requestHeaders,
    maxRedirects: 5,
    responseType: 'text',
    timeout: REQUEST_TIMEOUT
  });

  return response.data;
};

export const extractReadableArticle = (html, url) => {
  if (!html || typeof html !== 'string') {
    throw new Error('SCRAPE_EMPTY_HTML');
  }

  const { document } = parseHTML(html);
  const parsed = new Readability(document, {
    charThreshold: 200
  }).parse();

  if (!parsed?.textContent) {
    throw new Error('SCRAPE_EMPTY_CONTENT');
  }

  const contentDocument = parseHTML(`<article>${parsed.content || ''}</article>`).document;
  let paragraphs = [...contentDocument.querySelectorAll('p')]
    .map(node => cleanParagraph(node.textContent))
    .filter(paragraph => paragraph.length >= 20);

  if (paragraphs.length === 0) {
    paragraphs = parsed.textContent
      .split(/\n{2,}/)
      .map(cleanParagraph)
      .filter(paragraph => paragraph.length >= 20);
  }

  paragraphs = limitParagraphs(paragraphs);
  const wordCount = countWords(paragraphs);

  if (wordCount < MIN_PARTIAL_WORDS) {
    throw new Error('SCRAPE_CONTENT_TOO_SHORT');
  }

  const combinedText = paragraphs.join(' ');
  const paywallDetected = PAYWALL_PATTERN.test(combinedText);
  const pullQuote = cleanParagraph(
    contentDocument.querySelector('blockquote')?.textContent || ''
  ) || null;

  return {
    body: paragraphs,
    extractedTitle: cleanParagraph(parsed.title || ''),
    pullQuote,
    scrapeStatus: wordCount >= MIN_FULL_TEXT_WORDS && !paywallDetected
      ? 'success'
      : 'partial',
    sourceUrl: url,
    wordCount
  };
};

const getScrapeErrorCode = (error) => {
  const status = error.response?.status;
  if (status === 403 || status === 429) return `SCRAPE_BLOCKED_${status}`;
  if (error.code === 'ECONNABORTED') return 'SCRAPE_TIMEOUT';
  return String(error.message || 'SCRAPE_FAILED').slice(0, 300);
};

export const scrapeArticle = async (article, options = {}) => {
  const fetchHtml = options.fetchHtml || fetchArticleHtml;
  const scrapedAt = new Date().toISOString();

  try {
    const html = await fetchHtml(article.url);
    const extracted = extractReadableArticle(html, article.url);

    return {
      ...article,
      body: extracted.body,
      contentSource: 'full_text',
      pullQuote: extracted.pullQuote,
      scrapeError: null,
      scrapedAt,
      scrapeStatus: extracted.scrapeStatus,
      wordCount: extracted.wordCount
    };
  } catch (error) {
    const fallbackBody = article.summary ? [article.summary] : [];

    return {
      ...article,
      body: fallbackBody,
      contentSource: 'rss_summary',
      pullQuote: null,
      scrapeError: getScrapeErrorCode(error),
      scrapedAt,
      scrapeStatus: 'failed',
      wordCount: countWords(fallbackBody)
    };
  }
};

export const scrapeArticles = async (articles, concurrency = SCRAPE_CONCURRENCY) => {
  const results = new Array(articles.length);
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < articles.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await scrapeArticle(articles[currentIndex]);
    }
  };

  const workerCount = Math.min(Math.max(concurrency, 1), articles.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
};
