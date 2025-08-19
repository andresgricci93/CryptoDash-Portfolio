import { useNavigate } from 'react-router-dom';


const CryptoCard = ({ crypto }) => {
    
  const navigate = useNavigate();


  const handleClick = () => {
    navigate(`/crypto/${crypto.id}`);
  };

  // Función para formatear el precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  // Función para formatear el porcentaje
  const formatPercentage = (percentage) => {
    const isPositive = percentage > 0;
    const symbol = isPositive ? '+' : '';
    return `${symbol}${percentage.toFixed(2)}%`;
  };

  const isPositive = crypto.price_change_percentage_24h > 0;

  return (
    <div 
      className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 cursor-pointer transition-colors duration-200 border border-gray-700 min-h-[140px]"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3 mb-3">
        <img 
          src={crypto.image} 
          alt={crypto.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm">{crypto.name}</h3>
          <span className="text-gray-400 text-xs">{crypto.symbol.toUpperCase()}</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="text-white font-bold text-lg">{formatPrice(crypto.current_price)}</div>
        <div className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {formatPercentage(crypto.price_change_percentage_24h)}
        </div>
      </div>
    </div>
  );
};


export default CryptoCard;