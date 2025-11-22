import mongoose from 'mongoose';

const chartDailySchema = new mongoose.Schema({
  coinId: {
    type: String,
    required: true,
    index: true
  },
  
  date: {
    type: String, // Format: "YYYY-MM-DD"
    required: true
  },
  
  // OHLCV data
  open: {
    type: Number,
    required: true
  },
  high: {
    type: Number,
    required: true
  },
  low: {
    type: Number,
    required: true
  },
  close: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    required: true
  },
  
  // Market data
  market_cap: Number,
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  }
  
}, { 
  timestamps: true 
});

// Compound index for efficient queries and uniqueness
chartDailySchema.index({ coinId: 1, date: 1 }, { unique: true });

// Index for date-based queries
chartDailySchema.index({ date: -1 });

// Index for specific coin historical queries
chartDailySchema.index({ coinId: 1, date: -1 });

// NO TTL - This is permanent historical data

export const ChartDaily = mongoose.model('ChartDaily', chartDailySchema);