import  { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Button from '../common/Button.jsx';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Heading from '@tiptap/extension-heading';
import { useNotesStore } from '../../store/notesStore.js';


const NoteEditor = ({ editingNote, onCancelEdit }) => {
  
  const { createNote, updateNote } = useNotesStore();

  const [activeFormats, setActiveFormats] = useState({
      bold: false,
      italic: false,
      heading: false
    });
  const [title,setTitle] = useState(''); 
  const [tags,setTags] = useState([]);
  const [inputTag,setInputTag] = useState('');


  
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Heading.configure({
     levels: [1, 2, 3],
   }),
    ],
    content: '<p>Hello World!</p>',
 })
   

useEffect(() => {
  
    if (editingNote) {
        console.log("Objeto completo editingNote:", editingNote);
        console.log("Propiedades:", Object.keys(editingNote));
      setTitle(editingNote.title);
      
      const noteTags = editingNote.tags || [];
      setTags(noteTags.map(tag => {

        if (typeof tag === 'object' && tag.color) {
          return tag; 
        } else {

          return {
            text: typeof tag === 'string' ? tag : tag.text,
            color: getRandomColor()
          };
        }
      }));
      
      if (editor) {
        editor.commands.setContent(editingNote.htmlContent);
      }
    } else {
      
      setTitle('');
      setTags([]);
      
      if (editor) {
        editor.commands.setContent('<p>Write something...</p>');
      }
    }
}, [editingNote, editor]);


   const toggleBold = () => {
     editor.chain().focus().toggleBold().run();
   };
 
   const toggleItalic = () => {
     editor.chain().focus().toggleItalic().run();
   };
 
   const addHeading = () => {
     editor.chain().focus().toggleHeading({ level: 2}).run();
   };
 

 
    const handleAddTag = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (inputTag.trim() && !tags.find(tag => tag.text === inputTag.trim())) {
          const newTag = {
            text: inputTag.trim(),
            color: getRandomColor() // Color is assigned only one time
          };
          setTags([...tags, newTag]);
          setInputTag('');
        }
      }
    };

    const removeTag = (tagToRemove) => {
      setTags(tags.filter(tag => tag.text !== tagToRemove));
    };
    
    const tagColors = [
      'bg-red-500',
      'bg-green-500', 
      'bg-yellow-500',
      'bg-orange-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-cyan-500'
    ];

        const lastColorIndex = useRef(-1);

        const getRandomColor = () => {
          let newIndex;
          do {
            newIndex = Math.floor(Math.random() * tagColors.length);
          } while (newIndex === lastColorIndex.current && tagColors.length > 1);
          
          lastColorIndex.current = newIndex;
          return tagColors[newIndex];
        };

        const handleCreateNote = async () => {
            if (!title.trim() || !editor.getText().trim()) {
              alert("Title and content are required");
              return;
            }

            const noteData = {
              title: title.trim(),
              htmlContent: editor.getHTML(),
              textContent: editor.getText(),
              tags: tags.map(tag => tag.text)
            };

            try {
              await createNote(noteData);
              setTitle('');
              setTags([]);
              editor.commands.setContent('<p>Write something...</p>');
            } catch (error) {
              console.error('Error creating the note:', error);
            }
        };

      const handleUpdateNote = async () => {
        if (!title.trim() || !editor.getText().trim()) {
           alert("Title and content are required");
           return;
        }
          const noteData = {
            title: title.trim(),
            htmlContent: editor.getHTML(),
            textContent: editor.getText(),
            tags: tags.map(tag => tag.text)
          };

          try {
            await updateNote(editingNote._id, noteData);
            onCancelEdit();
          } catch (error) {
            console.error("Error updating note:", error)
          }
      }

 return (
       <div className="w-2/5 bg-gray-900 border-r border-gray-700 p-4 flex flex-col">
             <h3 className="text-white mb-4">
               {editingNote ? "Edit Note" : "Create New Note"}
              </h3>           
             <input 
              type="text"
              placeholder='Title of your note...'
              value={title || ''}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 mb-4 bg-white text-black rounded placeholder-gray-400"
              />
             {/* Toolbar */}
             <div className="flex gap-2 mb-4 p-2 bg-gray-700 rounded">
               <button 
                 onClick={toggleBold}
                 className={`px-3 py-1 rounded hover:bg-gray-500 ${
                   editor.isActive('bold') ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                 }`}
               >
                 B
               </button>
               <button 
                 onClick={toggleItalic}
                 className={`px-3 py-1 rounded hover:bg-gray-500 ${
                   editor.isActive('italic') ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                 }`}
               >
                 I
               </button>
               <button 
                 onClick={addHeading}
                 className={`px-3 py-1 rounded hover:bg-gray-500 ${
                   editor.isActive('heading', { level: 2 }) ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                 }`}
               >
                 H2
               </button>
             </div>
             
             {/* Editor */}
             <div className="bg-white text-black rounded p-4 flex-1 min-h-0 overflow-y-auto chat-scrollbar">
               <EditorContent
                    key={editingNote ? editingNote._id : 'create'} 
                    editor={editor} 
                    className="h-full" 
               />
             </div>
            <div className='flex justify-between items-center mt-4'>

            <div className="flex items-center min-w-0 flex-1">
              <span className="text-white mr-2 flex-shrink-0">Tags:</span>
              <div className="flex items-center gap-1 p-2 bg-gray-700 rounded h-12 w-full max-w-[160px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-[384px] overflow-x-auto overflow-y-hidden custom-scrollbar">
                {/* Chips */}
                {tags.map((tag, index) => (
                  <span key={index} className={`${tag.color} text-white px-2 py-1 rounded text-sm flex items-center gap-1 flex-shrink-0`}>
                    {tag.text}
                    <button 
                      onClick={() => removeTag(tag.text)}
                      className="text-white hover:text-red-300 text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
                
                {/* Input real */}
                <input 
                  type="text"
                  value={inputTag}
                  onChange={(e) => setInputTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="bg-transparent text-white outline-none min-w-[60px] flex-shrink-0"
                  placeholder={tags.length === 0 ? "crypto, analysis..." : ""}
                />
              </div>
            </div>
            <div className="flex gap-2 ml-2">
              {editingNote && (
                <Button 
                  onClick={onCancelEdit}
                  variant="dangerGhost"
                >
                  Cancel
                </Button>
              )}
              <Button onClick={editingNote ? handleUpdateNote : handleCreateNote}>
                {editingNote ? "Save Note" : "Create Note"}
              </Button>
            </div>
            </div>
           </div>
 )
}

export default NoteEditor;