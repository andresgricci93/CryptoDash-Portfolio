import { Search } from 'lucide-react';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search by title...",
  size = "md", // sm, md, lg
  fullWidth = true,
  className = "" 
}) => {
  const sizeClasses = {
    sm: "p-2 text-sm",
    md: "p-3 text-base", 
    lg: "p-4 text-lg"
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  return (
    <div className={`relative ${fullWidth ? 'w-full' : 'w-auto'} ${className}`}>
      <Search 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
        size={iconSizes[size]} 
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${fullWidth ? 'w-full' : 'w-auto'} pl-10 ${sizeClasses[size]} bg-white text-black rounded placeholder-gray-400 focus:outline-none `}
      />
    </div>
  );
};

export default SearchBar;