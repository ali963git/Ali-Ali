import React, { useMemo } from 'react';
import { OrderBookEntry } from '../types';
import { formatNumber } from '../utils/helpers';

interface OrderBookProps {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  currentPrice: number;
}

export const OrderBook: React.FC<OrderBookProps> = ({ bids, asks, currentPrice }) => {
  const maxAskTotal = useMemo(() => Math.max(...asks.slice(0, 12).map(a => a.total), 1), [asks]);
  const maxBidTotal = useMemo(() => Math.max(...bids.slice(0, 12).map(b => b.total), 1), [bids]);

  return (
    <div className="w-full h-full bg-[#151619] rounded-xl border border-white/5 flex flex-col overflow-hidden shadow-2xl">
      <div className="p-3 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Order Book</h3>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 animate-pulse" />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0 text-[10px] font-mono">
        <div className="grid grid-cols-3 px-4 py-2 text-zinc-600 uppercase font-bold tracking-wider border-b border-white/5">
          <span>Price</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Total</span>
        </div>

        {/* Asks (Sells) */}
        <div className="flex flex-col-reverse overflow-hidden">
          {asks.slice(0, 12).map((ask, i) => (
            <div key={i} className="relative grid grid-cols-3 px-4 py-1 hover:bg-white/[0.03] group cursor-pointer transition-colors">
              <div 
                className="absolute inset-y-0 right-0 bg-gradient-to-l from-rose-500/[0.15] to-transparent transition-all duration-500 ease-out" 
                style={{ width: `${(ask.total / maxAskTotal) * 100}%` }}
              />
              <span className="text-rose-400 font-bold z-10">{formatNumber(ask.price, 2)}</span>
              <span className="text-right text-zinc-300 z-10">{formatNumber(ask.amount, 4)}</span>
              <span className="text-right text-zinc-500 z-10">{formatNumber(ask.total, 2)}</span>
            </div>
          ))}
        </div>

        {/* Current Price Highlight */}
        <div className="px-4 py-4 bg-emerald-500/[0.03] flex items-center justify-between border-y border-emerald-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.05] to-transparent opacity-50" />
          <div className="flex items-baseline gap-2 z-10">
            <span className="text-xl font-black text-emerald-400 tracking-tighter drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
              {formatNumber(currentPrice, 2)}
            </span>
            <span className="text-[10px] text-emerald-500/60 font-bold">USD</span>
          </div>
          <div className="flex flex-col items-end z-10">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Spread</span>
            <span className="text-[10px] text-zinc-300 font-mono">0.01%</span>
          </div>
        </div>

        {/* Bids (Buys) */}
        <div className="flex flex-col overflow-hidden">
          {bids.slice(0, 12).map((bid, i) => (
            <div key={i} className="relative grid grid-cols-3 px-4 py-1 hover:bg-white/[0.03] group cursor-pointer transition-colors">
              <div 
                className="absolute inset-y-0 right-0 bg-gradient-to-l from-emerald-500/[0.15] to-transparent transition-all duration-500 ease-out" 
                style={{ width: `${(bid.total / maxBidTotal) * 100}%` }}
              />
              <span className="text-emerald-400 font-bold z-10">{formatNumber(bid.price, 2)}</span>
              <span className="text-right text-zinc-300 z-10">{formatNumber(bid.amount, 4)}</span>
              <span className="text-right text-zinc-500 z-10">{formatNumber(bid.total, 2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
