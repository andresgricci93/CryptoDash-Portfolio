import { useEffect, useRef, useState, useReducer } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';
import { useQuery, useQueryClient } from '@tanstack/react-query'; 
import { fetchHistoricalData } from '../../api/charts';
import { useCurrencyStore } from '../../store/currencyStore';
import TimeframeButtons from './TimeFrameButtons';  
import { useLivePrice } from '../../hooks/useLivePrice';


  const initialState = {
    timeframe: 'LIVE',
    phase: 'NEEDS_CHART',
    liveVersion: 0,
  };

function chartReducer(state, action) {
  console.log('Dispatch:', action.type, action.payload);
  
  switch (action.type) {
    case 'CHANGE_TIMEFRAME': {
      const isReturningToLive = action.payload === 'LIVE' && state.timeframe !== 'LIVE';
      return {
        ...state,
        timeframe: action.payload,
        phase: 'NEEDS_CHART',
        liveVersion: isReturningToLive ? state.liveVersion + 1 : state.liveVersion,
      };
    }
    case 'CHART_READY':
      return { ...state, phase: 'NEEDS_DATA' };
      
    case 'DATA_LOADED':
      return { 
        ...state, 
        phase: state.timeframe === 'LIVE' ? 'LISTENING' : 'IDLE' 
      };
      
    default:
      return state;
  }
}





const TradingViewChart = ({coinId, symbol}) => {
  const queryClient = useQueryClient();
  const { convertPrice } = useCurrencyStore();

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  
  const [state, dispatch] = useReducer(chartReducer, initialState);
  const { timeframe, phase, liveVersion } = state;

  const isLiveMode = timeframe === 'LIVE';

  const { liveData, liveHistory, isConnected, error: liveError } = useLivePrice(coinId, symbol, isLiveMode);

  const { data: chartData = [], isLoading, isFetching, error } = useQuery({
    queryKey: ['chart', coinId, timeframe, 'v2'],
    queryFn: () => fetchHistoricalData(coinId, timeframe),
    enabled: !!coinId && timeframe !== 'LIVE',
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    placeholderData: (previousData) => previousData,
  });

  // Prefetch other timeframes in background
  useEffect(() => {
    if (!coinId) return;
    
    const timeframesToPrefetch = ['7D', '30D', '90D', '180D', '1YR'];
    
    timeframesToPrefetch.forEach((tf) => {
      if (tf !== timeframe) {
        queryClient.prefetchQuery({
          queryKey: ['chart', coinId, tf, 'v2'],
          queryFn: () => fetchHistoricalData(coinId, tf),
          staleTime: 2 * 60 * 1000,
        });
      }
    });
  }, [coinId, queryClient, timeframe]);

     // ========== MAIN USEEFFECT - PHASE-BASED CHART LIFECYCLE ==========
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isLive = timeframe === 'LIVE';

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
          visible: !isLive,
          timeVisible: !isLive,
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

      console.log('Chart created, transitioning to NEEDS_DATA');
      dispatch({ type: 'CHART_READY' });
      return;
    }

    // ========== PHASE: NEEDS_DATA ==========
    if (phase === 'NEEDS_DATA' && seriesRef.current) {
      
      if (isLive) {
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
          console.log(` Live history loaded (${uniqueData.length} points, v${liveVersion})`);
          dispatch({ type: 'DATA_LOADED' });
        }
        
      } else {
        if (chartData && chartData.length > 0) {
          const convertedData = chartData.map(item => ({
            ...item,
            value: item.value ? convertPrice(item.value) : convertPrice(item.close)
          }));

          seriesRef.current.setData(convertedData);
          console.log(`Historical data loaded (${convertedData.length} points)`);
          dispatch({ type: 'DATA_LOADED' });
        }
      }
      return;
    }

    // ========== PHASE: LISTENING (LIVE mode only) ==========
    if (phase === 'LISTENING' && isLive && liveData && seriesRef.current) {
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

  }, [phase, timeframe, liveVersion, chartData, liveHistory, liveData, convertPrice]);

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

  const showLoading = (isLiveMode && liveHistory.length === 0) || (isLoading && !chartData.length && !isLiveMode);
  const showError = (error && !isLiveMode) || (isLiveMode && liveError);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <TimeframeButtons 
            timeframe={timeframe} 
            setTimeframe={(tf) => dispatch({ type: 'CHANGE_TIMEFRAME', payload: tf })} 
        />
        {isFetching && !isLiveMode && !isLoading && (
          <div className="text-xs text-gray-400">Updating...</div>
        )}
      </div>
  
      <div className="relative">
        {/* Chart container - SIEMPRE renderizado para que el ref funcione */}
        <div 
          ref={chartContainerRef} 
          className="h-96 bg-gray-900 border border-gray-700 rounded"
        />
        
        {/* Loading overlay */}
        {showLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded">
            <div className="flex flex-col items-center gap-2">
              <div className="text-gray-400">
                {isLiveMode ? 'Connecting to live data...' : 'Loading chart data...'}
              </div>
              {isLiveMode && !isConnected && (
                <div className="text-xs text-gray-500">Establishing WebSocket connection</div>
              )}
            </div>
          </div>
        )}
        
        {/* Error overlay */}
        {showError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded">
            <div className="text-red-400">
              {error?.message || liveError}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingViewChart;
