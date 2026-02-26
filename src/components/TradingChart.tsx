import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PriceData } from '../types';
import { formatCurrency, cn } from '../utils/helpers';

interface TradingChartProps {
  data: PriceData[];
  symbol: string;
  interval: string;
  onIntervalChange: (interval: string) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#18181b] border border-[#27272a] p-3 rounded-lg shadow-xl backdrop-blur-md bg-opacity-90">
        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-8">
            <span className="text-[10px] text-zinc-400">Price</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">{formatCurrency(data.close)}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-[10px] text-zinc-400">Volume</span>
            <span className="text-xs font-mono text-white">{data.volume.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-[10px] text-zinc-400">High</span>
            <span className="text-xs font-mono text-zinc-300">{formatCurrency(data.high)}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-[10px] text-zinc-400">Low</span>
            <span className="text-xs font-mono text-zinc-300">{formatCurrency(data.low)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const TradingChart: React.FC<TradingChartProps> = ({ data, symbol, interval, onIntervalChange }) => {
  const stats = useMemo(() => {
    if (data.length === 0) return { change: 0, high: 0, low: 0 };
    
    const firstPrice = data[0].open;
    const lastPrice = data[data.length - 1].close;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    const high = Math.max(...data.map(d => d.high));
    const low = Math.min(...data.map(d => d.low));
    
    return { change, high, low };
  }, [data]);

  return (
    <div className="w-full h-full bg-[#151619] p-4 rounded-xl border border-white/5 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">{symbol}</h2>
          <div className="flex gap-2">
            {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
              <button
                key={tf}
                onClick={() => onIntervalChange(tf)}
                className={cn(
                  "px-2 py-1 text-xs rounded transition-colors",
                  tf === interval ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Range Change</span>
            <span className={cn(
              "text-sm font-mono",
              stats.change >= 0 ? "text-emerald-400" : "text-rose-400"
            )}>
              {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(2)}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Range High</span>
            <span className="text-sm font-mono text-white">{formatCurrency(stats.high).replace('$', '')}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Range Low</span>
            <span className="text-sm font-mono text-white">{formatCurrency(stats.low).replace('$', '')}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#71717a', fontSize: 10 }}
              minTickGap={30}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              orientation="right" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#71717a', fontSize: 10 }}
              tickFormatter={(val) => formatCurrency(val).replace('$', '')}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="close" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              strokeWidth={2}
              isAnimationActive={false}
              activeDot={{ r: 4, fill: '#10b981', stroke: '#0a0b0d', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
