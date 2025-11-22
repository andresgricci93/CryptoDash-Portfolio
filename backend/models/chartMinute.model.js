import mongoose from 'mongoose';

const chartMinuteSchema = new mongoose.Schema({
  coinId: {
    type: String,
    required: true,
    index: true
  },
  
  date: {
    type: String, // Format: "YYYY-MM-DD"
    required: true
  },
  
  // Array of candlesticks: [timestamp, open, high, low, close, volume]
  data: {
    type: [[Number]], // Array of arrays of numbers
    required: true,
    validate: {
      validator: function(v) {
        // Maximum 1440 minutes in a day
        return v.length <= 1440;
      },
      message: 'Maximum 1440 minute candlesticks per day'
    }
  },
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  }
  
}, { 
  timestamps: true 
});

// Compound index for efficient queries
chartMinuteSchema.index({ coinId: 1, date: 1 }, { unique: true });

// TTL: Auto-delete after 2 days
chartMinuteSchema.index({ createdAt: 1 }, { expireAfterSeconds: 172800 }); // 2 days = 172800 seconds

export const ChartMinute = mongoose.model('ChartMinute', chartMinuteSchema);