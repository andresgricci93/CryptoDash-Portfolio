import { describe, expect, it } from 'vitest';
import {
  deduplicateNewsArticles,
  isCryptoRelevantArticle,
  normalizeNewsUrl,
  normalizeRssArticle
} from './cryptoNews.service.js';

const source = {
  id: 'example',
  name: 'Example News'
};

describe('cryptoNews normalization', () => {
  it('normalizes different RSS fields into the common article schema', () => {
    const article = normalizeRssArticle({
      title: '  Bitcoin &amp; Ethereum rally  ',
      link: 'https://example.com/story/?utm_source=rss#latest',
      content: '<p>Markets <strong>moved higher</strong>.</p>',
      creator: 'Jane Doe',
      pubDate: '2026-09-20T12:00:00Z',
      categories: ['Markets', ' Bitcoin '],
      enclosure: {
        type: 'image/jpeg',
        url: 'https://example.com/story.jpg'
      }
    }, source);

    expect(article).toMatchObject({
      title: 'Bitcoin & Ethereum rally',
      summary: 'Markets moved higher.',
      source: 'Example News',
      sourceId: 'example',
      author: 'Jane Doe',
      url: 'https://example.com/story',
      publishedAt: '2026-09-20T12:00:00.000Z',
      categories: ['Markets', 'Bitcoin'],
      imageUrl: 'https://example.com/story.jpg'
    });
    expect(article.id).toHaveLength(24);
  });

  it('rejects entries without a title or valid URL', () => {
    expect(normalizeRssArticle({ title: 'No link' }, source)).toBeNull();
    expect(normalizeRssArticle({ link: 'not-a-url' }, source)).toBeNull();
  });

  it('canonicalizes CoinTelegraph links and removes tracking parameters', () => {
    expect(normalizeNewsUrl(
      'https://cointelegraph.com/news/bitcoin_market/?utm_medium=rss&ref=home'
    )).toBe('https://cointelegraph.com/news/bitcoin-market');
  });

  it('deduplicates articles by canonical URL and normalized title', () => {
    const articles = [
      { id: '1', title: 'Bitcoin reaches a new high', url: 'https://example.com/1' },
      { id: '2', title: 'BITCOIN: reaches a new high!', url: 'https://example.com/2' },
      { id: '3', title: 'Ethereum update', url: 'https://example.com/1' },
      { id: '4', title: 'Solana update', url: 'https://example.com/4' }
    ];

    expect(deduplicateNewsArticles(articles).map(article => article.id)).toEqual(['1', '4']);
  });

  it('keeps crypto stories and rejects unrelated AI coverage', () => {
    expect(isCryptoRelevantArticle({
      title: 'Grayscale Zcash ETF files for a share split',
      summary: '',
      categories: []
    })).toBe(true);
    expect(isCryptoRelevantArticle({
      title: 'Anthropic taps Accenture as embedded evaluator',
      summary: 'The partnership focuses on enterprise AI deployments.',
      categories: ['Artificial Intelligence']
    })).toBe(false);
  });
});
