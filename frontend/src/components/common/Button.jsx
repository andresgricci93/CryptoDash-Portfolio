const Button = ({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false,
  className = '',
  ...props 
}) => {
  
  const baseStyles = 'px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-in-out border';
  
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-white hover:text-black border-slate-900 hover:border-slate-900',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 border-gray-600',
    success: 'bg-green-500 text-white hover:bg-green-600 border-green-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 border-red-500',
    dangerGhost: 'bg-transparent text-red-400 hover:bg-red-500 hover:text-white border-red-400 hover:border-red-500',
    settingsCard: 'bg-transparent hover:bg-white hover:text-black border border-gray-600 hover:border-white text-gray-100',
    transparent: 'bg-transparent border-transparent px-4 py-2 text-gray-300 hover:text-white transition-colors'
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;