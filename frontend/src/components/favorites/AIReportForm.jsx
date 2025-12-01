import { useState, useEffect } from 'react';
import { useCurrencyStore } from '../../store/currencyStore'; 
import CurrencyDropdownFavorites from './CurrencyDropdownFavorites';
import CryptoDropdown from './CryptoDropdown';
import AmountInput from './AmountInput';
import AddButton from './AddButton';
import toast from 'react-hot-toast';
import { TOP_CRYPTOS } from '../../utils/topCryptos';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '../common/Button.jsx';



const AIReportForm = ({ onGenerateReport, isGenerating }) => {
  
  const { availableCurrencies, currencyRates } = useCurrencyStore();

  const [cryptoAllocations, setCryptoAllocations] = useState([]);
  const [selectedCryptoId, setSelectedCryptoId] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [localSelectedCurrency, setLocalSelectedCurrency] = useState('USD');
  const [strategy, setStrategy] = useState("");
  const [riskProfile, setRiskProfile] = useState("");

  const selectedCrypto = TOP_CRYPTOS.find(c => c.id === selectedCryptoId);
  const cryptoPriceUSD = cryptoPrices[selectedCryptoId];

  const rate = currencyRates?.find(r => r.code === localSelectedCurrency)?.rate || 1;
  const cryptoPriceConverted = cryptoPriceUSD ? cryptoPriceUSD * rate : null;

  const cryptoAmount = cryptoPriceConverted && currentAmount 
    ? (parseFloat(currentAmount) / cryptoPriceConverted).toFixed(6)
    : null;

    const handleSubmit = (e) => { 
      e.preventDefault();
      
      if (cryptoAllocations.length === 0) {
        toast.error('Please add at least one cryptocurrency');
        return;
      }
      
      if (!strategy.trim()) {
        toast.error('Please describe your investment strategy');
        return;
      }
      
      if (!riskProfile) {
        toast.error('Please select a risk profile');
        return;
      }
      
   
      const reportData = {
        allocations: cryptoAllocations,
        strategy: strategy,
        riskProfile: riskProfile,
        currency: localSelectedCurrency,
        totalAmount: cryptoAllocations.reduce((sum, a) => sum + a.amount, 0)
      };
      
      
      onGenerateReport(reportData);
    }

  const handleAddCrypto = () => {
    if (!selectedCryptoId || !selectedCrypto) {
      toast.error("Please select a valid cryptocurrency");
      return;
    }

    if (cryptoAllocations.length >= 10) {
      toast.error('Maximum 10 cryptocurrencies allowed');
      return;
    }

    if (cryptoAllocations.some(item => item.cryptoId === selectedCryptoId)) {
      toast.error(`${selectedCrypto.symbol.toUpperCase()} is already in your portfolio`);
      return;
    }

    const calculatedCryptoAmount = cryptoPriceConverted 
      ? (parseFloat(currentAmount) / cryptoPriceConverted).toFixed(6)
      : '0';

    const newAllocation = {
      cryptoId: selectedCryptoId,
      cryptoName: selectedCrypto.name,
      cryptoSymbol: selectedCrypto.symbol,
      amount: parseFloat(currentAmount),
      cryptoAmount: calculatedCryptoAmount
    };

    setCryptoAllocations([...cryptoAllocations, newAllocation]);
    toast.success(`${selectedCrypto.symbol.toUpperCase()} added to portfolio`);

      setTimeout(() => {
        // Solo scrollear si realmente necesitamos
        const pieChartElement = document.getElementById('portfolio-piechart');
        if (pieChartElement) {
          const rect = pieChartElement.getBoundingClientRect();
          
          // Solo scrollear si el elemento no está completamente visible
          if (rect.bottom > window.innerHeight || rect.top < 0) {
            pieChartElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start'  // Cambiar a 'start' en vez de 'center'
            });
          }
        }
      }, 500);

    setSelectedCryptoId('');
    setCurrentAmount('');
  };

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', 
    '#4ECDC4', '#95E77E'
  ];

  const pieChartData = cryptoAllocations.map(allocation => ({
    name: allocation.cryptoSymbol.toUpperCase(),
    value: parseFloat(allocation.amount)
  }));

  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/cryptos`);
        const data = await response.json();
        
        const pricesMap = {};
        data.forEach(crypto => {
          pricesMap[crypto.coinId] = crypto.current_price;
        });
        
        setCryptoPrices(pricesMap);
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchCryptoPrices();
  }, []);

  useEffect(() => {
      if (cryptoAllocations.length > 0 && Object.keys(cryptoPrices).length > 0) {
        const updatedAllocations = cryptoAllocations.map(allocation => {
          // Obtener el precio en USD
          const cryptoPriceUSD = cryptoPrices[allocation.cryptoId];
          
          // Obtener el rate de la nueva currency
          const rate = currencyRates?.find(r => r.code === localSelectedCurrency)?.rate || 1;
          
          // Convertir precio a la nueva currency
          const cryptoPriceInNewCurrency = cryptoPriceUSD ? cryptoPriceUSD * rate : null;
          
          // Recalcular cuánto crypto compras con el mismo amount pero en la nueva currency
          const newCryptoAmount = cryptoPriceInNewCurrency 
            ? (allocation.amount / cryptoPriceInNewCurrency).toFixed(6)
            : '0';
          
          return {
            ...allocation,
            cryptoAmount: newCryptoAmount
          };
        });
        
        setCryptoAllocations(updatedAllocations);
      }
    }, [localSelectedCurrency, cryptoPrices]);


  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      
      {/* --- Currency selector --- */}
      <div>
        <label className="text-white text-md font-medium mb-2 mt-2 block">
          In which fiat currency would you like to see the value of your crypto assets?
        </label>
        <CurrencyDropdownFavorites 
          value={localSelectedCurrency}
          onChange={(e) => setLocalSelectedCurrency(e.target.value)}
          currencies={availableCurrencies}
        />
      </div>

      {/* --- Crypto section --- */}
      <div>
        <label className="text-white text-md font-medium mb-2 block">
          What cryptocurrencies are in your portfolio?
        </label>
        <div className='mb-2'>
          <span className="text-gray-400 text-sm">
            {cryptoAllocations.length}/10
          </span>
        </div>

        {/* Inputs arriba */}
        <div className="flex flex-wrap gap-3 items-center">
          <CryptoDropdown 
            value={selectedCryptoId}
            onChange={(e) => setSelectedCryptoId(e.target.value)}
          />
          <div className="w-32">
            <AmountInput 
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
            />                
          </div>
          {cryptoAmount && selectedCrypto && (
            <span className="text-white text-sm truncate whitespace-nowrap">
              ≈ {cryptoAmount} {selectedCrypto.symbol.toUpperCase()}
            </span>
          )}
          <AddButton 
            onClick={handleAddCrypto}
            disabled={!selectedCryptoId || !currentAmount || cryptoAllocations.length >= 10}
          />
        </div>

      <div className='flex flex-row'>
        {cryptoAllocations.length > 0 && (
          <div className="flex flex-col gap-2 w-full max-w-md mt-6">
            {cryptoAllocations.map((allocation) => (
              <div 
                key={allocation.cryptoId}
                className="flex items-center gap-3 p-2 bg-gray-700 rounded border border-gray-600 text-sm"
              >
                <span className="text-white font-semibold">
                  {allocation.cryptoSymbol.toUpperCase()}
                </span>
                <span className="text-gray-400">
                  {allocation.amount.toLocaleString()} {localSelectedCurrency}
                </span>
                <span className="text-gray-500 text-xs">
                  ≈ {allocation.cryptoAmount} {allocation.cryptoSymbol.toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCryptoAllocations(cryptoAllocations.filter(a => a.cryptoId !== allocation.cryptoId));
                    toast.success(`${allocation.cryptoSymbol.toUpperCase()} removed`);
                  }}
                  className="text-red-400 hover:text-red-300 text-lg ml-auto"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {cryptoAllocations.length > 0 && (
          <div id="portfolio-piechart" className="w-full flex justify-center items-center">
            <div className="w-full max-w-xl">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    style={{ outline: 'none' }}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value.toLocaleString()} ${localSelectedCurrency}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>
        )}
      </div>
      <div className="mt-6 w-full">
        <label className="text-white text-md font-medium mb-2 block">
          What's your investment strategy?
        </label>
        <textarea
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          placeholder="Describe your investment approach (e.g., long-term holding, DCA, swing trading...)"
          className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-white focus:outline-none resize-none"
          rows={4}
        />
      </div>
        <div className="mt-4 w-full">
          <label className="text-white text-md font-medium mb-2 block">
            Your Risk Profile
          </label>
          <select
            value={riskProfile}
            onChange={(e) => setRiskProfile(e.target.value)}
            className="w-1/5 p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-white focus:outline-none"
          >
            <option value="">Select risk level</option>
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>
        <div className="mt-6 flex justify-center w-1/5">
          <Button
            type="submit"
            variant="primary"  // Usa la variante primary que tiene el estilo slate-900
            disabled={
              cryptoAllocations.length === 0 || 
              !strategy.trim() || 
              !riskProfile ||
              isGenerating
            }
            className="w-full"
          >
            {isGenerating ? 'Generating Report...' : 'Generate AI Report'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AIReportForm;
