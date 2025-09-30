import { useCurrencyStore } from '../../../store/currencyStore.js';
import { Star } from 'lucide-react';

const MiniCryptoCard = ({ crypto, onNoteDrop }) => {

  const { formatPrice } = useCurrencyStore();  
  
  const handleDragOver = (e) => {
    e.preventDefault(); // Allow drag n drop
    e.currentTarget.style.backgroundColor = '#2d3748'; // Highlight al hover
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = '#4a5568'; // Return to original color - to fix in further iterations UI/UX
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('noteId');
    e.currentTarget.style.backgroundColor = '#4a5568'; // Reset color
    
    console.log('Dropped note:', noteId, 'on crypto:', crypto.id);
    
    if (onNoteDrop) {
      onNoteDrop(noteId, crypto.id);
    }
  };

  return (
    <div 
      className="bg-gray-700 rounded p-4 mb-2 relative flex items-center min-h-[60px]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Star 
        className="absolute top-2 right-2 w-3 h-3 text-yellow-400 fill-yellow-400" 
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
    </div>
  );
};

export default MiniCryptoCard;