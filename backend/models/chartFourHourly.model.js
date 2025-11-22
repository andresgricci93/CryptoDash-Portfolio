import mongoose from 'mongoose';

const chartFourHourlySchema = new mongoose.Schema({
  coinId: {
    type: String,
    required: true,
    index: true
  },
  
  timestamp: {
    type: Number, // Unix timestamp in milliseconds
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
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  }
  
}, { 
  timestamps: true 
});

// Compound index for efficient queries and uniqueness
chartFourHourlySchema.index({ coinId: 1, timestamp: 1 }, { unique: true });

// Index for time-based queries
chartFourHourlySchema.index({ timestamp: -1 });

// TTL: Auto-delete after 30 days
chartFourHourlySchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

export const ChartFourHourly = mongoose.model('ChartFourHourly', chartFourHourlySchema);