const AddButton = ({ onClick, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 bg-gray-900 text-white rounded flex items-center justify-center text-sm font-bold transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
      }`}
    >
      +
    </button>
  );
};

export default AddButton;