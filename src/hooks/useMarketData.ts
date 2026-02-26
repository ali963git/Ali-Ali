import { useState, useEffect, useCallback, useRef } from 'react';
import { Market, PriceData, OrderBookEntry, Trade } from '../types';

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';
const BINANCE_REST_URL = 'https://api.binance.com/api/v3';

export const useMarketData = (symbol: string = 'BTC/USDT', interval: string = '1m') => {
  const [price, setPrice] = useState(0);
  const [allPrices, setAllPrices] = useState<Record<string, number>>({
    'BTC': 65000,
    'ETH': 3400,
    'SOL': 150,
    'USDT': 1
  });
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookEntry[], asks: OrderBookEntry[] }>({ bids: [], asks: [] });
  const [trades, setTrades] = useState<Trade[]>([]);
  const ws = useRef<WebSocket | null>(null);

  const binanceSymbol = symbol.replace('/', '').toLowerCase();

  // Fetch all prices for balance calculation
  useEffect(() => {
    const fetchAllPrices = async () => {
      try {
        const response = await fetch(`${BINANCE_REST_URL}/ticker/price`);
        const data = await response.json();
        const priceMap: Record<string, number> = { 'USDT': 1 };
        data.forEach((item: any) => {
          if (item.symbol.endsWith('USDT')) {
            const asset = item.symbol.replace('USDT', '');
            priceMap[asset] = parseFloat(item.price);
          }
        });
        setAllPrices(prev => ({ ...prev, ...priceMap }));
      } catch (error) {
        console.error('Error fetching all prices:', error);
      }
    };
    fetchAllPrices();
    const intervalId = setInterval(fetchAllPrices, 10000); // Update every 10s
    return () => clearInterval(intervalId);
  }, []);

  // Fetch initial historical data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${BINANCE_REST_URL}/klines?symbol=${binanceSymbol.toUpperCase()}&interval=${interval}&limit=100`);
        const data = await response.json();
        const formattedData: PriceData[] = data.map((d: any) => ({
          time: new Date(d[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
          volume: parseFloat(d[5]),
        }));
        setPriceData(formattedData);
        if (formattedData.length > 0) {
          const lastPrice = formattedData[formattedData.length - 1].close;
          setPrice(lastPrice);
          const baseAsset = symbol.split('/')[0];
          setAllPrices(prev => ({ ...prev, [baseAsset]: lastPrice }));
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    const fetchOrderBook = async () => {
      try {
        const response = await fetch(`${BINANCE_REST_URL}/depth?symbol=${binanceSymbol.toUpperCase()}&limit=20`);
        const data = await response.json();
        
        let bidTotal = 0;
        const bids = data.bids.map((b: any) => {
          const amount = parseFloat(b[1]);
          bidTotal += amount;
          return { price: parseFloat(b[0]), amount, total: bidTotal };
        });

        let askTotal = 0;
        const asks = data.asks.map((a: any) => {
          const amount = parseFloat(a[1]);
          askTotal += amount;
          return { price: parseFloat(a[0]), amount, total: askTotal };
        });

        setOrderBook({ bids, asks });
      } catch (error) {
        console.error('Error fetching order book:', error);
      }
    };

    fetchHistory();
    fetchOrderBook();
  }, [binanceSymbol, interval]);

  // WebSocket for real-time updates
  useEffect(() => {
    const connectWS = () => {
      if (ws.current) ws.current.close();

      const socket = new WebSocket(`${BINANCE_WS_URL}/${binanceSymbol}@ticker/${binanceSymbol}@trade/${binanceSymbol}@depth20@100ms`);
      ws.current = socket;

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // Handle Ticker updates (Price)
        if (data.e === '24hrTicker') {
          const newPrice = parseFloat(data.c);
          setPrice(newPrice);
          
          // Update allPrices for real-time balance calculation
          const baseAsset = symbol.split('/')[0];
          setAllPrices(prev => ({ ...prev, [baseAsset]: newPrice }));
          
          setPriceData(current => {
            if (current.length === 0) return current;
            const last = { ...current[current.length - 1] };
            last.close = newPrice;
            last.high = Math.max(last.high, newPrice);
            last.low = Math.min(last.low, newPrice);
            return [...current.slice(0, -1), last];
          });
        }

        // Handle Trade updates
        if (data.e === 'trade') {
          const newTrade: Trade = {
            id: data.t.toString(),
            price: parseFloat(data.p),
            amount: parseFloat(data.q),
            time: data.T,
            side: data.m ? 'sell' : 'buy'
          };
          setTrades(prev => [newTrade, ...prev.slice(0, 19)]);
        }

        // Handle Depth updates
        if (data.bids && data.asks) {
          let bidTotal = 0;
          const bids = data.bids.slice(0, 15).map((b: any) => {
            const amount = parseFloat(b[1]);
            bidTotal += amount;
            return { price: parseFloat(b[0]), amount, total: bidTotal };
          });

          let askTotal = 0;
          const asks = data.asks.slice(0, 15).map((a: any) => {
            const amount = parseFloat(a[1]);
            askTotal += amount;
            return { price: parseFloat(a[0]), amount, total: askTotal };
          });

          setOrderBook({ bids, asks });
        }
      };

      socket.onerror = (error) => console.error('WS Error:', error);
      socket.onclose = () => {
        console.log('WS Closed, retrying...');
        // setTimeout(connectWS, 3000);
      };
    };

    connectWS();

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [binanceSymbol]);

  return { price, priceData, orderBook, trades, allPrices };
};
