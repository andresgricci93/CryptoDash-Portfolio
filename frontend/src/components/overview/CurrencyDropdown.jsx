import { useCurrencyStore } from '../../store/currencyStore';



const CurrencyDropdown = () => {
  const { 
    selectedCurrency, 
    availableCurrencies, 
    setSelectedCurrency,
    fetchRatesIfNeeded 
  } = useCurrencyStore();

  const handleCurrencyChange = async (e) => {
    console.log('Dropdown change detected:', e.target.value);
    setSelectedCurrency(e.target.value);
    console.log('About to call fetchRatesIfNeeded...');
    await fetchRatesIfNeeded();
    console.log('fetchRatesIfNeeded completed');
  };

  

  return (
    <select 
      value={selectedCurrency}
      onChange={handleCurrencyChange}
      className="bg-gray-700 text-white px-3 py-3 text-base rounded border border-gray-600 focus:border-green-500"
    >
      {availableCurrencies.map(currency => (
        <option key={currency.code} value={currency.code}>
          {currency.symbol} {currency.code}
        </option>
      ))}
    </select>
  );
};

export default CurrencyDropdown;