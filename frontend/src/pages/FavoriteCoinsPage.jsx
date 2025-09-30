import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp,
  Brain,
  Diff,
  View,
 } from "lucide-react";
import Header from '../components/common/Header';
import axios from "axios";
import CryptoCard from '../components/common/CryptoCard';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useFavoritesStore } from '../store/favStore';
const tabs = [
  { id: 'pros&cons', label: 'Pros & Cons', icon: Diff },
  { id: 'facts', label: 'Facts', icon: View },
  { id: 'reports', label: 'AI Reports', icon: Brain }
];

const handleGenerateProsAndCons = async (favorites, setAiResponse, setIsGenerating) => {
  setIsGenerating(true);
  setAiResponse(""); 
  const cryptos = favorites.map(crypto => crypto.coinId || crypto.name);

  const prompt = `Analyze at least 3 pros and cons of these cryptocurrencies: ${cryptos.join(', ')}. 
                Provide specific advantages and disadvantages for each coin.
                Format your response as plain text without markdown formatting (no ** or other symbols).
                Use simple text structure with clear headings and bullet points using - instead of *.`;
  
  try {
    const googleai = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY);
    const gemini = googleai.getGenerativeModel({model: "gemini-2.5-flash-lite"});
    
    const result = await gemini.generateContentStream(prompt);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      setAiResponse(prev => prev + chunkText);
    }
  } catch (error) {
    console.log("Streaming error:", error);
    setAiResponse("Error generating analysis...");
  } finally {
    setIsGenerating(false);
  }
}

const FavoriteCoinsPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('pros&cons'); 
  const [aiResponse, setAiResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleClick = () => {
    handleGenerateProsAndCons(favorites, setAiResponse, setIsGenerating);
  };
const favoriteIds = useFavoritesStore(state => state.favoriteIds);


useEffect(() => {
    console.log('=== FAVORITECOINSPAGE DEBUG ===');
    console.log('Store favoriteIds:', favoriteIds);
    console.log('Local favorites state:', favorites.map(f => f.coinId));
    console.log('Are they in sync?', favoriteIds.every(id => favorites.some(f => f.coinId === id)));
  
  // Filtrar nulls y valores vacíos
  const validFavoriteIds = favoriteIds.filter(id => 
    id !== null && 
    id !== undefined && 
    id !== '' && 
    typeof id === 'string'
  );
   console.log('Valid IDs after filter:', validFavoriteIds);
   
  if (validFavoriteIds.length > 0) {
    axios.get(`${import.meta.env.VITE_API_URL}/favorites/details`)
      .then(response => {
        setFavorites(response.data.data);
        setLoading(false);
      });
  } else {
    setFavorites([]);
    setLoading(false);
  }
}, [favoriteIds]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className='flex-1 relative z-10'>
      <Header title="Your Favorite Coins" />
      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {favorites.map(crypto => (
                <motion.div
                  key={crypto.coinId}
                  initial={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <CryptoCard crypto={crypto} isInFavoritePage={true} setFavorites={setFavorites} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="border-b border-gray-700 mb-8">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id 
                    ? 'border-white-500 text-white' 
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="min-h-[400px]">
          {activeTab === 'pros&cons' && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Pros & Cons</h3>
              <p className="text-gray-300">Advantages and Disadvantages of your favorites cryptocurrencies.</p>
                <button 
                  onClick={handleClick} 
                  disabled={isGenerating}
                  className={`px-6 py-3 rounded-lg font-semibold mt-4 transition-all duration-300 ${
                    isGenerating 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-slate-900 hover:bg-white hover:text-black'
                  }`}
                >
                  {isGenerating ? 'Generating...' : 'Generate with CryptoAI'}
                </button>
                
                {aiResponse && (
                  <div className="mt-6 p-4 bg-gray-900 rounded-lg">
                    <pre className="whitespace-pre-wrap text-gray-200">{aiResponse}</pre>
                  </div>
                )}
            </div>
          )}
          {activeTab === 'facts' && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Facts and Curiosities</h3>
              <p className='text-gray-300'>
              As you indicated, your favorite cryptos are: Bitcoin, Ethereum, and Litecoin.
              </p>
              <p className='text-gray-300'>
                Click the button below so that CryptoAI can generate curiosities and specific facts about your favorite coins.
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed temporibus vero ab iure, quas nulla dolorum corporis possimus exercitationem ut minima modi esse saepe voluptas? Maiores nemo fuga perspiciatis ex!
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed temporibus vero ab iure, quas nulla dolorum corporis possimus exercitationem ut minima modi esse saepe voluptas? Maiores nemo fuga perspiciatis ex!
              </p>
              <button className='bg-slate-900 text-white hover:bg-white hover:text-black transition-all duration-300 ease-in-out px-6 py-3 rounded-lg font-semibold border border-slate-900 hover:border-slate-900 mt-4'>
                Generate with CryptoAI
              </button>
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">AI Report</h3>
              <p className="text-gray-300">
                  CryptoAI analyzes your responses to generate personalized portfolio insights and predictions tailored to your investment profile. Our advanced AI provides comprehensive risk assessments and strategic recommendations for managing your portfolio risk, all aligned with your specific financial goals and risk tolerance.
              </p>
              <button className='bg-slate-900 text-white hover:bg-white hover:text-black transition-all duration-300 ease-in-out px-6 py-3 rounded-lg font-semibold border border-slate-900 hover:border-slate-900 mt-4'>
                Generate Report
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FavoriteCoinsPage;