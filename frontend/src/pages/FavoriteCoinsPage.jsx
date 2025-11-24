import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Brain, Diff, View } from "lucide-react";
import Header from '../components/common/Header';
import CryptoCard from '../components/common/CryptoCard';
import { useFavoritesStore } from '../store/favStore';
import { getNotesCountByCrypto } from '../utils/noteHelpers.js';
import { useNotesStore } from '../store/notesStore.js';
import { useFavoritePageStore } from '../store/favoritePageStore.js';
import AIReportForm from '../components/favorites/AIReportForm';
import { useQuery } from '@tanstack/react-query';
import { fetchCryptos, fetchFavoritesDetails } from '../api/cryptos.js';

const tabs = [
  { id: 'pros&cons', label: 'Pros & Cons', icon: Diff },
  { id: 'facts', label: 'Facts', icon: View },
  { id: 'reports', label: 'AI Reports', icon: Brain }
];

const FavoriteCoinsPage = () => {
  const {
    activeTab,
    prosAndConsResponse,
    factsResponse,
    reportsResponse,
    prosAndConsLoading,
    factsLoading,
    reportsLoading,
    prosAndConsCopied,
    factsCopied,
    reportsCopied,
    setActiveTab,
    setProsAndConsResponse,
    setFactsResponse,
    setReportsResponse,
    setProsAndConsLoading,
    setFactsLoading,
    setReportsLoading,
    setProsAndConsCopied,
    setFactsCopied,
    setReportsCopied
  } = useFavoritePageStore();

  const { notes, getAllNotes } = useNotesStore();
  const noteCounts = getNotesCountByCrypto(notes);
  const { loadFavorites, favoriteIds } = useFavoritesStore();

  const { 
    data: favorites = [], 
    isLoading: loadingFavorites,
    error: favoritesError,
    isFetching: isFetchingFavorites
  } = useQuery({
    queryKey: ['favorites-details'],
    queryFn: fetchFavoritesDetails,
    // Prevents query execution when favoriteIds is undefined or empty
    enabled: favoriteIds?.length > 0,
    staleTime: 30 * 60 * 1000,       
    gcTime: 2 * 60 * 60 * 1000,       
    refetchInterval: 5 * 60 * 1000,   
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { 
    data: allCryptos = [],
    isLoading: loadingAllCryptos,
    isFetching: isFetchingCryptos
  } = useQuery({
    queryKey: ['cryptos'],
    queryFn: fetchCryptos,
    staleTime: 30 * 60 * 1000,      
    gcTime: 2 * 60 * 60 * 1000,       
    refetchInterval: 5 * 60 * 1000,   
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  
  useEffect(() => {
    getAllNotes();
  }, []);

  const handleProsAndCons = async () => {
    setProsAndConsLoading(true);
    setProsAndConsResponse(""); 

    let fullResponse = ""; 

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pros-and-cons`, {
        credentials: 'include'
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        fullResponse += chunk; 
        setProsAndConsResponse(fullResponse); 
      }
      
    } catch (error) {
      console.log("Error:", error);
      setProsAndConsResponse("Error generating analysis...");
    } finally {
      setProsAndConsLoading(false);
    }
  };

  const handleFacts = async () => {
    setFactsLoading(true);
    setFactsResponse(""); 
    
    let fullResponse = ""; 
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/facts`, {
        credentials: 'include'
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        fullResponse += chunk; 
        setFactsResponse(fullResponse); 
      }
      
    } catch (error) {
      console.log("Error:", error);
      setFactsResponse("Error generating facts...");
    } finally {
      setFactsLoading(false);
    }
  };

  const handleReports = async (formData) => {
    setReportsLoading(true);
    setReportsResponse(""); 
    
    let fullResponse = ""; 
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        fullResponse += chunk; 
        setReportsResponse(fullResponse); 
      }
      
    } catch (error) {
      console.log("Error:", error);
      setReportsResponse("Error generating report...");
    } finally {
      setReportsLoading(false);
    }
  };

  if (loadingFavorites || loadingAllCryptos) {
    return (
      <div className='flex-1 relative z-10'>
        <Header title="Your Favorite Coins" />
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

  if (favoritesError) {
    return (
      <div className='flex-1 relative z-10'>
        <Header title="Your Favorite Coins" />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="text-red-500 text-xl">
            Error loading favorites: {favoritesError.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 relative z-10'>
      <Header title="Your Favorite Coins" />
      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {favorites?.map(crypto => (
                <motion.div
                  key={crypto.coinId}
                  initial={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <CryptoCard 
                    crypto={crypto} 
                    isInFavoritePage={true} 
                    noteCount={noteCounts[crypto.coinId] || 0}
                  />
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
                onClick={handleProsAndCons} 
                disabled={prosAndConsLoading}
                className={`px-6 py-3 rounded-lg font-semibold mt-4 transition-all duration-300 ${
                  prosAndConsLoading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-slate-900 hover:bg-white hover:text-black'
                }`}
              >
                {prosAndConsLoading ? 'Generating...' : 'Generate with CryptoAI'}
              </button>
              
              {prosAndConsResponse && (
                <div className="mt-6">
                  <div className="p-4 bg-gray-900 rounded-lg mb-4">
                    <pre className="whitespace-pre-wrap text-gray-200">{prosAndConsResponse || ""}</pre>
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(prosAndConsResponse);
                        setProsAndConsCopied(true);
                        setTimeout(() => setProsAndConsCopied(false), 2000);
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      {prosAndConsCopied ? "Copied!" : "Copy Text"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'facts' && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Facts and Curiosities</h3>
              <p className='text-gray-300'>
                As you indicated, your favorite cryptos are:{" "}
                {favorites.map((crypto, index) => (
                  <motion.span 
                    key={crypto.coinId}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: index * 0.2,
                      duration: 0.4,
                      ease: "easeOut"
                    }}
                  >
                    <span className="bg-gray-700 text-white px-2 py-1 rounded text-sm">
                      {crypto.name}
                    </span>
                    {index < favorites.length - 1 ? " " : ""}
                  </motion.span>
                ))}
              </p>
              <p className='text-gray-300'>
                Click the button below so that CryptoAI can generate curiosities and specific facts about your favorite coins.
              </p>
              
              <button 
                onClick={handleFacts} 
                disabled={factsLoading}
                className={`px-6 py-3 rounded-lg font-semibold mt-4 transition-all duration-300 ${
                  factsLoading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-slate-900 hover:bg-white hover:text-black'
                }`}
              >
                {factsLoading ? 'Generating...' : 'Generate with CryptoAI'}
              </button>
              
              {factsResponse && (
                <div className="mt-6">
                  <div className="p-4 bg-gray-900 rounded-lg mb-4">
                    <pre className="whitespace-pre-wrap text-gray-200">{factsResponse}</pre>
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(factsResponse);
                        setFactsCopied(true);
                        setTimeout(() => setFactsCopied(false), 2000);
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      {factsCopied ? "Copied!" : "Copy Text"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">AI Report</h3>
              <p className="text-gray-300">
                CryptoAI analyzes your responses to generate personalized portfolio insights and predictions tailored to your investment profile. Our advanced AI provides comprehensive risk assessments and strategic recommendations for managing your portfolio risk, all aligned with your specific financial goals and risk tolerance.
              </p>
                
              <AIReportForm 
                cryptos={allCryptos}
                onGenerateReport={handleReports} 
                isGenerating={reportsLoading} 
              />
              
              {reportsResponse && (
                <div className="mt-6">
                  <div className="p-4 bg-gray-900 rounded-lg mb-4">
                    <pre className="whitespace-pre-wrap text-gray-200">{reportsResponse}</pre>
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(reportsResponse);
                        setReportsCopied(true);
                        setTimeout(() => setReportsCopied(false), 2000);
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      {reportsCopied ? "Copied!" : "Copy Text"}
                    </button>
                  </div>
                </div>
              )}
                 
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FavoriteCoinsPage;