import {useState,useEffect} from 'react'
import Header from '../components/common/Header';
import axios from "axios";
import CryptoCard from '../components/common/CryptoCard';

const API_URL = "http://localhost:5000/api/cryptomockdata";



const FavoriteCoinsPage = () => {
  
  
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  
  useEffect(() => {
  
  axios.get('http://localhost:5000/api/favorites/selected')
       .then(response => {
        setFavorites(response.data.data); 
        setLoading(false);
       })
  
    },[]);
  



  return (
    <div className='flex-1 relative z-10'>
      <Header title="Your Favorite Coins" />
       <main className='w-full flex justify-center py-6 px-4 lg:px-8 xl:px-12 2xl:px-24 overflow-x-hidden max-w-full'>
        
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 w-[80%] max-w-full">
          {favorites.map(crypto => (
             <CryptoCard key={crypto.id} crypto={crypto} />
           ))}
        </div>
      </main>
    </div>
  )
}

export default FavoriteCoinsPage