import mongoose from 'mongoose';

const cryptoStaticSchema = new mongoose.Schema({
  coinId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  symbol: String,
  description: {
    en: String,
    es: String
  },
  links: {
    homepage: [String],
    whitepaper: String,
    blockchain_site: [String],
    official_forum_url: [String],
    twitter_screen_name: String,
    facebook_username: String,
    subreddit_url: String,
    telegram_channel_identifier: String,
    repos_url: {
      github: [String],
      bitbucket: [String]
    }
  },
  image: {
    thumb: String,
    small: String,
    large: String
  },
  metadata: {
    genesis_date: String,
    hashing_algorithm: String,
    block_time_in_minutes: Number,
    categories: [String],
    country_origin: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const CryptoStatic = mongoose.model('CryptoStatic', cryptoStaticSchema);

