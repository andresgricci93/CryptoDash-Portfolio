import { useNotesStore } from '../../store/notesStore.js';
import { useState,useEffect } from 'react';
import { motion,AnimatePresence } from "framer-motion";

import SearchBar from '../common/Searchbar.jsx';
import DeleteModal from '../modals/DeleteModal.jsx';
import MiniCryptoCard from '../notes/components/MiniCryptoCard.jsx';
import { getNotesCountByCrypto } from '../../utils/noteHelpers.js';
import { useNavigate } from 'react-router-dom';
import { Pencil, Eye } from 'lucide-react';
import toast from "react-hot-toast";
import axios from 'axios';


const NoteList = ({ onEditNote }) => {

  const [favoriteCryptos, setFavoriteCryptos] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const { notes, getAllNotes, isLoading, deleteNote,searchTerm,setSearchTerm,getFilteredNotes } = useNotesStore();
  const { associateNoteWithCrypto } = useNotesStore();
  const navigate = useNavigate();
  const noteCounts = getNotesCountByCrypto(notes);


  useEffect(() => {
    const fetchFavoritesWithData = async () => {
      try {
        await getAllNotes();
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/favorites/details`);
        setFavoriteCryptos(response.data.data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoadingFavorites(false);
      }
    };

    fetchFavoritesWithData();
  }, []);


      const [noteToDelete, setNoteToDelete] = useState(null);
      
      const handleDelete = (noteId) => {
        setNoteToDelete(noteId); 
      };
      
      const handleConfirmDelete = () => {
        deleteNote(noteToDelete);
        setNoteToDelete(null);
      };

      const handleEditMode = (noteId) => {
         onEditNote(noteId);

      };

      const handleDragStart = (e, note) => {
          console.log('Dragging note:', note.title);
          e.dataTransfer.setData('noteId', note._id);
          e.dataTransfer.effectAllowed = 'move';
          
          const dragImage = document.createElement('div');
          dragImage.innerHTML = `
            <div style="
              background-color: #4a5568; 
              padding: 12px 16px; 
              border-radius: 6px; 
              opacity: 0.9;
              transform: rotate(2deg);
              width: 250px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            ">
              <h4 style="color: white; font-weight: 600; margin: 0; font-size: 14px;">${note.title}</h4>
              <p style="color: #cbd5e0; font-size: 12px; margin: 4px 0 0 0;">${note.textContent.substring(0, 40)}...</p>
            </div>
          `;
          
          document.body.appendChild(dragImage);
          dragImage.style.position = 'absolute';
          dragImage.style.top = '-1000px';
          

          e.dataTransfer.setDragImage(dragImage, 0, 0);
          
          setTimeout(() => document.body.removeChild(dragImage), 0);
          e.target.style.opacity = '0.7';
      };
        const handleViewNote = (noteId) => {
         navigate(`/notes/${noteId}`);
        };
   
        const handleNoteDrop = async (noteId, cryptoId) => {
            try {
              await associateNoteWithCrypto(noteId, cryptoId);
              toast.success("Note associated successfully!");
            } catch (error) {

             const errorMessage = error.response?.data?.message || "Failed to associate note";
             toast.error(errorMessage);
            }
        };

     
      const handleDragEnd = (e) => {
        e.target.style.opacity = '1'; 
      };
      
      const filteredNotes = getFilteredNotes();
      console.log(filteredNotes)

  return (
    <div className="p-4">
        <SearchBar 
          size="sm" 
          className="mb-3"
          fullWidth={true}
          onChange={(e) => {setSearchTerm(e.target.value)}}
        />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
        <div className='h-64 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1'>
          <AnimatePresence initial={false}>
            {filteredNotes?.map(note => (
              <motion.div
              key={note._id}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.7 }}
              className="bg-gray-700 p-7 mb-2 rounded relative"
              draggable="true" 
              onDragStart={(e) => handleDragStart(e, note)} 
              onDragEnd={handleDragEnd} 
              >
                <button
                  onClick={() => handleDelete(note._id)}
                  className="absolute top-2 right-4 text-red-400 hover:text-red-300"
                  >
                  ×
                </button>
                <Eye 
                  onClick={() => handleViewNote(note._id)}
                  size={13}
                  className='absolute bottom-4 right-9 cursor-pointer text-white hover:text-blue-300'
                />
                <Pencil 
                onClick={() => handleEditMode(note)}
                size={13}
                className='absolute bottom-4 right-4 cursor-pointer text-white'
                />
                <h4 className="text-white font-semibold">{note.title}</h4>
                <p className="text-gray-300 text-sm">{note.textContent.substring(0, 50)}...</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
         <div className="border-t border-gray-600 my-4"/> 
         <div>
            <h4 className="text-white text-sm font-semibold mb-3">Your Favorites</h4>
            
            {loadingFavorites ? (
              <div className="text-gray-400 text-xs">Loading favorites...</div>
            ) : (
              <div className="flex flex-col gap-1">
                {favoriteCryptos?.map(crypto => (
                  <MiniCryptoCard 
                     key={crypto.id} 
                     crypto={crypto} 
                     onNoteDrop={handleNoteDrop}
                     noteCount={noteCounts[crypto.coinId] || 0}
                     />
                ))}
              </div>
            )}
         </div>
        </>
      )}
      <AnimatePresence>
        {noteToDelete !== null && (
        <DeleteModal
          isOpen={noteToDelete !== null}
          onClose={() => setNoteToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Are you sure you want to delete this note?"
          description="This decision is permanent."
          confirmText="Delete"
          cancelText="No i want to keep it"
        />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NoteList;