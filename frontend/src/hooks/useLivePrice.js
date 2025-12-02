import { useEffect, useState, useRef } from 'react';
import { coinIdToBinanceSymbol } from '../utils/coinIdToBinance';
import { fetchBinanceKlines } from '../api/binanceLiveChart';

export const useLivePrice = (coinId, symbol, isEnabled = false) => {
  
  const [liveData, setLiveData] = useState(null);
  const [liveHistory, setLiveHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const hasInitialized = useRef(false);
  const currentCoinRef = useRef(null);

  useEffect(() => {
    const coinKey = `${coinId}-${symbol}`;
    
    if (!isEnabled || !coinId || !symbol) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        setIsConnected(false);
        setLiveData(null);
        setLiveHistory([]);
        hasInitialized.current = false;
        currentCoinRef.current = null;
      }
      return;
    }


    if (hasInitialized.current && currentCoinRef.current === coinKey) {
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const binanceSymbol = coinIdToBinanceSymbol(coinId, symbol);
    
    if (!binanceSymbol) {
      setError(`Live price not available for ${coinId}`);
      console.warn(`No Binance WebSocket support for ${coinId}`);
      return;
    }

    const initializeLiveMode = async () => {
      try {
        // 1. Fetch 240 historical points (4 hours)
        setIsLoadingHistory(true);
        const historical = await fetchBinanceKlines(binanceSymbol, '1m', 240);
        setLiveHistory(historical);
        setIsLoadingHistory(false);

        // 2. Connect WebSocket after loading historical data
        const wsUrl = `wss://stream.binance.com:9443/ws/${binanceSymbol.toLowerCase()}@ticker`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const now = Math.floor(Date.now() / 1000);
            
            const pricePoint = {
              time: now,
              value: parseFloat(data.c),
              price: parseFloat(data.c),
              priceChange24h: parseFloat(data.p),
              priceChangePercent24h: parseFloat(data.P),
              high24h: parseFloat(data.h),
              low24h: parseFloat(data.l),
              volume24h: parseFloat(data.v),
              timestamp: Date.now(),
            };
            
            setLiveData(pricePoint);
            
            // Add to history
            setLiveHistory(prev => {
              const updated = [...prev, { time: now, value: parseFloat(data.c) }];
              // Keep last 300 points (5 hours)
              if (updated.length > 300) {
                return updated.slice(-300);
              }
              return updated;
            });
            
          } catch (err) {
            console.error('Error parsing WebSocket data:', err);
          }
        };

        ws.onerror = (err) => {
          console.error('WebSocket error:', err);
          setError('Connection error');
          setIsConnected(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
        };

        wsRef.current = ws;
        hasInitialized.current = true;
        currentCoinRef.current = coinKey;

      } catch (err) {
        console.error('Error initializing live mode:', err);
        setError('Failed to load historical data');
        setIsLoadingHistory(false);
      }
    };

    initializeLiveMode();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [coinId, symbol, isEnabled]);

  return { liveData, liveHistory, isLoadingHistory, isConnected, error };
};