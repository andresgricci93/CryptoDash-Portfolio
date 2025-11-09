import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader } from 'lucide-react';

const ChatAI = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [metadata, setMetadata] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || isStreaming) return;
  
    setResponse('');
    setMetadata(null);
    setIsStreaming(true);
  
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/ai/chat`;
      
      // LOG 1: Ver la URL
      console.log('📡 API URL:', apiUrl);
      console.log('📝 Mensaje:', message);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message, limit: 3 }),
      });
  
      // LOG 2: Ver el status
      console.log('📊 Status:', response.status);
      console.log('✅ Response OK:', response.ok);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
  
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
  
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
  
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              setIsStreaming(false);
              return;
            }
  
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'metadata') {
                setMetadata(parsed);
              } else if (parsed.type === 'text') {
                setResponse(prev => prev + parsed.text);
              } else if (parsed.type === 'error') {
                console.error('Stream error:', parsed.message);
                setIsStreaming(false);
              }
            } catch (err) {
              console.error('Error parsing JSON:', err);
            }
          }
        }
      }
    } catch (error) {
      console.error('💥 Error completo:', error);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      setResponse('Error al conectar con el chat. Por favor, intentá de nuevo.');
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
          Chat AI RAG
        </h1>
        <p className="text-gray-400 text-xs mt-1">
          Preguntale a la IA sobre tus notas
        </p>
      </div>

      {/* Metadata */}
      {metadata && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-lg p-2 mb-3 flex-shrink-0"
        >
          <p className="text-xs text-gray-400">
            📚 Usando {metadata.notesUsed} nota{metadata.notesUsed !== 1 ? 's' : ''}:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {metadata.noteTitles?.map((note, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300"
              >
                {note.title} ({note.similarity})
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Response Area */}
      <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-4 mb-3 overflow-y-auto min-h-0">
        {response ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-invert max-w-none"
          >
            <pre className="whitespace-pre-wrap font-sans text-gray-200 leading-relaxed text-sm">
              {response}
            </pre>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {isStreaming ? (
              <div className="flex items-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                <span className="text-sm">Generando respuesta...</span>
              </div>
            ) : (
              <p className="text-sm">Hacé una pregunta sobre tus notas...</p>
            )}
          </div>
        )}
      </div>

      {/* Input Form - Fixed at bottom */}
      <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="¿Qué querés saber?"
          disabled={isStreaming}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={isStreaming || !message.trim()}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          {isStreaming ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatAI;