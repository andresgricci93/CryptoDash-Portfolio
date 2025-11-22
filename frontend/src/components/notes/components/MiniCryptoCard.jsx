import { useCurrencyStore } from '../../../store/currencyStore.js';
import { Star } from 'lucide-react';
import { formatNoteCount } from '../../../utils/noteHelpers.js';

const MiniCryptoCard = ({ crypto, onNoteDrop, noteCount }) => {

  const { formatPrice } = useCurrencyStore();  

   console.log('crypto properties:', {
    id: crypto.id,
    coinId: crypto.coinId,
    name: crypto.name,
    symbol: crypto.symbol
  });

  const handleDragOver = (e) => {
    e.preventDefault(); 
    e.currentTarget.style.backgroundColor = '#2d3748';
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = '#4a5568';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('noteId');
    e.currentTarget.style.backgroundColor = '#4a5568'; 
    
    console.log('Dropped note:', noteId, 'on crypto:', crypto.coinId);
    
    if (onNoteDrop) {
      onNoteDrop(noteId, crypto.coinId);
    }
  };

  return (
    <div 
      className="bg-gray-700 rounded p-6 mb-2 relative flex items-center min-h-[60px]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Estrella favorito - solo visual */}
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