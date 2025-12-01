const CurrencyDropdownFavorites = ({ value, onChange, currencies }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className="p-2 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-white focus:outline-none"
    >
      {currencies.map(currency => (
        <option key={currency.code} value={currency.code}>
          {currency.symbol} {currency.code}
        </option>
      ))}
    </select>
  );
};

export default CurrencyDropdownFavorites;