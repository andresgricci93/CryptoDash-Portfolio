import {create} from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const AVAILABLE_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' }
];

export const useCurrencyStore = create((set,get) => ({



    

    availableCurrencies: AVAILABLE_CURRENCIES,
    currencyRates: null,
    selectedCurrency: 'USD',
    ratesLoaded:false,


    loadUserCurrency: async () => {
        try {
        const response = await axios.get(`${API_URL}/auth/check-auth`);
        if (response.data.user?.preferredCurrency) {
            set({ selectedCurrency: response.data.user.preferredCurrency });
            console.log('Loaded user currency:', response.data.user.preferredCurrency);
        }
        } catch (error) {
        console.log('No user currency preference found');
        }
   },

    setSelectedCurrency: async (code) => {

    set({ selectedCurrency: code });
    
        try {
           
            const response = await axios.put(`${API_URL}/profile/update-currency`, { 
            preferredCurrency: code 
            });
            console.log(' Server response:', response.data);
        } catch (error) {
            console.error(' Error saving currency:', error.response?.data || error.message);
        }
    },
    fetchRatesIfNeeded: async () => {
        console.log('fetchRatesIfNeeded called');
        
        const { ratesLoaded, currencyRates } = get();
        
        // Solo skip si YA están cargadas Y hay data
        if (ratesLoaded && currencyRates && currencyRates.length > 0) {
            return;
        }

        try {
  
            const response = await axios.get(`${API_URL}/currencies`);
            console.log(' Rates response:', response.data);
            
            set({
                currencyRates: response.data.currencies,
                ratesLoaded: true
            });
            
            console.log(' Rates loaded successfully');
        } catch (error) {
            console.error(" Error fetching rates:", error);
        }
    },
    convertPrice: (usdPrice) => {
        const { selectedCurrency, currencyRates } = get();
        
        if (selectedCurrency === 'USD') return usdPrice;
        
        const rate = currencyRates?.find(r => r.code === selectedCurrency)?.rate;
        return rate ? usdPrice * rate : usdPrice;
    },
    formatPrice: (usdPrice) => {
        const convertedPrice = get().convertPrice(usdPrice);
        const { selectedCurrency } = get();
        
        return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: selectedCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
        }).format(convertedPrice);
    },

}));

const store = useCurrencyStore.getState();
console.log('Selected currency:', store.selectedCurrency);
console.log('Currency rates:', store.currencyRates);
console.log('Rates loaded:', store.ratesLoaded);
