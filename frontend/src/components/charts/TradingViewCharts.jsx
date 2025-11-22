import { useEffect, useRef, useState } from 'react';
import { createChart, LineSeries, CandlestickSeries, AreaSeries } from 'lightweight-charts';
import { useQuery, useQueryClient } from '@tanstack/react-query'; 
import { fetchHistoricalData } from '../../api/charts';
import { useCurrencyStore } from '../../store/currencyStore';
import TimeframeButtons from './TimeFrameButtons';  
import ChartTypeButtons from './chartTypeButtons';
import { useLivePrice } from '../../hooks/useLivePrice';

const TradingViewChart = ({coinId, symbol}) => {
  const queryClient = useQueryClient(); 
  const { convertPrice, selectedCurrency, getCurrencySymbol } = useCurrencyStore();

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const hasLoadedHistory = useRef(false); 
  const [timeframe, setTimeframe] = useState('30D');
  const [chartType, setChartType] = useState('Line');
  const [tooltipData, setTooltipData] = useState(null);

  const isLiveMode = timeframe === 'LIVE';

  const { liveData, liveHistory, isConnected, error: liveError } = useLivePrice(coinId, symbol, isLiveMode);

  const { data: chartData = [], isLoading, isFetching, error } = useQuery({
    queryKey: ['chart', coinId, timeframe],
    queryFn: () => fetchHistoricalData(coinId, timeframe),
    enabled: !!coinId && timeframe !== 'LIVE',
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });


  useEffect(() => {
    if (isLiveMode && chartType !== 'Line') {
      setChartType('Line');
    }
  }, [isLiveMode, chartType]);


  useEffect(() => {
    const timeframesToPrefetch = ['7D', '30D', '90D', '180D', '1YR'];
    
    timeframesToPrefetch.forEach((tf) => {
      if (tf !== timeframe) {
        queryClient.prefetchQuery({
          queryKey: ['chart', coinId, tf],
          queryFn: () => fetchHistoricalData(coinId, tf),
          staleTime: 5 * 60 * 1000,
        });
      }
    });
  }, [coinId, queryClient, timeframe]);


  useEffect(() => {
    if (!chartContainerRef.current) return;

    const timeoutId = setTimeout(() => {
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
      
      let series;

      if (chartType === 'Line') {
        series = chart.addSeries(AreaSeries, {
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
      } else {
        series = chart.addSeries(CandlestickSeries, {
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          borderUpColor: '#26a69a',      
          borderDownColor: '#ef5350', 
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
          wickVisible: true,
        });
      }

      seriesRef.current = series;

      // Solo cargar chartData si NO es Live mode
      if (!isLiveMode && chartData && chartData.length > 0) {
        const convertedData = chartData.map(item => ({
          ...item,
          open: item.open ? convertPrice(item.open) : undefined,
          high: item.high ? convertPrice(item.high) : undefined,
          low: item.low ? convertPrice(item.low) : undefined,
          close: item.close ? convertPrice(item.close) : undefined,
          value: item.value ? convertPrice(item.value) : convertPrice(item.close)
        }));
        series.setData(convertedData);
      }
      
      chart.subscribeCrosshairMove((param) => {
        if (!param.time || !param.seriesData.get(series)) {
          setTooltipData(null);
          return;
        }
        
        const data = param.seriesData.get(series);
        setTooltipData(data);
      });

    }, 100);
  
    return () => {
      clearTimeout(timeoutId);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      seriesRef.current = null;
    };
  
  }, [timeframe, chartType, chartData, isLiveMode, selectedCurrency, convertPrice]);


  useEffect(() => {
    if (!isLiveMode || !liveData || !seriesRef.current) return;
    
    try {
      const pricePoint = {
        time: liveData.time,
        value: convertPrice(liveData.price),
      };
      
      seriesRef.current.update(pricePoint);
    } catch (err) {
      console.error('Error updating live chart:', err);
    }
  }, [liveData, isLiveMode, convertPrice]);

  useEffect(() => {
    if (!isLiveMode || !seriesRef.current || liveHistory.length === 0 || hasLoadedHistory.current) return;
    
    try {
      const convertedData = liveHistory.map(item => ({
        time: item.time,
        value: convertPrice(item.value),
      }));
      
      seriesRef.current.setData(convertedData);
      hasLoadedHistory.current = true;
      console.log(`Loaded ${convertedData.length} historical points`);
    } catch (err) {
      console.error('Error loading historical data:', err);
    }
  }, [liveHistory, isLiveMode, convertPrice]);


  useEffect(() => {
    if (!isLiveMode) {
      hasLoadedHistory.current = false;
    }
  }, [isLiveMode]);

  if (isLoading && !chartData.length && !isLiveMode) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 h-[400px] flex items-center justify-center">
        <div className="text-gray-400">Loading chart data...</div>
      </div>
    );
  }

  if (error && !isLiveMode) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 h-[400px] flex items-center justify-center">
        <div className="text-red-400">Error loading chart: {error.message}</div>
      </div>
    );
  }

  if (isLiveMode && liveError) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 h-[400px] flex items-center justify-center">
        <div className="text-yellow-400">{liveError}</div>
      </div>
    );
  }


  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <TimeframeButtons timeframe={timeframe} setTimeframe={setTimeframe} />
        <div className="flex items-center gap-2">
          {isFetching && !isLiveMode && <div className="text-xs text-gray-400">Updating...</div>}
          <ChartTypeButtons chartType={chartType} setChartType={setChartType} isLiveMode={isLiveMode} />
        </div>
      </div>
  
      <div className="relative">
        {tooltipData && chartType === 'Candlestick' && !isLiveMode && (
          <div className="absolute top-4 left-4 bg-gray-900/95 border border-gray-700 rounded px-3 py-2 text-sm z-10 pointer-events-none">
            <div className="text-gray-400">Open: <span className="text-white">{getCurrencySymbol()}{tooltipData.open?.toFixed(2)}</span></div>
            <div className="text-green-500">High: {getCurrencySymbol()}{tooltipData.high?.toFixed(2)}</div>
            <div className="text-red-500">Low: {getCurrencySymbol()}{tooltipData.low?.toFixed(2)}</div>
            <div className="text-gray-400">Close: <span className="text-white">{getCurrencySymbol()}{tooltipData.close?.toFixed(2)}</span></div>
          </div>
        )}

        <div 
          ref={chartContainerRef} 
          className="h-96 bg-gray-900 border border-gray-700 rounded"
        />
      </div>
    </div>
  );
};

export default TradingViewChart;