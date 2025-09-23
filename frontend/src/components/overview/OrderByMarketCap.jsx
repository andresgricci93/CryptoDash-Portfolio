const OrderByMarketCap = ({ onSort }) => {
  return (
    <select 
      onChange={(e) => onSort('market_cap', e.target.value)}
      className="bg-gray-700 text-white px-3 py-3 text-base rounded border border-gray-600"
      defaultValue=""
    >

      <option value="desc">Market Cap: High to Low</option>
      <option value="asc">Market Cap: Low to High</option>
    </select>
  );
};

export default OrderByMarketCap;