import { useNotesStore } from '../../store/notesStore.js';
import { useState, useEffect } from 'react';
import { AnimatePresence } from "framer-motion";
import { DragDropProvider } from '@dnd-kit/react';

import SearchBar from '../common/Searchbar.jsx';
import DeleteModal from '../modals/DeleteModal.jsx';
import MiniCryptoCard from '../notes/components/MiniCryptoCard.jsx';
import DraggableNoteCard from './components/DraggableNoteCard.jsx';
import NoteCardPreview from './components/NoteCardPreview.jsx';
import { getNotesCountByCrypto } from '../../utils/noteHelpers.js';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';


const fetchFavorites = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/favorites/details`);
  return response.data.data;
};


const NoteList = ({ onEditNote }) => {
  const { notes, getAllNotes, isLoading, deleteNote, searchTerm, setSearchTerm, getFilteredNotes } = useNotesStore();
  const { associateNoteWithCrypto } = useNotesStore();
  const navigate = useNavigate();
  const noteCounts = getNotesCountByCrypto(notes);

  const { 
    data: favoriteCryptos = [], 
    isLoading: loadingFavorites 
  } = useQuery({
    queryKey: ['favorites-details'],
    queryFn: fetchFavorites,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    getAllNotes();
  }, [getAllNotes]);

  const [noteToDelete, setNoteToDelete] = useState(null);
  
  const handleDelete = (noteId) => {
    setNoteToDelete(noteId); 
  };
  
  const handleConfirmDelete = () => {
    deleteNote(noteToDelete);
    setNoteToDelete(null);
  };

  const handleEditMode = (note) => {
    onEditNote(note);
  };

  const handleViewNote = (noteId) => {
    navigate(`/notes/${noteId}`);
  };

  const handleDragEnd = async (event) => {
    const { source, target } = event.operation;
    
    if (!target) return;
    
    const noteId = source.id;
    const cryptoId = target.id;
    
    try {
      await associateNoteWithCrypto(noteId, cryptoId);
      toast.success("Note associated successfully!");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to associate note";
      toast.error(errorMessage);
    }
  };

  const filteredNotes = getFilteredNotes();

  return (
    <div className="p-4">
      <SearchBar 
        size="sm" 
        className="mb-3"
        fullWidth={true}
        onChange={(e) => { setSearchTerm(e.target.value) }}
      />
      {isLoading && notes.length === 0 ? (
        <div>Loading...</div>
      ) : (
        <DragDropProvider onDragEnd={handleDragEnd}>
          <div className='h-64 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1'>
            <AnimatePresence initial={false}>
              {filteredNotes?.map(note => (
                <DraggableNoteCard
                  key={note._id}
                  note={note}
                  onDelete={handleDelete}
                  onEdit={handleEditMode}
                  onView={handleViewNote}
                />
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
                    noteCount={noteCounts[crypto.coinId] || 0}
                  />
                ))}
              </div>
            )}
          </div>
        </DragDropProvider>
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
