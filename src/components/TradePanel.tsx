import React, { useState, useMemo } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn, formatNumber } from '../utils/helpers';
import { useWallet } from '../context/WalletContext';
import { UserTrade } from '../types';

interface TradePanelProps {
  currentPrice: number;
  symbol: string;
}

export const TradePanel: React.FC<TradePanelProps> = ({ currentPrice, symbol }) => {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [price, setPrice] = useState(currentPrice.toString());
  const [amount, setAmount] = useState('');
  const { balances, updateBalance, addTrade } = useWallet();

  const [baseAsset, quoteAsset] = symbol.split('/');

  const availableBalance = useMemo(() => {
    const assetToFind = side === 'buy' ? quoteAsset : baseAsset;
    const balance = balances.find(b => b.asset === assetToFind);
    return balance ? balance.free : 0;
  }, [balances, side, baseAsset, quoteAsset]);

  const handleTrade = () => {
    const tradeAmount = parseFloat(amount);
    if (isNaN(tradeAmount) || tradeAmount <= 0) return;

    const tradePrice = orderType === 'market' ? currentPrice : parseFloat(price);
    if (isNaN(tradePrice) || tradePrice <= 0) return;

    const totalCost = tradeAmount * tradePrice;

    const newTrade: UserTrade = {
      id: Math.random().toString(36).substr(2, 9),
      pair: symbol,
      type: side,
      amount: tradeAmount,
      price: tradePrice,
      status: orderType === 'market' ? 'completed' : 'pending',
      time: Date.now(),
    };

    if (side === 'buy') {
      if (totalCost > availableBalance) {
        alert('Insufficient balance');
        return;
      }
      
      if (orderType === 'market') {
        // Execute Buy: Decrease Quote Free, Increase Base Free
        updateBalance(quoteAsset, -totalCost, 'free');
        updateBalance(baseAsset, tradeAmount, 'free');
      } else {
        // Limit Buy: Move Quote from Free to Locked
        updateBalance(quoteAsset, -totalCost, 'free');
        updateBalance(quoteAsset, totalCost, 'locked');
      }
    } else {
      if (tradeAmount > availableBalance) {
        alert('Insufficient balance');
        return;
      }
      
      if (orderType === 'market') {
        // Execute Sell: Decrease Base Free, Increase Quote Free
        updateBalance(baseAsset, -tradeAmount, 'free');
        updateBalance(quoteAsset, totalCost, 'free');
      } else {
        // Limit Sell: Move Base from Free to Locked
        updateBalance(baseAsset, -tradeAmount, 'free');
        updateBalance(baseAsset, tradeAmount, 'locked');
      }
    }

    addTrade(newTrade);
    setAmount('');
    alert(`${orderType === 'market' ? 'Executed' : 'Placed'} ${side} order for ${tradeAmount} ${baseAsset}`);
  };

  return (
    <div className="w-full h-full bg-[#151619] rounded-xl border border-white/5 flex flex-col p-4">
      <div className="flex gap-1 p-1 bg-zinc-900 rounded-lg mb-6">
        <button
          onClick={() => setSide('buy')}
          className={cn(
            "flex-1 py-2 text-sm font-bold rounded-md transition-all",
            side === 'buy' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={cn(
            "flex-1 py-2 text-sm font-bold rounded-md transition-all",
            side === 'sell' ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Sell
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setOrderType('limit')}
          className={cn(
            "text-xs font-medium pb-1 border-b-2 transition-all",
            orderType === 'limit' 
              ? (side === 'buy' ? "text-white border-emerald-500" : "text-white border-rose-500") 
              : "text-zinc-500 border-transparent"
          )}
        >
          Limit
        </button>
        <button
          onClick={() => setOrderType('market')}
          className={cn(
            "text-xs font-medium pb-1 border-b-2 transition-all",
            orderType === 'market' 
              ? (side === 'buy' ? "text-white border-emerald-500" : "text-white border-rose-500") 
              : "text-zinc-500 border-transparent"
          )}
        >
          Market
        </button>
      </div>

      <div className="space-y-4 flex-1">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Price</label>
          <div className="relative">
            <input
              type="text"
              value={orderType === 'market' ? 'Market Price' : price}
              disabled={orderType === 'market'}
              onChange={(e) => setPrice(e.target.value)}
              className={cn(
                "w-full bg-zinc-900 border border-white/5 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none transition-colors font-mono",
                side === 'buy' ? "focus:border-emerald-500/50" : "focus:border-rose-500/50"
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 font-bold uppercase">{quoteAsset}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Amount</label>
          <div className="relative">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={cn(
                "w-full bg-zinc-900 border border-white/5 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none transition-colors font-mono",
                side === 'buy' ? "focus:border-emerald-500/50" : "focus:border-rose-500/50"
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 font-bold uppercase">{baseAsset}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map((pct) => (
            <button 
              key={pct} 
              onClick={() => {
                if (side === 'buy') {
                  const tradePrice = orderType === 'market' ? currentPrice : parseFloat(price);
                  if (tradePrice > 0) {
                    setAmount(((availableBalance * (pct / 100)) / tradePrice).toFixed(6));
                  }
                } else {
                  setAmount((availableBalance * (pct / 100)).toFixed(6));
                }
              }}
              className={cn(
                "py-1.5 bg-zinc-900 border border-white/5 rounded text-[10px] text-zinc-400 transition-colors",
                side === 'buy' ? "hover:bg-emerald-500/10 hover:text-emerald-400" : "hover:bg-rose-500/10 hover:text-rose-400"
              )}
            >
              {pct}%
            </button>
          ))}
        </div>

        <div className="pt-4 space-y-2">
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-500">Available</span>
            <span className="text-zinc-300 font-mono">{availableBalance.toFixed(4)} {side === 'buy' ? quoteAsset : baseAsset}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-500">Est. Total</span>
            <span className="text-zinc-300 font-mono">
              {amount && !isNaN(parseFloat(amount)) ? (parseFloat(amount) * (orderType === 'market' ? currentPrice : parseFloat(price))).toFixed(2) : '0.00'} {quoteAsset}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleTrade}
        className={cn(
          "w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.98]",
          side === 'buy' 
            ? "bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-400" 
            : "bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-400"
        )}
      >
        {side === 'buy' ? `Buy ${baseAsset}` : `Sell ${baseAsset}`}
      </button>
    </div>
  );
};
