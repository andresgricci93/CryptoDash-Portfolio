const OrderByPrice = ({ onSort }) => {
  return (
    <select 
      onChange={(e) => onSort('current_price', e.target.value)}
      className="bg-gray-700 outline-none text-white px-3 py-3 text-base rounded border border-gray-600"
      defaultValue=""
    >
      <option value="desc">Price: High to Low</option>
      <option value="asc">Price: Low to High</option>
    </select>
  );
};

export default OrderByPrice;