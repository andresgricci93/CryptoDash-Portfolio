import {TOP_CRYPTOS} from "../../utils/constants.js"

const CryptoDropdown = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-48 p-2 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-white focus:outline-none"
    >
      <option value="">Select crypto</option>
      {TOP_CRYPTOS.map(crypto => (
        <option key={crypto.id} value={crypto.id}>
          {crypto.symbol.toUpperCase()}
        </option>
      ))}
    </select>
  );
};

export default CryptoDropdown;