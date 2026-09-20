import mongoose from 'mongoose';

const dailyEditionArticleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  title: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  sourceId: {
    type: String,
    required: true
  },
  author: {
    type: String,
    default: null
  },
  url: {
    type: String,
    required: true
  },
  publishedAt: {
    type: Date,
    default: null
  },
  categories: {
    type: [String],
    default: []
  },
  imageUrl: {
    type: String,
    default: null
  },
  body: {
    type: [String],
    default: []
  },
  pullQuote: {
    type: String,
    default: null
  },
  wordCount: {
    type: Number,
    default: 0
  },
  scrapedAt: {
    type: Date,
    default: null
  },
  contentSource: {
    type: String,
    enum: ['full_text', 'rss_summary'],
    default: 'rss_summary'
  },
  scrapeStatus: {
    type: String,
    enum: ['success', 'partial', 'failed'],
    default: 'failed'
  },
  scrapeError: {
    type: String,
    default: null
  }
}, {
  _id: false
});

const dailyEditionSchema = new mongoose.Schema({
  editionDate: {
    type: String,
    required: true
  },
  compiledAt: {
    type: Date,
    default: Date.now
  },
  articles: {
    type: [dailyEditionArticleSchema],
    required: true,
    validate: {
      validator: articles => articles.length >= 1 && articles.length <= 10,
      message: 'Daily edition must contain between 1 and 10 articles'
    }
  },
  sources: {
    type: [String],
    default: []
  },
  failedSources: {
    type: [String],
    default: []
  },
  stats: {
    targetArticles: {
      type: Number,
      default: 10
    },
    totalArticles: {
      type: Number,
      required: true
    },
    fullTextCount: {
      type: Number,
      default: 0
    },
    rssFallbackCount: {
      type: Number,
      default: 0
    },
    failedScrapes: {
      type: [String],
      default: []
    }
  }
}, {
  timestamps: true
});

dailyEditionSchema.index({ editionDate: 1 }, { unique: true });
dailyEditionSchema.index({ editionDate: -1 });

export const DailyEdition = mongoose.model('DailyEdition', dailyEditionSchema);
