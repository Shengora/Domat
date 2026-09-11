import React, { useState } from 'react';
import { Gift, Pen, RefreshCw, User as UserIcon } from 'lucide-react';
import { gameSocket } from '../services/api';
import { useGameState } from '../GameStateContext';

export const ControlPanel: React.FC = () => {
  const [mode, setMode] = useState<'single' | 'group'>('single');
  const [activeBet, setActiveBet] = useState<string>('0.1');
  const { balance } = useGameState();

  const handleBet = () => {
      let amountToBet = 0;
      if (activeBet === 'All-in') {
          amountToBet = balance;
      } else {
          amountToBet = parseFloat(activeBet);
      }

      if (isNaN(amountToBet) || amountToBet <= 0) {
          alert('Invalid bet amount');
          return;
      }

      if (balance < amountToBet) {
          alert('Insufficient balance');
          return;
      }

      gameSocket.joinGame(amountToBet);
  };

  const betOptions = [
    { type: 'icon', value: 'edit', icon: <Pen size={18} /> },
    { type: 'text', value: '0.1' },
    { type: 'text', value: '0.5' },
    { type: 'text', value: '1' },
    { type: 'text', value: 'All-in' },
    { type: 'icon', value: 'action', valueStr: 'BET', icon: <RefreshCw size={18} />, action: handleBet },
  ];

  return (
    <div className="absolute bottom-[80px] left-0 w-full px-4 pointer-events-none z-40">
      <div className="bg-transparent pointer-events-auto">

        {/* Top row controls */}
        <div className="flex items-center justify-between mb-4">
          {/* Left Side: Gift Box & Username */}
          <div className="flex items-center space-x-2">
            <button className="w-10 h-10 rounded-xl bg-[#2a2a2a] flex items-center justify-center transition">
              <Gift size={20} className="text-gray-400" />
            </button>
            <div className="flex items-center bg-[#1a70ff] px-3 py-2 rounded-full cursor-pointer hover:bg-[#155bd4] transition h-10">
              <img src="/assets/diamond.png" alt="Diamond" className="w-4 h-4 mr-1.5" />
              <span className="text-white font-bold text-[14px]">hveppes</span>
            </div>
          </div>

          {/* Right Side: Mode Toggle */}
          <div className="flex items-center bg-[#2a2a2a] p-1 rounded-full h-10">
            <button
              onClick={() => setMode('single')}
              className={`flex items-center px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${
                mode === 'single' ? 'bg-[#c549ff] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserIcon size={14} className="mr-1.5" />
              Single
            </button>
            <button
              onClick={() => setMode('group')}
              className={`flex items-center px-3 py-1.5 rounded-full text-[13px] font-bold transition-colors ${
                mode === 'group' ? 'bg-[#c549ff] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Bets */}
        <div className="flex items-center justify-between gap-1.5">
          {betOptions.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => {
                  if (opt.action) {
                      opt.action();
                  } else {
                      setActiveBet(opt.value || '');
                  }
              }}
              className={`flex-1 aspect-square rounded-full flex items-center justify-center font-bold text-[14px] transition-all
                ${opt.action
                   ? 'bg-[#2a2a2a] text-white hover:bg-[#333]'
                   : activeBet === opt.value
                      ? 'bg-transparent text-[#888888] border-[3px] border-[#333] shadow-inner relative'
                      : 'bg-[#2a2a2a] text-[#888888] border border-transparent hover:bg-[#333]'
                 }
              `}
            >
              {opt.type === 'icon' ? opt.icon : (
                <div className="flex items-center">
                   {opt.value} {opt.value !== 'All-in' && <img src="/assets/diamond.png" alt="Diamond" className="w-2.5 h-2.5 ml-1 opacity-50" />}
                </div>
              )}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
