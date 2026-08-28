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
        <h2 className="text-lg font-bold">Players · {players.length}</h2>
        <span className="text-gray-400 text-sm">Game #{gameId}</span>
      </div>

      {/* List Container */}
      <div className="flex flex-col space-y-4">
        {players.map((player) => {
          const percentage = ((player.betAmount / totalBet) * 100).toFixed(1);
          const displayName = player.username ? player.username : player.id;

          return (
            <div key={player.id} className="flex items-center space-x-3 w-full bg-[#1A1A1A] rounded-xl p-3 border border-gray-800/50">

              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700">
                <img src={player.avatar} alt="avatar" className="w-full h-full object-cover" />
              </div>

              {/* Info & Progress */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate mb-1">
                  {displayName}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(to right, ${player.colorStart}, ${player.colorEnd})`
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap min-w-[32px]">
                    {percentage}%
                  </span>
                </div>
              </div>

              {/* Bet Amount */}
              <div className="flex-shrink-0 text-right">
                <div className="font-bold text-white whitespace-nowrap">
                  {player.betAmount} <span className="text-xs text-gray-400">{player.betCurrency}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
