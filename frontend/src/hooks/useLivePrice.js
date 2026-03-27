import { useEffect, useState, useRef, useCallback } from 'react';
import { coinIdToBinanceSymbol } from '../utils/coinIdToBinance';
import { fetchBinanceKlines } from '../api/binanceLiveChart';

export const useLivePrice = (coinId, symbol, isEnabled = false) => {
  const [liveData, setLiveData] = useState(null);
  const [liveHistory, setLiveHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const cancelledRef = useRef(false);

  const closeWs = useCallback(() => {
    const ws = wsRef.current;
    if (!ws) return;
    ws.onopen = null;
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;
    ws.close();
    wsRef.current = null;
  }, []);

  useEffect(() => {
    cancelledRef.current = false;

    if (!isEnabled || !coinId || !symbol) {
      closeWs();
      setIsConnected(false);
      setLiveData(null);
      setLiveHistory([]);
      return;
    }

    const binanceSymbol = coinIdToBinanceSymbol(coinId, symbol);

    if (!binanceSymbol) {
      setError(`Live price not available for ${coinId}`);
      return;
    }

    closeWs();

    const initializeLiveMode = async () => {
      try {
        setIsLoadingHistory(true);
        const historical = await fetchBinanceKlines(binanceSymbol, '1m', 240);
        if (cancelledRef.current) return;
        setLiveHistory(historical);
        setIsLoadingHistory(false);

        const wsUrl = `wss://stream.binance.com:9443/ws/${binanceSymbol.toLowerCase()}@ticker`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (cancelledRef.current) { ws.close(); return; }
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          if (cancelledRef.current) return;
          try {
            const data = JSON.parse(event.data);
            const now = Math.floor(Date.now() / 1000);

            setLiveData({
              time: now,
              value: parseFloat(data.c),
              price: parseFloat(data.c),
              priceChange24h: parseFloat(data.p),
              priceChangePercent24h: parseFloat(data.P),
              high24h: parseFloat(data.h),
              low24h: parseFloat(data.l),
              volume24h: parseFloat(data.v),
              timestamp: Date.now(),
            });

            setLiveHistory(prev => {
              const updated = [...prev, { time: now, value: parseFloat(data.c) }];
              return updated.length > 300 ? updated.slice(-300) : updated;
            });
          } catch (err) {
            console.error('Error parsing WebSocket data:', err);
          }
        };

        ws.onerror = () => {
          if (cancelledRef.current) return;
          setError('Connection error');
          setIsConnected(false);
        };

        ws.onclose = () => {
          if (cancelledRef.current) return;
          setIsConnected(false);
        };

        wsRef.current = ws;
      } catch (err) {
        if (cancelledRef.current) return;
        console.error('Error initializing live mode:', err);
        setError('Failed to load historical data');
        setIsLoadingHistory(false);
      }
    };

    initializeLiveMode();

    return () => {
      cancelledRef.current = true;
      closeWs();
      setIsConnected(false);
    };
  }, [coinId, symbol, isEnabled, closeWs]);

  return { liveData, liveHistory, isLoadingHistory, isConnected, error };
};