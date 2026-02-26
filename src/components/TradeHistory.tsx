import React from 'react';
import { Trade } from '../types';
import { formatNumber } from '../utils/helpers';
import { format } from 'date-fns';

interface TradeHistoryProps {
  trades: Trade[];
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({ trades }) => {
  return (
    <div className="w-full h-full bg-[#151619] rounded-xl border border-white/5 flex flex-col overflow-hidden">
      <div className="p-3 border-bottom border-white/5 bg-white/2">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Recent Trades</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto text-[11px] font-mono">
        <div className="grid grid-cols-3 px-3 py-2 text-zinc-600 uppercase sticky top-0 bg-[#151619] z-10">
          <span>Price</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Time</span>
        </div>

        <div className="flex flex-col">
          {trades.map((trade) => (
            <div key={trade.id} className="grid grid-cols-3 px-3 py-1 hover:bg-white/5 transition-colors">
              <span className={trade.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}>
                {formatNumber(trade.price, 2)}
              </span>
              <span className="text-right text-zinc-300">
                {formatNumber(trade.amount, 4)}
              </span>
              <span className="text-right text-zinc-500">
                {format(trade.time, 'HH:mm:ss')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
