import { useEffect, useRef, useState } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';
import { useQuery, useQueryClient } from '@tanstack/react-query'; 
import { fetchHistoricalData } from '../../api/charts';
import { useCurrencyStore } from '../../store/currencyStore';
import TimeframeButtons from './TimeFrameButtons';  
import { useLivePrice } from '../../hooks/useLivePrice';

const TradingViewChart = ({coinId, symbol}) => {
  const queryClient = useQueryClient();
  const { convertPrice, selectedCurrency, getCurrencySymbol } = useCurrencyStore();

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  
  const [timeframe, setTimeframe] = useState('LIVE');

  const isLiveMode = timeframe === 'LIVE';

  const { liveData, liveHistory, isConnected, error: liveError } = useLivePrice(coinId, symbol, isLiveMode);

  const { data: chartData = [], isLoading, isFetching, error } = useQuery({
    queryKey: ['chart', coinId, timeframe, 'v2'],
    queryFn: () => fetchHistoricalData(coinId, timeframe),
    enabled: !!coinId && timeframe !== 'LIVE',
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 2 * 60 * 1000, // Refetch cada 2 minutos
    placeholderData: (previousData) => previousData,
  });

  // Prefetch otros timeframes en background
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

  // CREAR Y MANTENER EL CHART
  useEffect(() => {
    if (!chartContainerRef.current) return;

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
        visible: !isLiveMode,
        timeVisible: !isLiveMode,
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

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      seriesRef.current = null;
    };
  }, [timeframe]); // Solo recrear cuando cambia timeframe

  // CARGAR DATOS HISTÓRICOS (no-live)
  useEffect(() => {
    if (isLiveMode || !seriesRef.current || !chartData || chartData.length === 0) return;
    
    const convertedData = chartData.map(item => ({
      ...item,
      value: item.value ? convertPrice(item.value) : convertPrice(item.close)
    }));
    
    seriesRef.current.setData(convertedData);
  }, [chartData, isLiveMode]);

  // CARGAR LIVE HISTORY (cuando llega por primera vez)
  useEffect(() => {
    if (!isLiveMode || !seriesRef.current || liveHistory.length === 0) return;
    
    // Filtrar duplicados y ordenar
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
  }, [isLiveMode, liveHistory.length]); // Ejecutar cuando liveHistory.length cambia

  // ACTUALIZAR CON NUEVOS PUNTOS LIVE
  useEffect(() => {
    if (!isLiveMode || !liveData || !seriesRef.current) return;
    
    try {
      const pricePoint = {
        time: liveData.time,
        value: convertPrice(liveData.price),
      };
      seriesRef.current.update(pricePoint);
    } catch (err) {
      // Silenciar errores de timestamps duplicados
      if (!err.message?.includes('data must be asc ordered')) {
        console.error('Error updating:', err);
      }
    }
  }, [liveData]);

  const showLoading = (isLiveMode && liveHistory.length === 0) || (isLoading && !chartData.length && !isLiveMode);
  const showError = (error && !isLiveMode) || (isLiveMode && liveError);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <TimeframeButtons timeframe={timeframe} setTimeframe={setTimeframe} />
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
