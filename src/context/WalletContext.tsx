import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserBalance, UserTrade } from '../types';

interface WalletContextType {
  balances: UserBalance[];
  userTrades: UserTrade[];
  updateBalance: (asset: string, amount: number, type?: 'free' | 'locked') => void;
  cancelTrade: (tradeId: string) => void;
  addTrade: (trade: UserTrade) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balances, setBalances] = useState<UserBalance[]>([
    { asset: 'BTC', free: 0.4521, locked: 0.05, total: 0.5021, valueUsd: 0 },
    { asset: 'ETH', free: 4.25, locked: 1.5, total: 5.75, valueUsd: 0 },
    { asset: 'SOL', free: 25.0, locked: 0, total: 25.0, valueUsd: 0 },
    { asset: 'USDT', free: 12450.50, locked: 500, total: 12950.50, valueUsd: 0 },
  ]);

  const [userTrades, setUserTrades] = useState<UserTrade[]>([
    {
      id: '1',
      pair: 'BTC/USDT',
      type: 'buy',
      amount: 0.0524,
      price: 64200.50,
      status: 'completed',
      time: Date.now() - 1000 * 60 * 60 * 2,
    },
    {
      id: '2',
      pair: 'ETH/USDT',
      type: 'sell',
      amount: 1.2500,
      price: 3450.20,
      status: 'completed',
      time: Date.now() - 1000 * 60 * 60 * 5,
    },
    {
      id: '3',
      pair: 'SOL/USDT',
      type: 'buy',
      amount: 15.00,
      price: 148.50,
      status: 'pending',
      time: Date.now() - 1000 * 60 * 30,
    },
    {
      id: '4',
      pair: 'BTC/USDT',
      type: 'sell',
      amount: 0.0215,
      price: 65100.00,
      status: 'cancelled',
      time: Date.now() - 1000 * 60 * 60 * 24,
    },
  ]);

  const updateBalance = (asset: string, amount: number, type: 'free' | 'locked' = 'free') => {
    setBalances(prev => {
      const existing = prev.find(b => b.asset === asset);
      if (existing) {
        return prev.map(b => {
          if (b.asset === asset) {
            const newFree = type === 'free' ? b.free + amount : b.free;
            const newLocked = type === 'locked' ? b.locked + amount : b.locked;
            return { ...b, free: newFree, locked: newLocked, total: newFree + newLocked };
          }
          return b;
        });
      } else {
        const newFree = type === 'free' ? amount : 0;
        const newLocked = type === 'locked' ? amount : 0;
        return [...prev, { asset, free: newFree, locked: newLocked, total: newFree + newLocked, valueUsd: 0 }];
      }
    });
  };

  const addTrade = (trade: UserTrade) => {
    setUserTrades(prev => [trade, ...prev]);
  };

  const cancelTrade = (tradeId: string) => {
    setUserTrades(prev => prev.map(t => {
      if (t.id === tradeId && t.status === 'pending') {
        // Logic to free up locked balance
        const [baseAsset, quoteAsset] = t.pair.split('/');
        if (t.type === 'buy') {
          // Buy order locks quote asset
          const lockedAmount = t.amount * t.price;
          updateBalance(quoteAsset, -lockedAmount, 'locked');
          updateBalance(quoteAsset, lockedAmount, 'free');
        } else {
          // Sell order locks base asset
          updateBalance(baseAsset, -t.amount, 'locked');
          updateBalance(baseAsset, t.amount, 'free');
        }
        return { ...t, status: 'cancelled' };
      }
      return t;
    }));
  };

  return (
    <WalletContext.Provider value={{ balances, userTrades, updateBalance, cancelTrade, addTrade }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
