import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Wallet, 
  History, 
  Settings, 
  Bell, 
  User,
  Menu,
  X,
  ChevronDown,
  Activity
} from 'lucide-react';
import { TradingChart } from './components/TradingChart';
import { OrderBook } from './components/OrderBook';
import { TradePanel } from './components/TradePanel';
import { TradeHistory } from './components/TradeHistory';
import { UserTradeHistory } from './components/UserTradeHistory';
import { MarketList } from './components/MarketList';
import { useMarketData } from './hooks/useMarketData';
import { useWallet } from './context/WalletContext';
import { cn, formatCurrency } from './utils/helpers';

export default function App() {
  const [activeSymbol, setActiveSymbol] = useState('BTC/USDT');
  const [interval, setInterval] = useState('1m');
  const [historyTab, setHistoryTab] = useState<'market' | 'user'>('user');
  const { price, priceData, orderBook, trades, allPrices } = useMarketData(activeSymbol, interval);
  const { balances } = useWallet();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const totalBalanceUsd = useMemo(() => {
    return balances.reduce((acc, curr) => {
      const price = allPrices[curr.asset] || 0;
      return acc + (curr.total * price);
    }, 0);
  }, [balances, allPrices]);

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-zinc-300 font-sans selection:bg-emerald-500/30">
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0b0d]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tighter">NEXUS<span className="text-emerald-500">TRADE</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-white hover:text-emerald-400 transition-colors">Exchange</a>
            <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">Markets</a>
            <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">Futures</a>
            <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">Wallet</a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-white/5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Network Stable</span>
          </div>
          <button className="p-2 text-zinc-500 hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0a0b0d]" />
          </button>
          <div className="h-8 w-[1px] bg-white/5 mx-2" />
          <button className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-white/5 rounded-full transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              JD
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <aside className={cn(
          "w-64 border-r border-white/5 bg-[#0a0b0d] flex flex-col transition-all duration-300",
          !isSidebarOpen && "w-20"
        )}>
          <div className="flex-1 py-6 px-4 space-y-2">
            {[
              { icon: LayoutDashboard, label: 'Dashboard', active: true },
              { icon: BarChart3, label: 'Market Analysis' },
              { icon: Wallet, label: 'Portfolio' },
              { icon: History, label: 'Trade History' },
              { icon: Settings, label: 'Settings' },
            ].map((item) => (
              <button
                key={item.label}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                  item.active 
                    ? "bg-emerald-500/10 text-emerald-400" 
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                )}
              >
                <item.icon className={cn("w-5 h-5", item.active ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300")} />
                {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </div>
          
          <div className="p-4 border-t border-white/5">
            <div className={cn(
              "bg-zinc-900 rounded-2xl p-4 transition-all",
              !isSidebarOpen && "p-2"
            )}>
              {isSidebarOpen ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Balance</span>
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div key={totalBalanceUsd} className="text-xl font-bold text-white mb-1 animate-in fade-in slide-in-from-bottom-1 duration-500">
                    {formatCurrency(totalBalanceUsd)}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold">+12.4% this month</div>
                </>
              ) : (
                <Wallet className="w-6 h-6 text-emerald-400 mx-auto" />
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden bg-[#0a0b0d]">
          {/* Left Column: Markets & Order Book */}
          <div className="w-80 flex flex-col border-r border-white/5 gap-4 p-4 overflow-hidden">
            <div className="h-1/2 min-h-0">
              <MarketList onSelect={setActiveSymbol} activeSymbol={activeSymbol} />
            </div>
            <div className="h-1/2 min-h-0">
              <OrderBook bids={orderBook.bids} asks={orderBook.asks} currentPrice={price} />
            </div>
          </div>

          {/* Center Column: Chart & History */}
          <div className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
            <div className="flex-1 min-h-0">
              <TradingChart 
                data={priceData} 
                symbol={activeSymbol} 
                interval={interval} 
                onIntervalChange={setInterval} 
              />
            </div>
            <div className="h-64 min-h-0 flex flex-col gap-2">
              <div className="flex gap-4 px-2">
                <button 
                  onClick={() => setHistoryTab('user')}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest pb-1 border-b-2 transition-all",
                    historyTab === 'user' ? "text-emerald-400 border-emerald-400" : "text-zinc-500 border-transparent hover:text-zinc-300"
                  )}
                >
                  My History
                </button>
                <button 
                  onClick={() => setHistoryTab('market')}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest pb-1 border-b-2 transition-all",
                    historyTab === 'market' ? "text-emerald-400 border-emerald-400" : "text-zinc-500 border-transparent hover:text-zinc-300"
                  )}
                >
                  Market Trades
                </button>
              </div>
              <div className="flex-1 min-h-0">
                {historyTab === 'market' ? (
                  <TradeHistory trades={trades} />
                ) : (
                  <UserTradeHistory />
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Trade Panel */}
          <div className="w-80 p-4 border-l border-white/5">
            <TradePanel currentPrice={price} symbol={activeSymbol} />
          </div>
        </main>
      </div>

      {/* Footer / Status Bar */}
      <footer className="h-8 border-t border-white/5 bg-[#0a0b0d] flex items-center justify-between px-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span>Connected</span>
          </div>
          <span>Latency: 24ms</span>
          <span>Server: EU-West-1</span>
        </div>
        <div className="flex items-center gap-6">
          <span>BTC: $65,432.50 (+2.4%)</span>
          <span>ETH: $3,450.20 (-1.2%)</span>
          <span>SOL: $150.40 (+5.6%)</span>
        </div>
      </footer>
    </div>
  );
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
