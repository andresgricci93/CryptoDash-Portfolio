import { describe, expect, it } from 'vitest';
import {
  extractReadableArticle,
  scrapeArticle
} from './articleScraper.service.js';

const article = {
  id: 'article-1',
  title: 'Bitcoin market update',
  summary: 'Bitcoin moved higher during the latest trading session.',
  source: 'Example',
  sourceId: 'example',
  url: 'https://example.com/bitcoin'
};

describe('articleScraper', () => {
  it('extracts readable paragraphs from article HTML', () => {
    const paragraph = 'Bitcoin markets moved higher as institutional demand increased and traders reacted to the latest liquidity data across global exchanges. ';
    const html = `
      <html>
        <head><title>Bitcoin market update</title></head>
        <body>
          <article>
            <h1>Bitcoin market update</h1>
            <p>${paragraph.repeat(5)}</p>
            <p>${paragraph.repeat(5)}</p>
            <blockquote>Liquidity remains the primary market driver.</blockquote>
          </article>
        </body>
      </html>
    `;

    const result = extractReadableArticle(html, article.url);

    expect(result.body).toHaveLength(2);
    expect(result.wordCount).toBeGreaterThan(120);
    expect(result.scrapeStatus).toBe('success');
    expect(result.pullQuote).toBe('Liquidity remains the primary market driver.');
  });

  it('falls back to the RSS summary when downloading fails', async () => {
    const result = await scrapeArticle(article, {
      fetchHtml: async () => {
        throw new Error('network unavailable');
      }
    });

    expect(result.body).toEqual([article.summary]);
    expect(result.contentSource).toBe('rss_summary');
    expect(result.scrapeStatus).toBe('failed');
    expect(result.scrapeError).toBe('network unavailable');
    expect(result.source).toBe(article.source);
    expect(result.sourceId).toBe(article.sourceId);
    expect(result.url).toBe(article.url);
  });
});
