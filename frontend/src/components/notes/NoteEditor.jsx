import  { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Button from '../common/Button.jsx';
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Underline as UnderlineIcon, 
  Strikethrough as StrikethroughIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Loader
} from 'lucide-react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import History from '@tiptap/extension-history';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { useNotesStore } from '../../store/notesStore.js';
import toast from 'react-hot-toast';


const NoteEditor = ({ editingNote, onCancelEdit }) => {
  
  const { createNote, updateNote,clearEditingNote } = useNotesStore();

  const [activeFormats, setActiveFormats] = useState({
      bold: false,
      italic: false,
      heading: false
    });
  const [title,setTitle] = useState(''); 
  const [tags,setTags] = useState([]);
  const [inputTag,setInputTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const tagsContainerRef = useRef(null);

  
    const editor = useEditor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        Italic,
        Underline,
        Strike,
        History,
        Heading.configure({
          levels: [1, 2, 3],
        }),
        BulletList,
        OrderedList,
        ListItem,
        Blockquote,
        Highlight.configure({
          multicolor: true
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
      ],
      content: '<p>Hello World!</p>',
    })
   
    

    useEffect(() => {

      if (editingNote) {
        
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

  // Horizontal scroll with mouse wheel for tags
  useEffect(() => {
    const container = tagsContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);


    const toggleBold = () => editor?.chain().focus().toggleBold().run();
    const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
    const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
    const toggleStrike = () => editor?.chain().focus().toggleStrike().run();
    const addHeading = (level) => editor?.chain().focus().toggleHeading({ level }).run();
    const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
    const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
    const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run();
    const toggleHighlight = () => editor?.chain().focus().toggleHighlight().run();
    const setTextAlign = (align) => editor?.chain().focus().setTextAlign(align).run();
    const undo = () => editor?.chain().focus().undo().run();
    const redo = () => editor?.chain().focus().redo().run();
 

 
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
              toast.error('Title and content are required');
              return;
            }

            const noteData = {
              title: title.trim(),
              htmlContent: editor.getHTML(),
              textContent: editor.getText(),
              tags: tags
            };

            setIsSaving(true);

            try {
              await createNote(noteData);
              toast.success('Note created successfully!');
              setTitle('');
              setTags([]);
              editor.commands.setContent('<p>Write something...</p>');
              clearEditingNote();
            } catch (error) {
              console.error('Error creating the note:', error);
              toast.error('Failed to create note');
            } finally {
              setIsSaving(false);
            }
         };

      const handleUpdateNote = async () => {
        if (!title.trim() || !editor.getText().trim()) {
           toast.error('Title and content are required');
           return;
        }
          const noteData = {
            title: title.trim(),
            htmlContent: editor.getHTML(),
            textContent: editor.getText(),
            tags: tags
          };
          setIsUpdating(true);
          try {
            await updateNote(editingNote._id, noteData);
            toast.success('Note updated successfully!');
            clearEditingNote();
          } catch (error) {
            console.error("Error updating note:", error);
            toast.error('Failed to update note');
          } finally {
            setIsUpdating(false);
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
              className="w-full p-2 mb-4 bg-white text-black rounded outline-none placeholder-gray-400"
              />
             {/* Toolbar */}
         
              <div className="flex flex-wrap justify-center gap-1 mb-4 p-2 bg-gray-700 rounded">
                {/* Text formatting */}
                <button 
                  onClick={toggleBold}
                  className={`p-2 rounded hover:bg-gray-500 ${
                    editor?.isActive('bold') ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                  }`}
                  title="Bold"
                >
                  <BoldIcon size={16} />
                </button>
                
                <button 
                  onClick={toggleItalic}
                  className={`p-2 rounded hover:bg-gray-500 ${
                    editor?.isActive('italic') ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                  }`}
                  title="Italic"
                >
                  <ItalicIcon size={16} />
                </button>
                
                <button 
                  onClick={toggleUnderline}
                  className={`p-2 rounded hover:bg-gray-500 ${
                    editor?.isActive('underline') ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                  }`}
                  title="Underline"
                >
                  <UnderlineIcon size={16} />
                </button>
                
                <button 
                  onClick={toggleStrike}
                  className={`p-2 rounded hover:bg-gray-500 ${
                    editor?.isActive('strike') ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                  }`}
                  title="Strikethrough"
                >
                  <StrikethroughIcon size={16} />
                </button>

                <div className="w-px h-8 bg-gray-500 mx-1" /> {/* Separator */}

                {/* Headings */}
                <button 
                  onClick={() => addHeading(1)}
                  className={`p-2 rounded hover:bg-gray-500 ${
                    editor?.isActive('heading', { level: 1 }) ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                  }`}
                  title="Heading 1"
                >
                  <Heading1 size={16} />
                </button>
                
                <button 
                  onClick={() => addHeading(2)}
                  className={`p-2 rounded hover:bg-gray-500 ${
                    editor?.isActive('heading', { level: 2 }) ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                  }`}
                  title="Heading 2"
                >
                  <Heading2 size={16} />
                </button>
                
                <button 
                  onClick={() => addHeading(3)}
                  className={`p-2 rounded hover:bg-gray-500 ${
                    editor?.isActive('heading', { level: 3 }) ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                  }`}
                  title="Heading 3"
                >
                  <Heading3 size={16} />
                </button>

                <div className="w-px h-8 bg-gray-500 mx-1" /> {/* Separator */}

                {/* Lists */}
                <button 
                  onClick={toggleBulletList}
                  className={`p-2 rounded hover:bg-gray-500 ${
                    editor?.isActive('bulletList') ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                  }`}
                  title="Bullet List"
                >
                  <List size={16} />
                </button>
                
                <button 
                  onClick={toggleOrderedList}
                  className={`p-2 rounded hover:bg-gray-500 ${
                    editor?.isActive('orderedList') ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                  }`}
                  title="Numbered List"
                >
                  <ListOrdered size={16} />
                </button>
                
                <button 
                  onClick={toggleBlockquote}
                  className={`p-2 rounded hover:bg-gray-500 ${
                    editor?.isActive('blockquote') ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                  }`}
                  title="Quote"
                >
                  <Quote size={16} />
                </button>
                
                <button 
                  onClick={toggleHighlight}
                  className={`p-2 rounded hover:bg-gray-500 ${
                    editor?.isActive('highlight') ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                  }`}
                  title="Highlight"
                >
                  <Highlighter size={16} />
                </button>

                <div className="w-px h-8 bg-gray-500 mx-1" /> {/* Separator */}

                {/* Text Alignment */}
                <button 
                  onClick={() => setTextAlign('left')}
                  className={`p-2 rounded hover:bg-gray-500 ${
                    editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                  }`}
                  title="Align Left"
                >
                  <AlignLeft size={16} />
                </button>
                
                <button 
                  onClick={() => setTextAlign('center')}
                  className={`p-2 rounded hover:bg-gray-500 ${
                    editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                  }`}
                  title="Align Center"
                >
                  <AlignCenter size={16} />
                </button>
                
                <button 
                  onClick={() => setTextAlign('right')}
                  className={`p-2 rounded hover:bg-gray-500 ${
                    editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                  }`}
                  title="Align Right"
                >
                  <AlignRight size={16} />
                </button>
                
                <button 
                  onClick={() => setTextAlign('justify')}
                  className={`p-2 rounded hover:bg-gray-500 ${
                    editor?.isActive({ textAlign: 'justify' }) ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
                  }`}
                  title="Justify"
                >
                  <AlignJustify size={16} />
                </button>

                <div className="w-px h-8 bg-gray-500 mx-1" /> {/* Separator */}

                {/* History */}
                <button 
                  onClick={undo}
                  className="p-2 rounded hover:bg-gray-500 bg-gray-600 text-white"
                  title="Undo"
                >
                  <UndoIcon size={16} />
                </button>
                
                <button 
                  onClick={redo}
                  className="p-2 rounded hover:bg-gray-500 bg-gray-600 text-white"
                  title="Redo"
                >
                  <RedoIcon size={16} />
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
              <div 
                ref={tagsContainerRef}
                className="flex items-center gap-1 p-2 bg-gray-700 rounded h-12 w-full max-w-[160px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-[384px] overflow-x-auto overflow-y-hidden tags-scrollbar-invisible"
              >
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
              <Button 
                onClick={editingNote ? handleUpdateNote : handleCreateNote}
                disabled={isSaving || isUpdating}
                >
                  {( isSaving || isUpdating) ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    editingNote ? "Save Note" : "Create Note"
                  )}
              </Button>
            </div>
            </div>
           </div>
 )
}

export default NoteEditor;