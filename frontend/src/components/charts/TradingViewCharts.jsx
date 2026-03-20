import { useEffect, useRef, useReducer } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';
import { useCurrencyStore } from '../../store/currencyStore';
import LiveIndicator from './TimeFrameButtons';
import { useLivePrice } from '../../hooks/useLivePrice';


const initialState = {
  phase: 'NEEDS_CHART',
  liveVersion: 0,
};

function chartReducer(state, action) {
  switch (action.type) {
    case 'CHART_READY':
      return { ...state, phase: 'NEEDS_DATA' };
    case 'DATA_LOADED':
      return { ...state, phase: 'LISTENING' };
    default:
      return state;
  }
}





const TradingViewChart = ({coinId, symbol}) => {
  const { convertPrice } = useCurrencyStore();

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  
  const [state, dispatch] = useReducer(chartReducer, initialState);
  const { phase, liveVersion } = state;

  const { liveData, liveHistory, isConnected, error: liveError } = useLivePrice(coinId, symbol, true);

  // ========== MAIN USEEFFECT - PHASE-BASED CHART LIFECYCLE ==========
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // ========== PHASE: NEEDS_CHART ==========
    if (phase === 'NEEDS_CHART') {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }

      const chart = createChart(chartContainerRef.current, {
        autoSize: true,
        height: 400,
        layout: {
          background: { color: '#1a1a1a' },
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { visible: false },
        },
        timeScale: {
          rightOffset: 0,
          visible: false,
          timeVisible: false,
          borderVisible: false,
        },
      });

      chartRef.current = chart;

      const series = chart.addSeries(AreaSeries, {
        color: '#2962FF',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
        crosshairMarkerVisible: true,
      });

      series.applyOptions({
        lineColor: '#2962FF',
        topColor: 'rgba(41, 98, 255, 0.4)',
        bottomColor: 'rgba(41, 98, 255, 0.0)',
      });

      seriesRef.current = series;
      dispatch({ type: 'CHART_READY' });
      return;
    }

    // ========== PHASE: NEEDS_DATA ==========
    if (phase === 'NEEDS_DATA' && seriesRef.current) {
      if (liveHistory.length > 0) {
        const uniqueData = [];
        const seenTimes = new Set();

        for (const item of liveHistory) {
          if (!seenTimes.has(item.time)) {
            seenTimes.add(item.time);
            uniqueData.push({
              time: item.time,
              value: convertPrice(item.value),
            });
          }
        }

        uniqueData.sort((a, b) => a.time - b.time);
        seriesRef.current.setData(uniqueData);
        dispatch({ type: 'DATA_LOADED' });
      }
      return;
    }

    // ========== PHASE: LISTENING ==========
    if (phase === 'LISTENING' && liveData && seriesRef.current) {
      try {
        const pricePoint = {
          time: liveData.time,
          value: convertPrice(liveData.price),
        };
        seriesRef.current.update(pricePoint);
      } catch (err) {
        if (!err.message?.includes('data must be asc ordered')) {
          console.error('Error updating live point:', err);
        }
      }
    }

  }, [phase, liveVersion, liveHistory, liveData, convertPrice]);

  // ========== CLEANUP ON UNMOUNT ONLY ==========
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      seriesRef.current = null;
    };
  }, []);

  const showLoading = liveHistory.length === 0;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <LiveIndicator isConnected={isConnected} />
      </div>
  
      <div className="relative">
        <div 
          ref={chartContainerRef} 
          className="h-96 bg-gray-900 border border-gray-700 rounded"
        />
        
        {showLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded">
            <div className="flex flex-col items-center gap-2">
              <div className="text-gray-400">Connecting to live data...</div>
              {!isConnected && (
                <div className="text-xs text-gray-500">Establishing WebSocket connection</div>
              )}
            </div>
          </div>
        )}
        
        {liveError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded">
            <div className="text-red-400">{liveError}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingViewChart;
