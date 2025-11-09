import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFavoritesStore } from '../../store/favStore';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const FavoriteStar = ({ cryptoId, isInFavoritePage = false }) => {
  const queryClient = useQueryClient();
  const favoriteIds = useFavoritesStore(state => state.favoriteIds);
  const addFavorite = useFavoritesStore(state => state.addFavorite);
  const removeFavorite = useFavoritesStore(state => state.removeFavorite);
  
  const [localFavorite, setLocalFavorite] = useState(() => {
    return favoriteIds.includes(cryptoId);
  });

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

       await removeFavorite(cryptoId);
        

        queryClient.setQueryData(['favorites-details'], (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter(fav => fav.coinId !== cryptoId);
        });
        

        if (isInFavoritePage) {

          setTimeout(() => {
            queryClient.invalidateQueries(['favorites-details']);
          }, 350);
        } else {

          queryClient.invalidateQueries(['favorites-details']);
        }
        
        toast.success('Removed from favorites');
        
      } else {
 
        await addFavorite(cryptoId);
  
        queryClient.setQueryData(['favorites-details'], (oldData) => {
          const allCryptos = queryClient.getQueryData(['cryptos']);
          const newCrypto = allCryptos?.find(c => c.coinId === cryptoId);
          
          if (newCrypto && oldData) {
            return [...oldData, newCrypto];
          }
          return oldData;
        });
        
        queryClient.invalidateQueries(['favorites-details']);
        toast.success('Added to favorites');
      }
    } catch (error) {
      setLocalFavorite(previousState);
      queryClient.invalidateQueries(['favorites-details']);
      
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