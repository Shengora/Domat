import React, { useState } from 'react';
import { Gift, Wallet, PenSquare, RefreshCw } from 'lucide-react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { depositGram } from '../services/api';

export const ControlPanel: React.FC = () => {
  const [mode, setMode] = useState<'single' | 'group'>('single');
  const [activeBet, setActiveBet] = useState<string>('0.5');

  const betOptions = [
    { type: 'icon', value: 'edit', icon: <PenSquare size={18} /> },
    { type: 'text', value: '0.1' },
    { type: 'text', value: '0.5' },
    { type: 'text', value: '1' },
    { type: 'text', value: 'All-in' },
    { type: 'icon', value: 'refresh', icon: <RefreshCw size={18} /> },
  ];

  return (
    <div className="absolute bottom-[72px] left-0 w-full px-4 pointer-events-none">
      <div className="bg-[#1A1A1A]/95 backdrop-blur-md border border-gray-800 rounded-2xl p-4 shadow-2xl pointer-events-auto">

        {/* Top row controls */}
        <div className="flex items-center justify-between mb-4">

          {/* Left icons */}
          <div className="flex space-x-3">
            <TonConnectButton className="my-ton-connect-btn" />
            <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition">
              <Gift size={20} className="text-pink-400" />
            </button>
            <button
              className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition"
              title="Deposit 1 GRAM for testing"
              onClick={async () => {
                 try {
                     await depositGram(1, "mock_tx_hash_" + Date.now());
                     alert('Deposit successful');
                 } catch (e) {
                     console.error(e);
                 }
              }}
            >
              <Wallet size={20} className="text-blue-400" />
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-gray-800 p-1 rounded-full">
            <button
              onClick={() => setMode('single')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                mode === 'single' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setMode('group')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                mode === 'group' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Group
            </button>
          </div>

          {/* Right empty spacer for balance if needed */}
          <div className="w-[88px]"></div>
        </div>

        {/* Quick Bets */}
        <div className="flex items-center justify-between gap-2">
          {betOptions.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setActiveBet(opt.value)}
              className={`flex-1 aspect-square max-h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${activeBet === opt.value
                  ? 'bg-purple-600 text-white border-2 border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.5)]'
                  : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'}
              `}
            >
              {opt.type === 'icon' ? opt.icon : opt.value}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
