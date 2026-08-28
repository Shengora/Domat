import React from 'react';
import type { Player } from '../data/mockData';

interface BattleAreaProps {
  players: Player[];
  totalBet: number;
  currency: string;
  status: string;
}

export const BattleArea: React.FC<BattleAreaProps> = ({ players, totalBet, currency, status }) => {
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

  if (!players || players.length === 0) return null;

  // Sort players descending by bet amount
  const sortedPlayers = [...players].sort((a, b) => b.betAmount - a.betAmount);

  // Player 0 is the background (largest area)
  const p0 = sortedPlayers[0];

  // Group remaining players by corner: 0=TL, 1=BR, 2=TR, 3=BL
  const corners: Player[][] = [[], [], [], []];
  for (let i = 1; i < sortedPlayers.length; i++) {
    corners[(i - 1) % 4].push(sortedPlayers[i]);
  }

  const cornerElements: any[] = [];
  const cornerMaxA = [0, 0, 0, 0];

  corners.forEach((cornerPlayers, cornerIndex) => {
    const totalCornerArea = cornerPlayers.reduce((sum, p) => sum + (p.betAmount / totalBet), 0);
    let currentOuterArea = totalCornerArea;

    cornerPlayers.forEach((p) => {
      const pFraction = p.betAmount / totalBet;
      const outerA = currentOuterArea;
      const innerA = currentOuterArea - pFraction;

      const a_out = Math.sqrt(2 * outerA * width * height);
      const a_in = Math.sqrt(2 * Math.max(0, innerA) * width * height);

      cornerMaxA[cornerIndex] = Math.max(cornerMaxA[cornerIndex], a_out);

      let points = "";
      let cx = 0, cy = 0;
      const d = (a_out + a_in) / 4;

      if (cornerIndex === 0) { // TL
        points = `0,0 ${a_out},0 0,${a_out}`;
        cx = d; cy = d;
      } else if (cornerIndex === 1) { // BR
        points = `${width},${height} ${width - a_out},${height} ${width},${height - a_out}`;
        cx = width - d; cy = height - d;
      } else if (cornerIndex === 2) { // TR
        points = `${width},0 ${width},${a_out} ${width - a_out},0`;
        cx = width - d; cy = d;
      } else if (cornerIndex === 3) { // BL
        points = `0,${height} ${a_out},${height} 0,${height - a_out}`;
        cx = d; cy = height - d;
      }

      currentOuterArea = innerA;

      const bandWidth = (a_out - a_in) / Math.SQRT2;
      const avatarSize = Math.max(20, Math.min(bandWidth * 0.8, 60));

      cornerElements.push({
        id: p.id,
        player: p,
        points,
        cx, cy,
        avatarSize,
        showAvatar: bandWidth > 25
      });
    });
  });

  // Calculate P0 avatar position based on remaining visible shape
  const [a_TL, a_BR, a_TR, a_BL] = cornerMaxA;
  const p0_pts = [
    [Math.min(width, a_TL), 0],
    [Math.max(0, width - a_TR), 0],
    [width, Math.min(height, a_TR)],
    [width, Math.max(0, height - a_BR)],
    [Math.max(0, width - a_BR), height],
    [Math.min(width, a_BL), height],
    [0, Math.max(0, height - a_BL)],
    [0, Math.min(height, a_TL)]
  ];
  const p0_cx = p0_pts.reduce((sum, pt) => sum + pt[0], 0) / 8;
  const p0_cy = p0_pts.reduce((sum, pt) => sum + pt[1], 0) / 8;

  const renderPlayerContent = (p: Player, cx: number, cy: number, avatarSize: number) => {
    return (
      <g key={`content-${p.id}`}>
         <defs>
           <clipPath id={`clip-${p.id}`}>
             <circle cx={cx} cy={cy} r={avatarSize / 2} />
           </clipPath>
         </defs>

         <circle
           cx={cx}
           cy={cy}
           r={(avatarSize / 2) + 3}
           fill="white"
           opacity="0.3"
         />
         <image
           href={p.avatar}
           x={cx - avatarSize / 2}
           y={cy - avatarSize / 2}
           height={avatarSize}
           width={avatarSize}
           clipPath={`url(#clip-${p.id})`}
           preserveAspectRatio="xMidYMid slice"
         />
         {p.username && avatarSize > 40 && (
            <text
              x={cx}
              y={cy + avatarSize / 2 + 16}
              fill="white"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              style={{ textShadow: "0px 2px 4px rgba(0,0,0,0.8)" }}
            >
              {p.username}
            </text>
         )}
      </g>
    );
  };

  return (
    <div className="w-full mb-6">
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

      <div className="relative w-full rounded-2xl overflow-hidden bg-gray-900 shadow-2xl ring-1 ring-gray-800" style={{ aspectRatio: '1/1' }}>
         <svg
           viewBox={`0 0 ${width} ${height}`}
           className="w-full h-full"
           preserveAspectRatio="none"
         >
           <defs>
             {players.map(p => (
               <linearGradient key={`grad-${p.id}`} id={`grad-${p.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor={p.colorStart} />
                 <stop offset="100%" stopColor={p.colorEnd} />
               </linearGradient>
             ))}
           </defs>

           {/* Player 0 Background */}
           <rect x="0" y="0" width={width} height={height} fill={`url(#grad-${p0.id})`} />

           {/* Corner Players */}
           {cornerElements.map(el => (
             <polygon key={`poly-${el.id}`} points={el.points} fill={`url(#grad-${el.player.id})`} />
           ))}

           {/* Stroke Lines for Boundaries */}
           {cornerElements.map(el => (
             <polygon key={`stroke-${el.id}`} points={el.points} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
           ))}

           {/* Player 0 Content */}
           {renderPlayerContent(p0, p0_cx, p0_cy, 64)}

           {/* Corner Players Content */}
           {cornerElements.map(el => el.showAvatar && renderPlayerContent(el.player, el.cx, el.cy, el.avatarSize))}
         </svg>
      </div>
    </div>
  );
};
