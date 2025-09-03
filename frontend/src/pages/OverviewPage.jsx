
import {motion} from "framer-motion";
import StatCard from '../components/common/StatCard.jsx'
import { useState, useEffect } from 'react';
import Header from '../components/common/Header.jsx'
import { BarChart2, ShoppingBag, Zap,Users } from 'lucide-react';
import CryptoCard from "../components/common/CryptoCard.jsx";
import cryptoMockData from './../../../cryptomock.json';
const OverviewPage = () => {

  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
        setCryptos(cryptoMockData);
        setLoading(false);
    }, []);

   if (loading) return <div>Loading cryptos...</div>;

  return (
    <div className='flex-1 overflow-auto relative z-10'>
       <Header title="Overview" />
       <main className='w-full flex justify-center py-6 px-4 lg:px-8 xl:px-12 2xl:px-24 overflow-x-hidden max-w-full'>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 w-[80%] max-w-full">
          {cryptos.map(crypto => (
            <CryptoCard key={crypto.id} crypto={crypto} />
          ))}
        </div>
      </main>
    </div>
  )
}

export default OverviewPage