import { memo } from 'react';

const ChartTypeButtons = ({ chartType, setChartType, isLiveMode = false }) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setChartType('Line')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          chartType === 'Line'
            ? 'bg-slate-900 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        Line
      </button>
      <button
        onClick={() => setChartType('Candlestick')}
        disabled={isLiveMode}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isLiveMode
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
            : chartType === 'Candlestick'
            ? 'bg-slate-900 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        Candlestick
      </button>
    </div>
  );
};

export default memo(ChartTypeButtons);