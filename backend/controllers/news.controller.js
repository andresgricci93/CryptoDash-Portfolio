import { getLatestCryptoNews } from '../services/cryptoNews.service.js';
import {
  DAILY_EDITION_TIME_ZONE,
  getDailyEditionDate,
  getLatestDailyEdition
} from '../services/dailyEdition.service.js';

export const getNews = async (req, res) => {
  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isNaN(requestedLimit)
    ? 10
    : Math.min(Math.max(requestedLimit, 1), 50);

  try {
    const {
      items,
      isCached,
      cachedAt,
      sources,
      failedSources
    } = await getLatestCryptoNews(limit);

    res.json({
      success: true,
      data: items,
      meta: {
        count: items.length,
        isCached,
        cachedAt: cachedAt ? new Date(cachedAt).toISOString() : null,
        sources,
        failedSources
      }
    });
  } catch (error) {
    console.error('[News] Request failed:', error.message);
    res.status(502).json({
      success: false,
      message: 'Unable to fetch crypto news'
    });
  }
};

export const getLatestEdition = async (req, res) => {
  try {
    const edition = await getLatestDailyEdition();

    if (!edition) {
      return res.status(404).json({
        success: false,
        code: 'NO_EDITION',
        message: 'No daily edition is available yet'
      });
    }

    res.json({
      success: true,
      data: edition,
      meta: {
        count: edition.articles.length,
        isStale: edition.editionDate !== getDailyEditionDate(),
        timeZone: DAILY_EDITION_TIME_ZONE
      }
    });
  } catch (error) {
    console.error('[News] Daily edition request failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch the latest daily edition'
    });
  }
};
