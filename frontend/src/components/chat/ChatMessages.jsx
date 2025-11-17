import ReactMarkdown from 'react-markdown';


const WELCOME_MESSAGE = {
    role: "assistant",
    content: "Hi, how can i assist you today? "
}

const ChatMessages = ({ messages }) => {
    
    const processMarkdown = (text) => {
      // Remove GIF tags
      let processed = text.replace(/\[GIF:\w+(-\w+)*\]/gi, '').trim();
      // Ensure ** are properly formatted for markdown
      return processed;
    };


    return (
      <div className="flex flex-col gap-2 text-black h-full p-2 overflow-y-auto bg-white rounded">
        {[WELCOME_MESSAGE, ...messages].map(({ role, content }, index) => (
          <div
            key={index}
            className={`w-[90%] px-4 py-4 rounded-[10px] text-sm ${
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
                      href={href} 
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
              
              {role === 'assistant' && content.includes('[GIF:') && (
                <GifRenderer text={content} />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  export default ChatMessages