const AmountInput = ({ value, onChange }) => {
  return (
    <input
      type="number"
      value={value}
      onChange={onChange}
      placeholder="Amount"
      className="w-32 p-2 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-white focus:outline-none"
    />
  );
};

export default AmountInput;