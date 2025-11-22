import mongoose from 'mongoose';

const cryptoDynamicSchema = new mongoose.Schema({
  coinId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // === DATA OF /coins/markets (updated every 2 min) ===

  current_price: {
    type: Number,
    required: true
  },
  market_cap: Number,
  market_cap_rank: Number,
  fully_diluted_valuation: Number,
  total_volume: Number,
  high_24h: Number,
  low_24h: Number,
  price_change_24h: Number,
  price_change_percentage_24h: Number,
  market_cap_change_24h: Number,
  market_cap_change_percentage_24h: Number,
  circulating_supply: Number,
  
  // === DATA OF /coins/{id} (updated every 30 min - top 50) ===

  total_supply: Number,
  max_supply: Number,
  max_supply_infinite: Boolean,
  
  ath: Number,
  ath_date: Date,
  ath_change_percentage: Number,
  
  atl: Number,
  atl_date: Date,
  atl_change_percentage: Number,
  
  price_change_percentage_7d: Number,
  price_change_percentage_14d: Number,
  price_change_percentage_30d: Number,
  price_change_percentage_60d: Number,
  price_change_percentage_200d: Number,
  price_change_percentage_1y: Number,
  
  // === METADATA ===
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastDetailedUpdate: Date  
  
}, { 
  timestamps: true 
});

export const CryptoDynamic = mongoose.model('CryptoDynamic', cryptoDynamicSchema);