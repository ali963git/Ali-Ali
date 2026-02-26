import React from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { cn, formatNumber } from '../utils/helpers';

const MARKETS = [
  { symbol: 'BTC/USDT', price: 65432.50, change: 2.45, volume: '1.2B' },
  { symbol: 'ETH/USDT', price: 3450.20, change: -1.20, volume: '800M' },
  { symbol: 'SOL/USDT', price: 150.40, change: 5.67, volume: '450M' },
  { symbol: 'BNB/USDT', price: 580.12, change: 0.45, volume: '200M' },
  { symbol: 'ADA/USDT', price: 0.45, change: -2.34, volume: '120M' },
  { symbol: 'XRP/USDT', price: 0.62, change: 1.12, volume: '300M' },
  { symbol: 'DOT/USDT', price: 7.45, change: -0.89, volume: '80M' },
  { symbol: 'LINK/USDT', price: 18.20, change: 3.45, volume: '150M' },
];

interface MarketListProps {
  onSelect: (symbol: string) => void;
  activeSymbol: string;
}

export const MarketList: React.FC<MarketListProps> = ({ onSelect, activeSymbol }) => {
  return (
    <div className="w-full h-full bg-[#151619] rounded-xl border border-white/5 flex flex-col overflow-hidden">
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            placeholder="Search markets..."
            className="w-full bg-zinc-900 border border-white/5 rounded-lg py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
        
        <div className="flex gap-2">
          {['All', 'Favorites', 'USDT', 'BTC'].map((tab) => (
            <button
              key={tab}
              className={cn(
                "px-3 py-1 text-[10px] font-bold rounded-full transition-all",
                tab === 'USDT' ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 px-4 py-2 text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
          <span>Market</span>
          <span className="text-right">Price / Change</span>
        </div>

        <div className="flex flex-col">
          {MARKETS.map((market) => (
            <div 
              key={market.symbol} 
              onClick={() => onSelect(market.symbol)}
              className={cn(
                "px-4 py-3 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors border-b border-white/2",
                activeSymbol === market.symbol && "bg-white/5 border-l-2 border-l-emerald-500"
              )}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">{market.symbol}</span>
                <span className="text-[10px] text-zinc-500">Vol {market.volume}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-mono text-white">{formatNumber(market.price, 2)}</span>
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-bold",
                  market.change > 0 ? "text-emerald-400" : "text-rose-400"
                )}>
                  {market.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {market.change > 0 ? '+' : ''}{market.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
