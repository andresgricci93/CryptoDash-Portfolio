import mongoose from 'mongoose';

const chartHourlySchema = new mongoose.Schema({
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
chartHourlySchema.index({ coinId: 1, timestamp: 1 }, { unique: true });

// Index for time-based queries
chartHourlySchema.index({ timestamp: -1 });

// TTL: Auto-delete after 7 days
chartHourlySchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // 7 days = 604800 seconds

export const ChartHourly = mongoose.model('ChartHourly', chartHourlySchema);