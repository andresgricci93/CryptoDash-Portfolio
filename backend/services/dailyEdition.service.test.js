import { describe, expect, it, vi } from 'vitest';
import {
  createDailyEditionIfMissing,
  getDailyEditionDate
} from './dailyEdition.service.js';

const normalizedArticle = {
  id: 'article-1',
  title: 'Bitcoin update',
  summary: 'Bitcoin market summary',
  source: 'Example',
  sourceId: 'example',
  author: 'Reporter',
  url: 'https://example.com/bitcoin',
  publishedAt: '2026-09-20T20:00:00.000Z',
  categories: ['Markets'],
  imageUrl: null
};

describe('dailyEdition service', () => {
  it('calculates edition dates in Europe/Rome', () => {
    expect(getDailyEditionDate(new Date('2026-09-20T21:59:59.000Z')))
      .toBe('2026-09-20');
    expect(getDailyEditionDate(new Date('2026-09-20T22:00:00.000Z')))
      .toBe('2026-09-21');
  });

  it('creates at most one edition for a date', async () => {
    let storedEdition = null;
    const EditionModel = {
      create: vi.fn(async data => {
        storedEdition = data;
        return data;
      }),
      findOne: vi.fn(async () => storedEdition)
    };
    const fetchNews = vi.fn(async () => ({
      failedSources: [],
      items: [normalizedArticle],
      sources: ['Example']
    }));
    const scrape = vi.fn(async articles => articles.map(article => ({
      ...article,
      body: ['Full article text'],
      contentSource: 'full_text',
      scrapeStatus: 'success',
      wordCount: 3
    })));
    const date = new Date('2026-09-20T10:00:00.000Z');

    const first = await createDailyEditionIfMissing({
      date,
      EditionModel,
      fetchNews,
      scrape
    });
    const second = await createDailyEditionIfMissing({
      date,
      EditionModel,
      fetchNews,
      scrape
    });

    expect(first.created).toBe(true);
    expect(first.edition.editionDate).toBe('2026-09-20');
    expect(first.edition.articles[0].position).toBe(1);
    expect(first.edition.stats.fullTextCount).toBe(1);
    expect(second.created).toBe(false);
    expect(fetchNews).toHaveBeenCalledTimes(1);
    expect(EditionModel.create).toHaveBeenCalledTimes(1);
  });
});
