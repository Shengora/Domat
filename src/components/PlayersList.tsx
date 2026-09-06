import React from 'react';
import type { Player } from '../data/mockData';

interface PlayersListProps {
  players: Player[];
  gameId: string;
  totalBet: number;
}

export const PlayersList: React.FC<PlayersListProps> = ({ players, gameId, totalBet }) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-xl font-bold text-white flex items-center">
            Players <span className="mx-2 text-[#888888] text-xl font-normal">·</span> <span className="text-[#888888] font-normal">{players.length}</span>
        </h2>
        <span className="text-[#888888] text-[13px] font-medium">Game #{gameId}</span>
      </div>

      {/* List Container */}
      <div className="flex flex-col space-y-4">
        {players.map((player) => {
          const percentage = totalBet > 0 ? ((player.betAmount / totalBet) * 100).toFixed(1) : "0.0";
          const displayName = player.username ? player.username : player.id;

          return (
            <div key={player.id} className="flex items-center space-x-3 w-full rounded-xl p-3 bg-transparent">

              {/* Avatar */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-transparent relative">
                <img src={player.avatar} alt="avatar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 rounded-full ring-2 ring-inset" style={{ borderColor: player.colorStart }}></div>
              </div>

              {/* Info & Progress */}
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-white truncate mb-1.5 flex items-center justify-between">
                  <span>{displayName}</span>
                  <div className="flex items-center">
                     <span className="text-white font-bold">{player.betAmount}</span>
                     <img src="/assets/diamond.png" alt="Diamond" className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 h-2 bg-[#2a2a2a] rounded-full overflow-hidden relative">
                    <div
                      className="absolute left-0 top-0 bottom-0 rounded-full"
                      style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(to right, ${player.colorStart}, ${player.colorEnd})`
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-[#888888] font-bold whitespace-nowrap min-w-[36px]">
                    {percentage}%
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
