import { useEffect, useState } from 'react';
import ChatMessages from './ChatMessages.jsx';
import Controls from './Controls';
import { useChatStore } from '../../store/chatStore.js';
import { parseRetryDelayMs } from '../../utils/parseRetryDelayMs.js';

const formatChatErrorForUser = (body) => {
  if (!body || typeof body !== 'object') {
    return "Sorry, I couldn't process your request. Please try again.";
  }
  const { status, retryDelay, message, code } = body;
  if (code === 'RATE_LIMIT' || status === 429) {
    const wait = retryDelay
      ? ` Wait before sending again (the provider suggested ~${retryDelay}; free tier often needs longer).`
      : ' Wait a minute before trying again (free tier quota).';
    return `The AI service is rate-limited.${wait}`;
  }
  return message || "Sorry, I couldn't process your request. Please try again.";
};

const ChatAI = () => {
  const [sendBlockedUntil, setSendBlockedUntil] = useState(0);
  const [, bumpCooldownTick] = useState(0);

  const { 
    messages, 
    isStreaming, 
    addMessage, 
    updateLastMessage, 
    setIsStreaming,
    getContextMessages 
  } = useChatStore();

  useEffect(() => {
    if (sendBlockedUntil <= Date.now()) return undefined;
    const intervalId = setInterval(() => {
      bumpCooldownTick((tick) => tick + 1);
      if (Date.now() >= sendBlockedUntil) {
        clearInterval(intervalId);
      }
    }, 500);
    return () => clearInterval(intervalId);
  }, [sendBlockedUntil]);

  const cooldownSeconds =
    sendBlockedUntil > Date.now() ? Math.ceil((sendBlockedUntil - Date.now()) / 1000) : 0;

  const handleContentSend = async (content) => {
    if (!content.trim() || isStreaming || Date.now() < sendBlockedUntil) return;
    
    
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
        body: JSON.stringify({
          message: content,
          conversationHistory: getContextMessages(),
          limit: 20,
        }),
      });

      if (!response.ok) {
        let errBody = {};
        try {
          errBody = await response.json();
        } catch {
          /* non-JSON error body */
        }
        if (errBody.code === 'RATE_LIMIT' || errBody.status === 429) {
          setSendBlockedUntil(Date.now() + parseRetryDelayMs(errBody.retryDelay));
        }
        updateLastMessage(formatChatErrorForUser(errBody));
        setIsStreaming(false);
        return;
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

              if (parsed.type === 'error') {
                if (parsed.code === 'RATE_LIMIT' || parsed.status === 429) {
                  setSendBlockedUntil(Date.now() + parseRetryDelayMs(parsed.retryDelay));
                }
                updateLastMessage(formatChatErrorForUser(parsed));
                setIsStreaming(false);
                return;
              }

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
      updateLastMessage(
        error?.message?.includes('Failed to fetch')
          ? 'Could not reach the server. Check your connection and try again.'
          : "Sorry, I couldn't process your request. Please try again."
      );
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
      <Controls
        onSend={handleContentSend}
        disabled={isStreaming || cooldownSeconds > 0}
        cooldownSeconds={cooldownSeconds}
      />
    </div>
  );
}

export default ChatAI;