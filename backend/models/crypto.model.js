import mongoose from 'mongoose';

const cryptoSchema = new mongoose.Schema({
    coinId: {
        type: String,
        required: true,
        unique:true
    },
    name: String,
    symbol: String,
    current_price: Number,
    market_cap:Number,
    price_change_percentage_24h: Number,
    image: String,
    high_24h: Number,
    low_24h: Number,
    ath: Number,
    ath_date: Date,
    atl: Number,
    atl_date: Date,
    circulating_supply: Number,
    total_supply: Number,
    max_supply: Number,
    total_volume: Number,
    lastUpdated: {
        type: Date,
        default: Date.now
    }
},{ timestamps:true });


export const Crypto = mongoose.model('Crypto', cryptoSchema);