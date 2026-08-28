import React from 'react';
import type { Player } from '../data/mockData';

interface BattleAreaProps {
  players: Player[];
  totalBet: number;
  currency: string;
  status: string;
}

export const BattleArea: React.FC<BattleAreaProps> = ({ players, totalBet, currency, status }) => {
  // SVG viewBox size
  const width = 400;
  const height = 400;

  // Render game status based on prop
  const renderStatus = () => {
    if (status === 'waiting') {
      return <span className="text-gray-400 text-sm">Waiting players {players.length}/2</span>;
    } else if (status === 'starting') {
      return <span className="text-gray-400 text-sm">Starting in 00:09</span>;
    } else {
      return (
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-green-500 text-sm font-medium">Live</span>
        </div>
      );
    }
  };

  // Calculate proportional slices from top to bottom
  const renderSlices = () => {
    let currentY = 0;

    return players.map((player, index) => {
      const share = player.betAmount / totalBet;
      let layerHeight = share * height;

      const startY = currentY;
      const endY = currentY + layerHeight;
      currentY = endY;

      // Ensure the avatar size is dynamic based on layer height, but not too big
      const avatarSize = Math.min(layerHeight * 0.8, 60);
      const avatarX = width / 2;
      const avatarY = startY + (layerHeight / 2);

      // Create a wavy boundary for the bottom of the layer, except the last one
      let pathData = '';
      if (index === players.length - 1) {
        // Last item goes straight to the bottom
        pathData = `M 0 ${startY} L 0 ${height} L ${width} ${height} L ${width} ${startY}`;
        if (index > 0) {
           // We need to match the previous wave if we are not the first
           const prevEndY = startY;
           const waveAmplitude = 15;
           pathData = `M 0 ${prevEndY} C ${width * 0.3} ${prevEndY + waveAmplitude}, ${width * 0.7} ${prevEndY - waveAmplitude}, ${width} ${prevEndY} L ${width} ${height} L 0 ${height} Z`;
        }
      } else {
         // Create wavy bottom boundary
         const waveAmplitude = 15;
         const nextY = endY;

         if (index === 0) {
            pathData = `M 0 0 L 0 ${nextY} C ${width * 0.3} ${nextY + waveAmplitude}, ${width * 0.7} ${nextY - waveAmplitude}, ${width} ${nextY} L ${width} 0 Z`;
         } else {
            const prevEndY = startY;
            pathData = `M 0 ${prevEndY} C ${width * 0.3} ${prevEndY + waveAmplitude}, ${width * 0.7} ${prevEndY - waveAmplitude}, ${width} ${prevEndY} L ${width} ${nextY} C ${width * 0.7} ${nextY - waveAmplitude}, ${width * 0.3} ${nextY + waveAmplitude}, 0 ${nextY} Z`;
         }
      }

      return (
        <g key={player.id}>
          <defs>
            <linearGradient id={`grad-${player.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={player.colorStart} />
              <stop offset="100%" stopColor={player.colorEnd} />
            </linearGradient>

            {/* Clip path for avatar */}
            <clipPath id={`clip-${player.id}`}>
              <circle cx={avatarX} cy={avatarY} r={avatarSize / 2} />
            </clipPath>
          </defs>

          {/* Layer Background */}
          <path d={pathData} fill={`url(#grad-${player.id})`} />

          {/* Layer Boundary Line (Subtle overlay for depth) */}
          {index !== players.length - 1 && (
            <path
              d={`M 0 ${endY} C ${width * 0.3} ${endY + 15}, ${width * 0.7} ${endY - 15}, ${width} ${endY}`}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="2"
            />
          )}

          {/* Avatar (only show if height is enough to fit a small reasonable avatar, e.g. > 20px) */}
          {layerHeight > 25 && (
            <g>
               {/* Avatar Border */}
               <circle
                 cx={avatarX}
                 cy={avatarY}
                 r={(avatarSize / 2) + 2}
                 fill="white"
                 opacity="0.2"
               />
               <image
                 href={player.avatar}
                 x={avatarX - avatarSize / 2}
                 y={avatarY - avatarSize / 2}
                 height={avatarSize}
                 width={avatarSize}
                 clipPath={`url(#clip-${player.id})`}
                 preserveAspectRatio="xMidYMid slice"
               />
               {/* Optional Username Overlay if large enough */}
               {player.username && avatarSize > 40 && (
                  <text
                    x={avatarX}
                    y={avatarY + avatarSize / 2 + 14}
                    fill="white"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}
                  >
                    {player.username}
                  </text>
               )}
            </g>
          )}
        </g>
      );
    });
  };

  return (
    <div className="w-full mb-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-3 px-1">
        <div>
          <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-0.5">Total</div>
          <div className="text-blue-400 text-lg font-bold">
            {totalBet} {currency}
          </div>
        </div>
        <div>
          {renderStatus()}
        </div>
      </div>

      {/* Battle Card Container */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 shadow-xl" style={{ aspectRatio: '1/1' }}>
         <svg
           viewBox={`0 0 ${width} ${height}`}
           className="w-full h-full"
           preserveAspectRatio="none"
         >
           {renderSlices()}
         </svg>
      </div>
    </div>
  );
};
