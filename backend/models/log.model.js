import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['error', 'warn', 'info', 'debug']
  },
  message: {
    type: String,
    required: true
  },
  service: {
    type: String,
    default: 'crypto-dashboard'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  stack: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Index for faster queries
  }
}, { 
  timestamps: true,
  // TTL index - auto delete logs older than 30 days
  expireAfterSeconds: 2592000 // 30 days in seconds
});

// Index for common queries
logSchema.index({ level: 1, timestamp: -1 });
logSchema.index({ service: 1, timestamp: -1 });

export const Log = mongoose.model('Log', logSchema);