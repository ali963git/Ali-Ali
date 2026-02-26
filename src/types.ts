export interface Market {
  id: string;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface Trade {
  id: string;
  price: number;
  amount: number;
  time: number;
  side: 'buy' | 'sell';
}

export interface PriceData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface UserTrade {
  id: string;
  pair: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  status: 'completed' | 'pending' | 'cancelled';
  time: number;
}

export interface UserBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
  valueUsd: number;
}
