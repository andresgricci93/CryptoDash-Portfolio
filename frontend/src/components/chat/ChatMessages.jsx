import {useRef, useEffect} from 'react';
import ReactMarkdown from 'react-markdown';


const WELCOME_MESSAGE = {
    role: "assistant",
    content: "Hi, how can i assist you today? "
}

/** CoinTelegraph slugs use hyphens; LLMs sometimes emit underscores that 404. */
const normalizeArticleHref = (href) => {
  if (!href || typeof href !== 'string') return href;
  try {
    const url = new URL(href);
    if (url.hostname.includes('cointelegraph.com')) {
      url.pathname = url.pathname.replaceAll('_', '-');
    }
    return url.toString();
  } catch {
    return href;
  }
};

const ChatMessages = ({ messages }) => {
    
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);


    const processMarkdown = (text) => {
      // Remove GIF tags
      let processed = text.replace(/\[GIF:\w+(-\w+)*\]/gi, '').trim();
      // Ensure ** are properly formatted for markdown
      return processed;
    };

    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: 'auto',
          block: 'end'
        });
      }
    }, [messages])


    return (
      <div 
       ref={containerRef}
       className="flex flex-col gap-2 text-black h-full p-2 overflow-y-auto bg-white rounded chat-scrollbar">
        {[WELCOME_MESSAGE, ...messages].map(({ role, content }, index) => (
          <div
            key={index}
            className={`w-[90%] px-4 py-4 rounded-[10px] text-base ${
              role === 'user' 
                ? 'self-end bg-gray-300' 
                : 'bg-[#f3f3f3]'
            }`}
          >
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown 
                components={{
                  p: ({children}) => <p className="">{children}</p>,
                  ul: ({children}) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                  li: ({children}) => <li className="mb-1">{children}</li>,
                  strong: ({children}) => <strong className="font-bold">{children}</strong>,
                  code: ({children}) => <code className="bg-gray-200 px-1 rounded">{children}</code>,
                  a: ({href, children}) => (
                    <a 
                      href={normalizeArticleHref(href)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {processMarkdown(content)}
              </ReactMarkdown>
              
              {/* {role === 'assistant' && content.includes('[GIF:') && (
                <GifRenderer text={content} />
              )} */}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    );
  }
  
  export default ChatMessages