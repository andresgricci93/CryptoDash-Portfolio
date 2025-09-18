import mongoose from 'mongoose';

const currencySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true,
    default: 1 // USD base rate
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const Currency = mongoose.model('Currency', currencySchema);