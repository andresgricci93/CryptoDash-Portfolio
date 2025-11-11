import {useState, useEffect} from 'react';
import NoteEditor from '@components/notes/NoteEditor.jsx'
import Header from '../components/common/Header';
import NoteList from '../components/notes/NoteList.jsx';
import ChatAI from '../components/chat/ChatAI.jsx'


const NotesPage = () => {

   const [savedNotes, setSavedNotes] = useState([]);
   const [searchTerm, setSearchTerm] = useState('');

   const [editingNote, setEditingNote] = useState(null);

  const handleEditNote = (noteData) => {
    setEditingNote(noteData)
  }
  
  const handleCancelEdit = () => {
    setEditingNote(null);
  }


  return (
   <div className='flex-1 relative z-10 h-screen flex flex-col overflow-hidden'>
      <Header title="Your Notes" />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/5 bg-gray-800 border-r border-gray-700">
          <ChatAI />
        </div>
        <NoteEditor  
           editingNote={editingNote} 
           onCancelEdit={handleCancelEdit}   
        />
      <div className="w-1/5 bg-gray-800">
        <NoteList onEditNote={handleEditNote}/>
      </div>
    </div>
    </div>
  )
}

export default NotesPage