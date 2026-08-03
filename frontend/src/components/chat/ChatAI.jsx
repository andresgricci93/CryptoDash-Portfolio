import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ChatMessages from './ChatMessages.jsx';
import Controls from './Controls';
import { useChatStore } from '../../store/chatStore.js';
import {
  CHAT_BOT_IMAGE_PATH,
  chatBotIconQueryKey,
  fetchChatBotIconSrc,
} from '../../api/chatBotIcon.js';
import { parseRetryDelayMs } from '../../utils/parseRetryDelayMs.js';

const INTERRUPTED_NOTICE = '\n\n_(The response was interrupted. Please try again.)_';

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
  if (code === 'STREAM_INTERRUPTED') {
    return message || 'The response was interrupted. Please try again.';
  }
  return message || "Sorry, I couldn't process your request. Please try again.";
};

const ChatAI = () => {
  const [sendBlockedUntil, setSendBlockedUntil] = useState(0);
  const [, bumpCooldownTick] = useState(0);

  const { data: chatBotIconSrc = CHAT_BOT_IMAGE_PATH } = useQuery({
    queryKey: chatBotIconQueryKey,
    queryFn: fetchChatBotIconSrc,
    staleTime: Infinity,
    gcTime: Infinity,
    placeholderData: CHAT_BOT_IMAGE_PATH,
  });

  const { 
    messages, 
    isStreaming, 
    addMessage, 
    updateLastMessage, 
    setIsStreaming,
    getContextMessages,
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
    let assistantMessage = '';
    let sawDone = false;

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
        return;
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
              sawDone = true;
              return;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'error') {
                if (parsed.code === 'RATE_LIMIT' || parsed.status === 429) {
                  setSendBlockedUntil(Date.now() + parseRetryDelayMs(parsed.retryDelay));
                }
                if (parsed.code === 'STREAM_INTERRUPTED' && assistantMessage) {
                  updateLastMessage(assistantMessage + INTERRUPTED_NOTICE);
                } else {
                  updateLastMessage(formatChatErrorForUser(parsed));
                }
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

      // Connection closed without [DONE] (server crash / network drop)
      if (!sawDone && assistantMessage) {
        updateLastMessage(assistantMessage + INTERRUPTED_NOTICE);
      } else if (!sawDone && !assistantMessage) {
        updateLastMessage("Sorry, I couldn't process your request. Please try again.");
      }
    } catch (error) {
      console.error('Error:', error);
      updateLastMessage(
        assistantMessage
          ? assistantMessage + INTERRUPTED_NOTICE
          : error?.message?.includes('Failed to fetch')
            ? 'Could not reach the server. Check your connection and try again.'
            : "Sorry, I couldn't process your request. Please try again."
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 bg-gray-900">
      
      <div className="w-full p-2 mb-4 rounded flex items-center justify-center">
        <img 
          className="w-16 h-16" 
          src={chatBotIconSrc} 
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