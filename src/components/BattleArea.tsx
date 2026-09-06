import React from 'react';
import type { Player } from '../data/mockData';

interface BattleAreaProps {
  players: Player[];
  totalBet: number;
  currency: string;
  status: string;
  countdown?: number | null;
}

export const BattleArea: React.FC<BattleAreaProps> = ({ players, totalBet, status, countdown }) => {
  // Render game status based on prop
  const renderStatus = () => {
    if (status === 'waiting' || players.length === 0) {
      return <span className="text-[#888888] text-[15px] font-medium">Waiting players {players.length}/2</span>;
    } else if (status === 'starting' && countdown !== null) {
      return <span className="text-[#888888] text-[15px] font-medium">Starting in 00:{countdown !== undefined && countdown < 10 ? `0${countdown}` : countdown}</span>;
    } else {
      return (
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-green-500 text-[15px] font-medium">Live</span>
        </div>
      );
    }
  };

  // Find the top better (or just use the first player if any)
  const topPlayer = players && players.length > 0
    ? [...players].sort((a, b) => b.betAmount - a.betAmount)[0]
    : null;

  return (
    <div className="w-full mb-4 bg-[#1e1e1e] p-4 rounded-3xl pb-6">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center">
          <span className="text-[#888888] text-[15px] font-medium mr-2">Total</span>
          <span className="text-blue-500 font-bold text-[15px]">{totalBet}</span>
          <img src="/assets/diamond.png" alt="Diamond" className="w-3.5 h-3.5 ml-1" />
        </div>
        <div>
          {renderStatus()}
        </div>
      </div>

      {/* Main Battle Area - Green Square */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#39FF70]" style={{ aspectRatio: '1/1' }}>

        {/* If a player exists, show their avatar in the center */}
        {topPlayer && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-48 h-48 rounded-full overflow-hidden shadow-2xl border-4 border-transparent">
               <img src={topPlayer.avatar} alt="Player" className="w-full h-full object-cover" />
             </div>
          </div>
        )}

        {/* Countdown Overlay */}
        {status === 'starting' && countdown !== null && countdown !== undefined && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-10">
            <div className="text-7xl font-black text-white drop-shadow-2xl animate-pulse">
              {countdown < 10 ? `0${countdown}` : countdown}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
