import { Currency } from '../models/currency.model.js';
import { getCurrencyName, getCurrencySymbol } from '../utils/currencies.js';

import cron from 'node-cron';

export const updateCurrencyRates = async () => {
  try {
    console.log('Fetching currency rates...');
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    // Supported currencies
    const supportedCurrencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL', 
    'RUB', 'KRW', 'MXN', 'SGD', 'HKD', 'NOK', 'SEK', 'DKK', 'PLN', 'TRY',
    'ZAR', 'THB', 'CZK', 'ILS', 'ARS'
    ];
    
    for (const currencyCode of supportedCurrencies) {
      const rate = currencyCode === 'USD' ? 1 : data.rates[currencyCode];
      
      await Currency.findOneAndUpdate(
        { code: currencyCode },
        { 
          code: currencyCode,
          name: getCurrencyName(currencyCode),
          symbol: getCurrencySymbol(currencyCode),
          rate: rate,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    }
    
    console.log('Currency rates updated successfully');
  } catch (error) {
    console.error('Error updating currency rates:', error);
  }
};


export const getAllCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.find().sort({ code: 1 });
    res.status(200).json({
      success: true,
      currencies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Setup cron job - every hour
cron.schedule('0 * * * *', updateCurrencyRates);