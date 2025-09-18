import { useState, useEffect } from 'react';
import SearchBar from '../components/common/Searchbar.jsx';
import Header from '@components/common/Header.jsx';
import CryptoCard from '../components/common/CryptoCard.jsx';

const OverviewPage = () => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/cryptomockdata`);
        const data = await response.json();
        setCryptos(data);
      } catch (error) {
        console.log('Error fetching cryptos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptos();
  }, []);

  const filteredCryptos = cryptos.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading cryptos...</div>;

  return (
    <div className='flex-1 relative z-10'>
      <Header title="Overview" />
      <main className='w-full py-6 px-4 lg:px-8 xl:px-12 2xl:px-24'>
        <div className="w-[80%] max-w-full mx-auto">
          <div className="mb-6" style={{ width: 'calc(66.666% + 12px)' }}>
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cryptocurrencies..."
              size="md"
              fullWidth={true}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredCryptos.map(crypto => (
              <CryptoCard key={crypto.id} crypto={crypto} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;