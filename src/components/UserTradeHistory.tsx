import React from 'react';
import { UserTrade } from '../types';
import { formatCurrency, cn } from '../utils/helpers';
import { format } from 'date-fns';
import { useWallet } from '../context/WalletContext';

export const UserTradeHistory: React.FC = () => {
  const { userTrades, cancelTrade } = useWallet();

  return (
    <div className="w-full h-full bg-[#151619] rounded-xl border border-white/5 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-white/5 bg-white/2 flex justify-between items-center">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Trade History</h3>
        <div className="flex gap-4">
          <button className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider hover:text-emerald-300 transition-colors">Open Orders</button>
          <button className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider hover:text-zinc-300 transition-colors">Order History</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <table className="w-full text-left text-[11px] font-mono">
          <thead className="text-zinc-600 uppercase sticky top-0 bg-[#151619] z-10">
            <tr>
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">Pair</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium text-right">Price</th>
              <th className="px-4 py-2 font-medium text-right">Status</th>
              <th className="px-4 py-2 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {userTrades.map((trade) => (
              <tr key={trade.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-4 py-2 text-zinc-500">
                  {format(trade.time, 'MM-dd HH:mm')}
                </td>
                <td className="px-4 py-2 text-white font-bold">
                  {trade.pair}
                </td>
                <td className="px-4 py-2">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                    trade.type === 'buy' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                  )}>
                    {trade.type}
                  </span>
                </td>
                <td className="px-4 py-2 text-zinc-300">
                  {trade.amount.toFixed(4)}
                </td>
                <td className="px-4 py-2 text-right text-zinc-300">
                  {trade.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2 text-right">
                  <span className={cn(
                    "text-[10px] font-bold uppercase",
                    trade.status === 'completed' ? "text-emerald-400" : 
                    trade.status === 'pending' ? "text-amber-400" : "text-zinc-500"
                  )}>
                    {trade.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  {trade.status === 'pending' && (
                    <button 
                      onClick={() => cancelTrade(trade.id)}
                      className="text-[10px] text-rose-500 font-bold uppercase tracking-wider hover:text-rose-400 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
