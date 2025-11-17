import { useState } from 'react';
import ChatMessages from "./ChatMessages.jsx";
import Controls from "./Controls";

const ChatAI = () => {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const updateLastMessage = (content) => {
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];
      newMessages[newMessages.length - 1] = {
        ...newMessages[newMessages.length - 1],
        content
      };
      return newMessages;
    });
  };

  const handleContentSend = async (content) => {
    if (!content.trim() || isStreaming) return;
    
    
    addMessage({ content, role: 'user' });
    addMessage({ content: '', role: 'assistant' });
    
    setIsStreaming(true);
    
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/ai/chat`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message: content, limit: 10 }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

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
              
              if (parsed.type === 'text') {
                assistantMessage += parsed.text;

                updateLastMessage(assistantMessage);
              }
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      updateLastMessage("Sorry, I couldn't process your request. Please try again.");
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 bg-gray-900">
      
      <div className="w-full p-2 mb-4 rounded flex items-center justify-center">
        <img 
          className="w-16 h-16" 
          src="/chat-bot.png" 
          alt="AI Chatbot" 
        />
      </div>
      <ChatMessages messages={messages} />
      <Controls onSend={handleContentSend} disabled={isStreaming} />
    </div>
  );
}

export default ChatAI;