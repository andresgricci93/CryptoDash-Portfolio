import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '../components/common/Searchbar.jsx';
import Header from '@components/common/Header.jsx';
import CryptoCard from '../components/common/CryptoCard.jsx';
import CurrencyDropdown from '../components/overview/CurrencyDropdown.jsx';
import OrderByPrice from '../components/overview/OrderByPrice.jsx';
import OrderByMarketCap from '../components/overview/OrderByMarketCap.jsx';
import { getNotesCountByCrypto } from '../utils/noteHelpers.js';
import { useNotesStore } from '../store/notesStore.js';
import { useQuery } from '@tanstack/react-query';
import { fetchCryptos } from '../api/cryptos.js';


const OverviewPage = () => {


  const { data: cryptos = [], isLoading, error } = useQuery({
    queryKey: ['cryptos'],
    queryFn: fetchCryptos,
    staleTime: 30 * 60 * 1000,  // 30 min
    gcTime: 2 * 60 * 60 * 1000, // 2 hours      
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 min (background)  
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
   getAllNotes();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('market_cap'); 
  const [sortOrder, setSortOrder] = useState('desc');
  const { notes,getAllNotes } = useNotesStore();
  
  const noteCounts = getNotesCountByCrypto(notes);



  const filteredCryptos = cryptos.filter(crypto =>
  crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

   const filteredAndSortedCryptos = filteredCryptos.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'desc') {
        return bValue - aValue; // Mayor a menor
      } else {
        return aValue - bValue; // Menor a mayor
      }
    });
  const handleSort = (field, order) => {
      setSortBy(field);
      setSortOrder(order);
   };


   if (isLoading) {
      return (
        <div className='flex-1 relative z-10'>
          <Header />
          <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
            <motion.div
              className='w-16 h-16 border-4 border-t-4 border-t-white border-gray-700 rounded-full'
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className='flex-1 relative z-10'>
          <Header  />
          <div className="flex items-center justify-center text-red-500">
            Error loading cryptos: {error.message}
          </div>
        </div>
      );
    }

  return (
    <div className='flex-1 relative z-10'>
      <Header />
      <main className='w-full py-6 px-4 lg:px-8 xl:px-12 2xl:px-24'>
        <div className="w-[80%] max-w-full mx-auto">
          <div className="mb-6">
          <div className="flex justify-between gap-4 items-center">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search cryptocurrencies..."
                size="md"
                fullWidth={true}
              />
            </div>
            <div className="flex gap-2">
                <OrderByPrice onSort={handleSort} />
                <OrderByMarketCap onSort={handleSort} />
                <CurrencyDropdown />
            </div>
          </div>
        </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredAndSortedCryptos.map(crypto => (
              <CryptoCard 
                  key={crypto.id} 
                  crypto={crypto} 
                  isInFavoritePage={false}  
                  noteCount={noteCounts[crypto.coinId] || 0} 
                  />
            ))}
          </div>
        </div>
        
      </main>
    </div>
  );
};

export default OverviewPage;