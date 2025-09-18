import { useState,useEffect } from 'react';
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

import Button from '../components/common/Button.jsx';





console.log("GoogleGenerativeAI imported:", GoogleGenerativeAI);
const API_URL = `${import.meta.env.VITE_API_URL}/cryptomockdata`;







const tabs = [
  { id: 'pros&cons', label: 'Pros & Cons', icon: Diff },
  { id: 'facts', label: 'Facts', icon: View },
  { id: 'reports', label: 'AI Reports', icon: Brain }
];

const handleGenerateProsAndCons = async (favorites,setAiResponse, setIsGenerating) => {
  setIsGenerating(true);
  setAiResponse(""); 
  const cryptos = favorites.map(crypto => crypto.id || crypto.name);


  const prompt =  `Analyze at least 3 pros and cons of these cryptocurrencies: ${cryptos.join(', ')}. 
                Provide specific advantages and disadvantages for each coin.
                Format your response as plain text without markdown formatting (no ** or other symbols).
                Use simple text structure with clear headings and bullet points using - instead of *.`;
  
  try {
    const googleai = new GoogleGenerativeAI("AIzaSyBmg3yM7cMpPSfkytPWvl6JWGfjIWVh4dM");
    const gemini = googleai.getGenerativeModel({model: "gemini-1.5-flash"});
    
   
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
    console.log("entra")
    handleGenerateProsAndCons(favorites, setAiResponse, setIsGenerating);
  };


  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/favorites/selected`)
      .then(response => {
        setFavorites(response.data.data); 
        setLoading(false);
        console.log("Response completa:", response);
        console.log("Response data:", response.data);
        console.log("Response data.data:", response.data.data);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
  <div className='flex-1 relative z-10'>
    <Header title="Your Favorite Coins" />
    <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {favorites.map(crypto => (
            <CryptoCard key={crypto.id} crypto={crypto} />
          ))}
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
            <Button 
              onClick={handleClick} 
              disabled={isGenerating}
              className="mt-4"
            >
              {isGenerating ? 'Generating...' : 'Generate with CryptoAI'}
            </Button>
              

              {aiResponse && (
                <div className="mt-6 p-4 bg-gray-900 rounded-lg">
                  <pre className="whitespace-pre-wrap text-gray-200">{aiResponse}</pre>
                </div>
              )}
            {/* <Button onClick={handleClick} disabled={isGenerating}>
               {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button> */}
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