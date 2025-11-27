import ReactMarkdown from 'react-markdown';

const MarkdownRenderer = ({ content, className = "" }) => {
  
  const processText = (text) => {
    if (!text) return '';
    return text.trim();
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown 
        components={{
          p: ({children}) => <p className="mb-2">{children}</p>,
          ul: ({children}) => <ul className="ml-4 mb-2 [&>li]:list-none [&_ul>li]:list-disc">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
          li: ({children}) => {
            // Check if content ends with ":"
            const textContent = typeof children === 'string' 
              ? children 
              : children?.props?.children || '';
            const endsWithColon = String(textContent).trim().endsWith(':');
            
            return (
              <li className={`mb-1 ${endsWithColon ? 'list-none' : ''}`}>
                {children}
              </li>
            );
          },
          strong: ({children}) => <strong className="font-bold">{children}</strong>,
          code: ({children}) => <code className="bg-gray-700 px-1 rounded">{children}</code>,
          a: ({href, children}) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {processText(content)}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;