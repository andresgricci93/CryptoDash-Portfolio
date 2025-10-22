import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFavoritesStore } from '../../store/favStore';
import axios from 'axios';
import toast from 'react-hot-toast';

const FavoriteStar = ({ cryptoId, isInFavoritePage = false, setFavorites }) => {

  const favoriteIds = useFavoritesStore(state => state.favoriteIds);
  const addFavorite = useFavoritesStore(state => state.addFavorite);
  const removeFavorite = useFavoritesStore(state => state.removeFavorite);
  
  const [localFavorite, setLocalFavorite] = useState(false);

  useEffect(() => {
    setLocalFavorite(favoriteIds.includes(cryptoId));
  }, [favoriteIds, cryptoId]);

  const handleClick = async (e) => {
    e.stopPropagation();
    
    if (!localFavorite && favoriteIds.length >= 5) {
      toast.error('Maximum 5 favorites allowed', {
        icon: '⚠️',
        duration: 3000,
      });
      return;
    }

    const previousState = localFavorite;
    setLocalFavorite(!localFavorite);

    try {
      if (localFavorite) {
        removeFavorite(cryptoId);
        
        if (isInFavoritePage) {
          setFavorites(prev => prev.filter(fav => fav.coinId !== cryptoId));
        }
        toast.success('Removed from favorites');
      } else {
        addFavorite(cryptoId);
        toast.success('Added to favorites');
      }
    } catch (error) {
      setLocalFavorite(previousState);
      

      const errorMsg = error.response?.data?.message || 'Error updating favorites';
      toast.error(errorMsg);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`transition-colors ${
        localFavorite 
          ? 'text-yellow-400 hover:text-yellow-300' 
          : 'text-gray-400 hover:text-yellow-400'
      }`}
      aria-label={localFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star
        size={20}
        fill={localFavorite ? 'currentColor' : 'none'}
        strokeWidth={2}
      />
    </button>
  );
};

export default FavoriteStar;