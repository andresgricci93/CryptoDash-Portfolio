

const WELCOME_MESSAGE = {
    role: "assistant",
    content: "Hi, how can i assist you today? "
}

const ChatMessages = ({ messages }) => {
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
            {content}
          </div>
        ))}
      </div>
    );
  }
  
  export default ChatMessages