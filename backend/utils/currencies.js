
export const getCurrencyName = (code) => {
  const names = {
    'USD': 'US Dollar', 'EUR': 'Euro', 'GBP': 'British Pound', 'JPY': 'Japanese Yen',
    'CAD': 'Canadian Dollar', 'AUD': 'Australian Dollar', 'CHF': 'Swiss Franc', 'CNY': 'Chinese Yuan',
    'INR': 'Indian Rupee', 'BRL': 'Brazilian Real', 'RUB': 'Russian Ruble', 'KRW': 'South Korean Won',
    'MXN': 'Mexican Peso', 'SGD': 'Singapore Dollar', 'HKD': 'Hong Kong Dollar', 'NOK': 'Norwegian Krone',
    'SEK': 'Swedish Krona', 'DKK': 'Danish Krone', 'PLN': 'Polish Zloty', 'TRY': 'Turkish Lira',
    'ZAR': 'South African Rand', 'THB': 'Thai Baht', 'CZK': 'Czech Koruna', 'ILS': 'Israeli Shekel',
    'ARS': 'Argentine Peso'
  };
  return names[code] || code;
};

const SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
  RUB: '₽',
  KRW: '₩',
  MXN: '$',
  SGD: 'S$',
  HKD: 'HK$',
  NOK: 'kr',
  SEK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  TRY: '₺',
  ZAR: 'R',
  THB: '฿',
  CZK: 'Kč',
  ILS: '₪',
  ARS: '$',
};

/** Dashboard dropdown + chat `preferredCurrencyChat` (must match Currency collection / rates API). */
export const SUPPORTED_FIAT_CODES = new Set(Object.keys(SYMBOLS));

export const getCurrencySymbol = (code) => {
  if (!code) return '$';
  const upper = String(code).toUpperCase();
  return SYMBOLS[upper] || code;
};
