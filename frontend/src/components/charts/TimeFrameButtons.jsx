import { memo } from 'react';

const LiveIndicator = ({ isConnected = true }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
      Live
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
      }`} />
    </div>
  );
};

export default memo(LiveIndicator);
