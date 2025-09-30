import { useNavigate } from 'react-router-dom';
import FavoriteStar from './FavoriteStar.jsx';
import { useCurrencyStore } from '../../store/currencyStore.js';
// import {formatPrice,formatPercentage} from '../../utils/formatters.js'

const CryptoCard = ({ crypto,isInFavoritePage  = false,  setFavorites}) => {
    
  console.log('CryptoCard crypto object:', crypto);
  const navigate = useNavigate();
  const {formatPrice} = useCurrencyStore();

const formatPercentage = (percentage) => {
  if (percentage === null || percentage === undefined) return 'N/A';
  
  const isPositive = percentage > 0;
  const symbol = isPositive ? '+' : '';
  return `${symbol}${percentage.toFixed(2)}%`;
};
  const handleClick = () => {
    navigate(`/crypto/${crypto.coinId}`);
  };

  const isPositive = crypto.price_change_percentage_24h > 0;


  return (
    <div 
      className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 cursor-pointer transition-colors duration-200 border border-gray-700 min-h-[140px] crypto-card"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-3">
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
          <div  className="p-1 ">
            <FavoriteStar 
              cryptoId={crypto.coinId}  
              isInFavoritePage={isInFavoritePage} 
              setFavorites={setFavorites}  
            />
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