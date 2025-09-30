import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotesStore } from '../store/notesStore';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Heading from '@tiptap/extension-heading';
import Header from '../components/common/Header';
import Button from '../components/common/Button';
import { ArrowLeft,  Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const NoteDetailPage = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { getNoteById } = useNotesStore();
  
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  // Editor TipTap in read-only mode
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Heading.configure({ levels: [1, 2, 3] }),
    ],
    editable: false,
    content: '<p>Loading...</p>',
  });

   const handleExportPDF = async () => {
        setPdfLoading(true); 
        console.log('noteId:', noteId); 
        console.log('Full URL:', `http://localhost:5000/api/export/pdf/${noteId}`);
        try {
            const response = await fetch(`http://localhost:5000/api/export/pdf/${noteId}`, {
            credentials: 'include' 
            });
            
            if (!response.ok) {
            throw new Error('Failed to generate PDF');
            }
            
            const blob = await response.blob();
            
            // Crea download automatico
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${note.title}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('PDF export error:', error);
            setError('Failed to export PDF');
        } finally {
            setPdfLoading(false);
        }
    };




  // Fetch note when noteId changes
  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const fetchedNote = await getNoteById(noteId);
        setNote(fetchedNote);
      } catch (err) {
        setError('Note not found');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId, getNoteById]);

  // Update editor content when note changes
  useEffect(() => {
    if (editor && note) {
      editor.commands.setContent(note.htmlContent);
    }
  }, [note, editor]);

  if (loading) return <div className="text-white text-center py-20">Loading note...</div>;
  if (error) return <div className="text-red-500 text-center py-20">Error: {error}</div>;
  if (!note) return <div className="text-white text-center py-20">Note not found</div>;

  return (
    <div className='flex-1 relative z-10'>
      <Header title={note.title} />
      
      <main className='max-w-4xl mx-auto py-6 px-4'>
        <div className='flex justify-between'>
         <Link 
            to="/notes"
            className="flex items-center text-white transition-colors"
            >
           <ArrowLeft className="w-4 h-4 mr-2" />
           Back to Notes
         </Link>
          <div className="text-gray-400 text-sm mb-4">
           <p>Created: {new Date(note.createdAt).toLocaleDateString()}</p>
           <p>Last updated: {new Date(note.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
        {/* Content area */}
        <div className="bg-white text-black rounded-lg p-8 mb-6 min-h-[400px]">
          <EditorContent editor={editor} />
        </div>
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {note.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}


        <div className="flex justify-between items-center">
        <Button variant="primary">
            AI Resume
        </Button>
        
        <div className="flex gap-2">
            <Button 
            variant="primary"            
            onClick={handleExportPDF}
             disabled={pdfLoading}
            >
            {pdfLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
            ) : (
                "PDF"
            )}
            </Button>
            <Button variant="primary">
            Word
            </Button>
        </div>
        </div>
      </main>
    </div>
  );
};

export default NoteDetailPage;