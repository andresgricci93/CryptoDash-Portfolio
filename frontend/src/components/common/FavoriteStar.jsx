import { useState, useEffect } from 'react';
import { Star } from "lucide-react";
import { useFavoritesStore } from '../../store/favStore';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/favorites`;

const FavoriteStar = ({ cryptoId, isInFavoritePage,  setFavorites }) => {
  const favoriteIds = useFavoritesStore(state => state.favoriteIds);
  const [localFavorite, setLocalFavorite] = useState(false);
  
  useEffect(() => {
    setLocalFavorite(favoriteIds.includes(cryptoId));
  }, [favoriteIds, cryptoId]);
  
  const handleClick = async (e) => {
    e.stopPropagation();
    
    
    if (isInFavoritePage && localFavorite) {

      setFavorites(prev => prev.filter(crypto => crypto.coinId !== cryptoId));
      
      // Call to backend API (without store actualization)
      axios.delete(`${API_URL}/remove`, { data: { cryptoId } });
      setTimeout(() => {
        const currentFavorites = useFavoritesStore.getState().favoriteIds;
        useFavoritesStore.setState({
          favoriteIds: currentFavorites.filter(id => id !== cryptoId)
        });
      }, 350);
    } else {
    
      setLocalFavorite(!localFavorite);
      
      const currentFavorites = useFavoritesStore.getState().favoriteIds;
      if (localFavorite) {
        useFavoritesStore.setState({
          favoriteIds: currentFavorites.filter(id => id !== cryptoId)
        });
        axios.delete(`${API_URL}/remove`, { data: { cryptoId } });
      } else {
        useFavoritesStore.setState({
          favoriteIds: [...currentFavorites, cryptoId]
        });
        axios.post(`${API_URL}/add`, { cryptoId });
      }
    }
  };
  
  return (
    <button onClick={handleClick} className="p-1 hover:bg-gray-600 rounded">
      <Star 
        size={18}
        className={localFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400 hover:text-yellow-400"}
      />
    </button>
  );
};

export default FavoriteStar;