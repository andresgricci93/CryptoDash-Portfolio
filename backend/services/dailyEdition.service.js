import { DailyEdition } from '../models/dailyEdition.model.js';
import { scrapeArticles } from './articleScraper.service.js';
import { fetchFreshNews } from './cryptoNews.service.js';

export const DAILY_EDITION_TIME_ZONE = 'Europe/Rome';
export const DAILY_EDITION_ARTICLE_LIMIT = 10;

const editionDateFormatter = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit',
  month: '2-digit',
  timeZone: DAILY_EDITION_TIME_ZONE,
  year: 'numeric'
});

export const getDailyEditionDate = (date = new Date()) => {
  const parts = Object.fromEntries(
    editionDateFormatter
      .formatToParts(date)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
};

const buildEditionStats = (articles) => ({
  targetArticles: DAILY_EDITION_ARTICLE_LIMIT,
  totalArticles: articles.length,
  fullTextCount: articles.filter(article => article.contentSource === 'full_text').length,
  rssFallbackCount: articles.filter(article => article.contentSource === 'rss_summary').length,
  failedScrapes: articles
    .filter(article => article.scrapeStatus === 'failed')
    .map(article => article.id)
});

export const createDailyEditionIfMissing = async (options = {}) => {
  const date = options.date || new Date();
  const editionDate = getDailyEditionDate(date);
  const EditionModel = options.EditionModel || DailyEdition;
  const fetchNews = options.fetchNews || fetchFreshNews;
  const scrape = options.scrape || scrapeArticles;

  const existingEdition = await EditionModel.findOne({ editionDate });
  if (existingEdition) {
    return {
      created: false,
      edition: existingEdition
    };
  }

  const freshNews = await fetchNews();
  const selectedArticles = freshNews.items.slice(0, DAILY_EDITION_ARTICLE_LIMIT);

  if (selectedArticles.length === 0) {
    throw new Error('Cannot create a daily edition without news articles');
  }

  const scrapedArticles = await scrape(selectedArticles);
  const articles = scrapedArticles.map((article, index) => ({
    ...article,
    position: index + 1
  }));
  const editionData = {
    articles,
    compiledAt: new Date(),
    editionDate,
    failedSources: freshNews.failedSources,
    sources: freshNews.sources,
    stats: buildEditionStats(articles)
  };

  try {
    const edition = await EditionModel.create(editionData);
    return {
      created: true,
      edition
    };
  } catch (error) {
    if (error?.code === 11000) {
      const concurrentEdition = await EditionModel.findOne({ editionDate });
      return {
        created: false,
        edition: concurrentEdition
      };
    }

    throw error;
  }
};

export const getLatestDailyEdition = async () => DailyEdition
  .findOne()
  .sort({ editionDate: -1 })
  .lean();
