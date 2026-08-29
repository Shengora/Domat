import React, { useEffect, useState, useRef } from 'react';
import type { Player } from '../data/mockData';
import { useGameState } from '../GameStateContext';

interface BattleAreaProps {
  players: Player[];
  totalBet: number;
  currency: string;
  status: string;
  countdown?: number | null;
}

export const BattleArea: React.FC<BattleAreaProps> = ({ players, totalBet, currency, status, countdown }) => {
  const { winnerId } = useGameState();
  const width = 400;
  const height = 400;

  const [ballPos, setBallPos] = useState({ x: width / 2, y: height / 2 });
  const reqRef = useRef<number | null>(null);

  // Render game status based on prop
  const renderStatus = () => {
    if (status === 'waiting') {
      return <span className="text-gray-400 text-sm">Waiting players {players.length}/2</span>;
    } else if (status === 'starting' && countdown !== null) {
      return <span className="text-gray-400 text-sm">Starting in 00:{countdown !== undefined && countdown < 10 ? `0${countdown}` : countdown}</span>;
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

  useEffect(() => {
    if (status === 'live') {
      // Find winner's center
      let targetX = p0_cx;
      let targetY = p0_cy;

      const winnerEl = cornerElements.find(el => el.id === String(winnerId));
      if (winnerEl) {
          targetX = winnerEl.cx;
          targetY = winnerEl.cy;
      } else if (p0.id === String(winnerId)) {
          targetX = p0_cx;
          targetY = p0_cy;
      } else if (cornerElements.length > 0) {
          targetX = cornerElements[0].cx;
          targetY = cornerElements[0].cy;
      }

      const duration = 7500; // 7.5 seconds
      const startTime = performance.now();
      let x = width / 2;
      let y = height / 2;
      let vx = (Math.random() - 0.5) * 30; // initial velocity
      let vy = (Math.random() - 0.5) * 30;

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 0.8) {
           // Bouncing around randomly
           x += vx;
           y += vy;

           if (x < 10 || x > width - 10) vx *= -1;
           if (y < 10 || y > height - 10) vy *= -1;

           // Keep within bounds
           x = Math.max(10, Math.min(width - 10, x));
           y = Math.max(10, Math.min(height - 10, y));
        } else {
           // Interpolate towards target
           const easeProgress = (progress - 0.8) / 0.2;
           x = x + (targetX - x) * easeProgress * 0.1;
           y = y + (targetY - y) * easeProgress * 0.1;
        }

        setBallPos({ x, y });

        if (progress < 1) {
          reqRef.current = requestAnimationFrame(animate);
        }
      };

      reqRef.current = requestAnimationFrame(animate);

    } else {
       if (reqRef.current) cancelAnimationFrame(reqRef.current);
       setBallPos({ x: width / 2, y: height / 2 });
    }

    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  // Note: we intentionally do not include `cornerElements` in the dependency array
  // because it's recreated on every render and would cause the animation to restart continuously.
  // We use stringified versions of corner center coordinates to track positional updates if needed,
  // but for the animation duration (live state), we just want it to run once when status changes to 'live'.
  }, [status, winnerId]); // eslint-disable-line react-hooks/exhaustive-deps

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

           {/* Physics Ball */}
           {status === 'live' && (
             <circle
               cx={ballPos.x}
               cy={ballPos.y}
               r={8}
               fill="#fff"
               className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
             />
           )}
         </svg>

         {status === 'starting' && countdown !== null && countdown !== undefined && (
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center animate-pulse z-10">
             <div className="text-5xl font-black italic tracking-tighter text-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]">
               {countdown < 10 ? `0${countdown}` : countdown}
             </div>
             <div className="text-xs text-white uppercase tracking-widest mt-1 font-bold">Starting</div>
           </div>
         )}
      </div>
    </div>
  );
};
