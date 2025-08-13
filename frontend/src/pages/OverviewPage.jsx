
import {motion} from "framer-motion";
import StatCard from '../components/common/StatCard.jsx'
import { useState, useEffect } from 'react';
import Header from '../components/common/Header.jsx'
import { BarChart2, ShoppingBag, Zap,Users } from 'lucide-react';
// import SalesOverviewChart from '../components/overview/SalesOverviewChart.jsx'
// import CategoryDistributionChart from '../components/overview/CategoryDistributionChart.jsx'
// import SalesChannelChart from '../components/overview/SalesChannelChart.jsx'
// import { BitcoinPriceChart } from "../components/overview/BitcoinPriceChart.jsx";

const CryptoCard = ({ crypto }) => {
  
  // Función para formatear el precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  // Función para formatear el porcentaje
  const formatPercentage = (percentage) => {
    const isPositive = percentage > 0;
    const symbol = isPositive ? '+' : '';
    return `${symbol}${percentage.toFixed(2)}%`;
  };

  const isPositive = crypto.price_change_percentage_24h > 0;

  return (
    <div 
      className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 cursor-pointer transition-colors duration-200 border border-gray-700"
      onClick={() => console.log('Clicked:', crypto.id)}
    >
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
      
      <div className="space-y-1">
        <div className="text-white font-bold text-lg">{formatPrice(crypto.current_price)}</div>
        <div className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {formatPercentage(crypto.price_change_percentage_24h)}
        </div>
      </div>
    </div>
  );
};







const TestCryptoCard = () => {
  // Data mockeada para probar
  const mockCryptos = [
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'btc',
      image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png',
      current_price: 98765.43,
      price_change_percentage_24h: 2.45
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'eth',
      image: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png',
      current_price: 3456.78,
      price_change_percentage_24h: -1.23
    },
    {
      id: 'cardano',
      name: 'Cardano',
      symbol: 'ada',
      image: 'https://coin-images.coingecko.com/coins/images/975/large/cardano.png',
      current_price: 0.987654,
      price_change_percentage_24h: 5.67
    }
  ];

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h2 className="text-white text-2xl font-bold mb-6">Test Crypto Cards</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockCryptos.map(crypto => (
          <CryptoCard key={crypto.id} crypto={crypto} />
        ))}
      </div>
    </div>
  );
};
const OverviewPage = () => {

  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/cryptos');
        const data = await response.json();
        console.log(data);
        setCryptos(data);
        setLoading(false);
      } catch (error) {
        console.log('Error:', error);
        setLoading(false);
      }
    };

    fetchCryptos();
  }, []);

   if (loading) return <div>Loading cryptos...</div>;

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title="Overview" />
      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8 xl:px-8'>
       {/* STATS
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 1}}
        >
        <StatCard 
          name="Total Sales" icon={Zap} value='12,345' color='#6366F1'
        />
        <StatCard 
          name="New Users" icon={Users} value='1,345' color='#8B5CF6'
        />
        <StatCard 
          name="Total Products" icon={ShoppingBag} value='567' color='#EC4899'
        />
        <StatCard 
          name="Conversion Rate" icon={BarChart2} value='12.5%' color='#10B981'
        />
        </motion.div>

        {/** CHARTS 
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
         <SalesOverviewChart />
         <CategoryDistributionChart />
         <SalesChannelChart />
         <BitcoinPriceChart />
        </div>*/}
        <TestCryptoCard/>
      </main>

    </div>
  )
}

export default OverviewPage