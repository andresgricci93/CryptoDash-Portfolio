import { useDroppable } from '@dnd-kit/react';
import { useCurrencyStore } from '../../../store/currencyStore.js';
import { Star } from 'lucide-react';
import { formatNoteCount } from '../../../utils/noteHelpers.js';
import { useNavigate } from 'react-router-dom';

const MiniCryptoCard = ({ crypto, noteCount }) => {
  const { formatPrice } = useCurrencyStore();  
  const navigate = useNavigate();

  const { ref, isDropTarget } = useDroppable({
    id: crypto.coinId,
    data: { type: 'crypto', crypto }
  });

  return (
    <div 
      ref={ref}
      onClick={() => navigate(`/crypto/${crypto.coinId}`)}
      className={`rounded p-6 mb-2 relative flex items-center min-h-[60px] transition-colors duration-150 cursor-pointer ${
        isDropTarget 
          ? 'bg-gray-600 ring-2 ring-white' 
          : 'bg-gray-700'
      }`}
    >
      <Star 
        className="absolute top-4 right-6 w-3 h-3 text-yellow-400 fill-yellow-400" 
      />
      
      <img 
        src={crypto.image} 
        alt={crypto.name} 
        className="w-6 h-6 mr-3" 
      />
      
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white truncate">
          {crypto.name}
        </div>
        <div className="text-xs text-gray-400">
          {crypto.symbol.toUpperCase()}
        </div>
      </div>
      
      <div className="text-sm text-white font-semibold">
        {formatPrice(crypto.current_price)}
      </div>

      {noteCount > 0 && (
        <div className='text-xs text-gray-400 ml-2'>
          {formatNoteCount(noteCount)}
        </div>  
      )}
    </div>
  );
};

export default MiniCryptoCard;
