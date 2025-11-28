import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotesStore } from '../store/notesStore';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Header from '../components/common/Header';
import Button from '../components/common/Button';
import { ArrowLeft, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import CryptoAISummaryModal from '../components/modals/CryptoAISummaryModal';
import toast from 'react-hot-toast';

const NoteDetailPage = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { getNoteById } = useNotesStore();
  
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  // Editor TipTap in read-only mode
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Strike,
      Heading.configure({ levels: [1, 2, 3] }),
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
    editable: false,
    content: '<p>Loading...</p>',
  });

   const handleExportPDF = async () => {
        setPdfLoading(true); 
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/export/pdf/${noteId}`, {
            credentials: 'include' 
            });
            
            if (!response.ok) {
            throw new Error('Failed to generate PDF');
            }
            
            const blob = await response.blob();
            
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
            toast.error('Failed to export PDF');
        } finally {
            setPdfLoading(false);
        }
    };

   const handleExportWord = async () => {
      setWordLoading(true);
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/export/word/${noteId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate Word document');
        }
        
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.title}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        window.URL.revokeObjectURL(url);
        
      } catch (error) {
        console.error('Word export error:', error);
        toast.error('Failed to export Word');
      } finally {
        setWordLoading(false);
      }
    };

    const handleAISummary = async () => {
      setSummaryLoading(true);
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ai-summary/${noteId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate AI summary');
        }
        
        const data = await response.json();
        setAiSummary(data.summary);
        setShowSummaryModal(true);
        
      } catch (error) {
        console.error('AI Summary error:', error);
        toast.error('Failed to generate summary');
      } finally {
        setSummaryLoading(false);
      }
    };

     const handleSummaryExportPDF = async (summaryText) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/export/summary-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            title: `${note.title} - AI Summary`,
            content: summaryText
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate PDF');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.title} - AI Summary.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
      } catch (error) {
        console.error('PDF export error:', error);
        toast.error('Failed to export PDF');
      }
    };

const handleSummaryExportWord = async (summaryText) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/export/summary-word`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: `${note.title} - AI Summary`,
          content: summaryText
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate Word document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title} - AI Summary.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Word export error:', error);
      toast.error('Failed to export Word');
    }
  };

  // Fetch note when noteId changes
  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true);
      
      try {
        const fetchedNote = await getNoteById(noteId);
        setNote(fetchedNote);
      } catch (err) {
        console.error(err);
        toast.error('Note not found');
        navigate('/notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId, getNoteById, navigate]);

  // Update editor content when note changes
  useEffect(() => {
    if (editor && note) {
      editor.commands.setContent(note.htmlContent);
    }
  }, [note, editor]);

  if (loading) return <div className="text-white text-center py-20">Loading note...</div>;
  if (!note) return null;

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
        
        <div className="bg-white text-black rounded-lg p-8 mb-6 h-[600px] overflow-y-auto chat-scrollbar">
          <EditorContent editor={editor} className="prose max-w-none" />
        </div>
        
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {note.tags.map((tag, index) => {
                
                  const tagText = typeof tag === 'string' ? tag : tag.text;
                  const tagColor = typeof tag === 'object' && tag.color ? tag.color : 'bg-blue-500';
                  
                  return (
                    <span 
                      key={index} 
                      className={`${tagColor} text-white px-3 py-1 rounded text-sm`}
                    >
                      {tagText}
                    </span>
                  );
             })}
          </div>
        )}

        <div className="flex justify-between items-center">
        <Button 
          variant="primary" 
          onClick={handleAISummary}
          disabled={summaryLoading}
        >
          {summaryLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            "CryptoAI Summary"
          )}
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
            <Button 
              variant="primary" 
              onClick={handleExportWord}
              disabled={wordLoading}
            >
              {wordLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                "Word"
              )}
            </Button>
        </div>
        </div>
      </main>
      
      <CryptoAISummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        summary={aiSummary}
        originalTitle={note?.title}
        onExportPDF={handleSummaryExportPDF}
        onExportWord={handleSummaryExportWord}
      />
    </div>
  );
};

export default NoteDetailPage;