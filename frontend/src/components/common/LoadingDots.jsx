const LoadingDots = ({ text = "Loading...", color = "bg-white" }) => {
    return (
      <div className="flex-1 relative z-10 flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            <span className={`w-4 h-4 ${color} rounded-full animate-bounce [animation-delay:-0.3s]`}></span>
            <span className={`w-4 h-4 ${color} rounded-full animate-bounce [animation-delay:-0.15s]`}></span>
            <span className={`w-4 h-4 ${color} rounded-full animate-bounce`}></span>
          </div>
          <span className="text-white text-lg">{text}</span>
        </div>
      </div>
    );
  };
  
  export default LoadingDots;