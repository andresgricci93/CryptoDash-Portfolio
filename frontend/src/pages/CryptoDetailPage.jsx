import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/common/Header.jsx';
import { useNotesStore } from '../store/notesStore.js';
import toast from 'react-hot-toast';
import {  ArrowLeft, XIcon} from 'lucide-react';
import Button from '../components/common/Button.jsx';
import NoteCard from '../components/notes/components/NoteCard.jsx';
import SearchBar from '../components/common/Searchbar.jsx'; 
import { AnimatePresence } from 'framer-motion'; 
import DeleteModal from '../components/modals/DeleteModal.jsx';
import {formatMarketCap, formatDate} from '../utils/formatters.js'
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, Package, RefreshCw } from 'lucide-react';
import { useCurrencyStore } from '../store/currencyStore';
import TradingViewChart from '../components/charts/TradingViewCharts.jsx';
import { useQuery } from '@tanstack/react-query';
import { useLivePrice } from '../hooks/useLivePrice.js';
import { fetchCryptoDynamic, fetchCryptoStatic } from '../api/cryptos.js';

const CryptoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [cryptoNotes, setCryptoNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [noteSearchTerm, setNoteSearchTerm] = useState('');
  const [noteToDelete, setNoteToDelete] = useState(null);

  const { getNotesByCrypto, deleteNote } = useNotesStore();
  const { selectedCurrency, convertPrice, formatPrice } = useCurrencyStore();
  const getCurrencySymbol = useCurrencyStore(state => state.getCurrencySymbol);

  const { 
    data: dynamicData, 
    isLoading: isLoadingDynamic,
    error: errorDynamic 
  } = useQuery({
    queryKey: ['crypto-dynamic', id],
    queryFn: () => fetchCryptoDynamic(id),
    staleTime: 1 * 60 * 1000,        
    refetchInterval: 2 * 60 * 1000,  
  });
  
  const { 
    data: staticData,
    isLoading: isLoadingStatic,
    error: errorStatic 
  } = useQuery({
    queryKey: ['crypto-static', id],
    queryFn: () => fetchCryptoStatic(id),
    staleTime: 60 * 60 * 1000,      
    cacheTime: 24 * 60 * 60 * 1000,  
  });

  const { liveData, isConnected } = useLivePrice(id, staticData?.symbol, true);


  useEffect(() => {
    // Buscar el contenedor con scroll (el div principal del Dashboard)
    const mainContent = document.querySelector('.flex-1.overflow-y-auto');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [id]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoadingNotes(true);
        const notes = await getNotesByCrypto(id);
        setCryptoNotes(notes);
      } catch (err) {
        console.error('Error fetching notes:', err);
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [id, getNotesByCrypto]);

  const handleViewNote = (noteId) => {
    navigate(`/notes/${noteId}`);
  };

  const handleDeleteNote = (noteId) => {
    setNoteToDelete(noteId);
  };

  const handleEditNote = (note) => {
    navigate('/notes', { state: { editingNote: note } });
  };

  const handleConfirmDeleteNote = async () => {
    try {
      await deleteNote(noteToDelete);
      setCryptoNotes(prev => prev.filter(note => note._id !== noteToDelete));
      setNoteToDelete(null);
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const isLoading = isLoadingDynamic || isLoadingStatic;
  const error = errorDynamic || errorStatic;
  
  if (isLoading) return <div className="flex items-center justify-center h-screen text-white">Loading crypto details...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error: {error.message}</div>;
  if (!staticData || !dynamicData) return <div className="flex items-center justify-center h-screen text-white">No data available</div>;

  const filteredCryptoNotes = cryptoNotes.filter(note =>
    note.title.toLowerCase().includes(noteSearchTerm.toLowerCase()) ||
    note.textContent.toLowerCase().includes(noteSearchTerm.toLowerCase())
  );

  return (
    <div className='flex-1 relative z-10'>
      <Header title={staticData?.name ? staticData.name + " - Market Overview" : "Crypto Detail"} />
      <main className='w-full py-6 px-4 lg:px-8 xl:px-16 2xl:px-24'>
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-start justify-between gap-4 mb-8 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex gap-6">
            {/* Left Header */}
            <div className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-6">
            <img 
              src={staticData?.image?.large} 
              alt={staticData?.name}
              className="w-20 h-20"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">{staticData?.name}</h1>
              <span className="text-gray-400 uppercase text-lg">{staticData?.symbol}</span>
              
              {/* Contador Live */}
              {liveData && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="text-2xl font-bold text-green-400">
                    {getCurrencySymbol(selectedCurrency)}{" "}{convertPrice(liveData.price).toFixed(2)}
                  </div>

                </div>
              )}
            </div>
          </div>

            {/* Stats derecho: Grid */}
            <div className="flex-1 grid grid-cols-4 gap-4">
              {/* ATH */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-lg mb-2">ATH</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-xl">
                    {dynamicData?.ath ? formatPrice(dynamicData.ath) : 'N/A'}
                  </p>
                  {dynamicData?.ath && <TrendingUp className="text-green-500" size={20} />}
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  {dynamicData?.ath_date ? formatDate(dynamicData.ath_date) : 'No data'}
                </p>
              </div>

              {/* ATL */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-lg mb-2">ATL</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-xl">
                    {dynamicData?.atl ? formatPrice(dynamicData.atl) : 'N/A'}
                  </p>
                  {dynamicData?.atl && <TrendingDown className="text-red-500" size={20} />}
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  {dynamicData?.atl_date ? formatDate(dynamicData.atl_date) : 'No data'}
                </p>
              </div>

              {/* High 24h */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-lg mb-2">High 24h</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-xl">
                    {dynamicData?.high_24h ? formatPrice(dynamicData.high_24h) : 'N/A'}
                  </p>
                  {dynamicData?.high_24h && <ArrowUp className="text-green-500" size={18} />}
                </div>
              </div>

              {/* Low 24h */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-lg mb-2">Low 24h</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-xl">
                    {dynamicData?.low_24h ? formatPrice(dynamicData.low_24h) : 'N/A'}
                  </p>
                  {dynamicData?.low_24h && <ArrowDown className="text-red-500" size={18} />}
                </div>
              </div>

              {/* Market Cap */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-lg mb-2">Market Cap</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-xl">
                    {dynamicData?.market_cap 
                      ? `${getCurrencySymbol(selectedCurrency)} ${formatMarketCap(convertPrice(dynamicData.market_cap))}`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {/* Max Supply */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-lg mb-2">Max Supply</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-xl">
                    {dynamicData?.max_supply_infinite 
                      ? 'Infinite' 
                      : dynamicData?.max_supply 
                        ? formatMarketCap(dynamicData.max_supply) 
                        : 'N/A'
                    }
                  </p>
                </div>
              </div>
              
              {/* Total Supply */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-lg mb-2">Total Supply</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-xl">
                    {dynamicData?.total_supply ? formatMarketCap(dynamicData.total_supply) : 'N/A'}
                  </p>
                  {dynamicData?.total_supply && <Package className="text-white" size={18} />}
                </div>
              </div>

              {/* Circulating Supply */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-lg mb-2">Circulating</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-xl">
                    {dynamicData?.circulating_supply ? formatMarketCap(dynamicData.circulating_supply) : 'N/A'}
                  </p>
                  {dynamicData?.circulating_supply && <RefreshCw className="text-white" size={18} />}
                </div>
              </div> 
            </div>      
          </div>   
        </div>

        <div className='flex flex-row gap-8 mb-8'>
          {/* CHART */}
          <div className="w-2/3 border border-gray-700 rounded-lg">
           <TradingViewChart coinId={id} symbol={staticData?.symbol} />
          </div>

          {/* NOTES */}
          <div className="w-1/3 min-h-[472px] bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-white">
                Notes ({cryptoNotes.length})
              </h2>
            </div>

            <SearchBar 
              size="sm" 
              className="mb-3"
              fullWidth={true}
              placeholder="Search notes..."
              value={noteSearchTerm}
              onChange={(e) => setNoteSearchTerm(e.target.value)}
            />
            
            {loadingNotes ? (
              <div className="text-gray-400 text-center py-4">Loading notes...</div>
            ) : filteredCryptoNotes.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                <p>No notes for {staticData?.name} yet.</p>
                <p className="text-sm mt-2">Create your first note!</p>
              </div>
            ) : (
              <div className="h-[325px] overflow-y-auto custom-scrollbar pr-1">
                <AnimatePresence initial={false}>
                  {filteredCryptoNotes.map(note => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onDelete={handleDeleteNote}
                      onEdit={handleEditNote}
                      onView={handleViewNote}
                      draggable={false}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            <AnimatePresence>
              {noteToDelete !== null && (
                <DeleteModal
                  isOpen={noteToDelete !== null}
                  onClose={() => setNoteToDelete(null)}
                  onConfirm={handleConfirmDeleteNote}
                  title="Are you sure you want to delete this note?"
                  description="This decision is permanent."
                  confirmText="Delete"
                  cancelText="Cancel"
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {staticData?.description?.en && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">About {staticData.name}</h2>
            <div 
              className="prose prose-invert max-w-none text-gray-300"
              dangerouslySetInnerHTML={{ __html: staticData.description.en }}
            />
          </div>
        )}

        {staticData?.links && (
          <div className="mb-8 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">Links</h2>
            <div className="flex flex-wrap gap-3">
              
              {staticData.links.homepage?.[0] && (
                <Button 
                  href={staticData.links.homepage[0]} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  variant="primary"
                >
                  Website
                </Button>
              )}
              
              {staticData.links.whitepaper && (
                <Button 
                  href={staticData.links.whitepaper} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  variant="primary"
                >
                  📄 Whitepaper
                </Button>
              )}
              
              {staticData.links.blockchain_site && staticData.links.blockchain_site.length > 0 && (
                <div className="w-full">
                  <h3 className="text-lg font-medium text-white mb-2">Block Explorers</h3>
                  <div className="flex flex-wrap gap-2">
                    {staticData.links.blockchain_site.slice(0, 4).map((site, index) => {
                      let siteName;
                      try {
                        const url = new URL(site);
                        siteName = url.hostname.replace('www.', '').split('.')[0];
                        siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
                      } catch {
                        siteName = `Explorer ${index + 1}`;
                      }
                      
                      return (
                        <Button
                          key={index}
                          href={site}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="primary"
                        >
                          {siteName}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {staticData.links.official_forum_url && staticData.links.official_forum_url.length > 0 && (
                staticData.links.official_forum_url.map((forumUrl, index) => (
                  <Button
                    key={index}
                    href={forumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="primary"
                  >
                    💬 Forum
                  </Button>
                ))
              )}

              <div className="w-full">
                <h3 className="text-lg font-medium text-white mb-2">Socials</h3>
                <div className="flex flex-wrap gap-2"> 
                  {staticData.links.twitter_screen_name && (
                    <Button 
                      href={`https://x.com/${staticData.links.twitter_screen_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="primary"
                    >
                      <XIcon size={16} className='mt-1'/> 
                    </Button>
                  )}

                  {staticData.links.subreddit_url && (
                    <Button 
                      href={staticData.links.subreddit_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="primary"
                    >
                      💬 Reddit
                    </Button>
                  )}
                </div>
              </div> 
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {staticData?.metadata?.genesis_date && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <span className="text-gray-400 text-sm">Genesis Date</span>
              <p className="text-white font-semibold mt-1">{staticData.metadata.genesis_date}</p>
            </div>
          )}
          
          {staticData?.metadata?.hashing_algorithm && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <span className="text-gray-400 text-sm">Algorithm</span>
              <p className="text-white font-semibold mt-1">{staticData.metadata.hashing_algorithm}</p>
            </div>
          )}

          {staticData?.metadata?.block_time_in_minutes && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <span className="text-gray-400 text-sm">Block Time</span>
              <p className="text-white font-semibold mt-1">{staticData.metadata.block_time_in_minutes} min</p>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-8 text-center">
          Data provided by <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">CoinGecko</a>
        </div>

      </main>
    </div>
  );
};

export default CryptoDetailPage;