import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

export const useNotesStore = create((set, get) => ({
  
  notes: [],
  isLoading: false,
  error: null,
  searchTerm: "",
  page: 0,
  hasMore: true,

 
createNote: async (noteData) => {
    set({ error: null });
    try {
      const response = await axios.post(`${API_URL}/createNote`, noteData);
      set(state => ({
        notes: [response.data.note, ...state.notes]
      }));
    } catch (error) {
      set({ error: error.response?.data?.message });
    }
},


updateNote: async (noteId, noteData) => {

  try {
   const response = await axios.put(`${API_URL}/updateNote/${noteId}`, noteData);
   set(state => ({
    notes: state.notes.map(note =>
      note._id === noteId ? response.data.note : note
    ),
    error: null,
   }))

  } catch (error) {
   set({error: error.response?.data?.message || "Error updating note"});
   throw error;
  }


},

deleteNote: async (_id) => {

    try {
      const response = await axios.delete(`${API_URL}/deleteNote/${_id}`);
      set(state =>({
        notes: state.notes.filter(note => note._id !== _id),
        error: null,
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || "Error deleting Note", isLoading: false });
      throw error;
    }    
},

setSearchTerm: (term) => {
  set({searchTerm: term});
},

getFilteredNotes: () => {
  const {notes, searchTerm} = get();
  if(!searchTerm.trim()) return notes;

  return notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
},

getAllNotes: async () => {
      set({ isLoading: true, error: null });
      try {
          const response = await axios.get(`${API_URL}/getAllNotes`);
          set({ 
              notes: response.data.notes,
              isLoading: false 
            });
        } catch (error) {
          console.log(" Error fetching notes:", error);
            set({ error: error.response?.data?.message, isLoading: false });
        }
    },
    getNoteById: async (noteId) => {
       try {
         const response = await axios.get(`${API_URL}/getNote/${noteId}`);
         set({ isLoading: false });
         return response.data.note;
       } catch (error) {
           set({
            error: error.repsonse?.data?.message || "Error fetching note",
            isLoading: false
           });
           throw error;
       }

  },  
associateNoteWithCrypto: async (noteId, cryptoId) => {
  try {
    const response = await axios.post(`${API_URL}/associateNote`,{
      noteId,
      cryptoId
    });
    set(state => ({
      notes: state.notes.map(note => note._id === noteId ? response.data.note : note
      ),
      error: null
    }))

    return response.data;
  } catch (error) {
     set({ error: error.response?.data?.message });
     throw error;
  }
}
}));