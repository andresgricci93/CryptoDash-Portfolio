import { memo } from 'react';
import { Radio } from 'lucide-react';


const timeFrames = [
  { label: '7D', value: '7D' },
  { label: '30D', value: '30D' },
  { label: '90D', value: '90D' },
  { label: '180D', value: '180D' },
  { label: '1YR', value: '1YR' },
  { label: 'Live', value: 'LIVE', icon: Radio }, 
];

const TimeframeButtons = ({ timeframe, setTimeframe }) => {
  return (
    <div className="flex gap-2">
      {timeFrames.map((tf) => (
        <button
          key={tf.value}
          onClick={() => setTimeframe(tf.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            timeframe === tf.value
              ? 'bg-slate-900 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {tf.label}
          {tf.value === 'LIVE' && (
            <div className="w-2 h-2 mt-1 bg-green-400 rounded-full animate-pulse"></div>
          )}
        </button>
      ))}
    </div>
  );
};

export default memo(TimeframeButtons);