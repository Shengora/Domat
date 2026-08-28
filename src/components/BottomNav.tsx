import React from 'react';
import { Store, Hexagon, Trophy, CalendarDays, Rocket } from 'lucide-react';

export const BottomNav: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-[72px] bg-[#121212] border-t border-gray-800 flex items-center justify-around px-2 z-50">

      <button className="flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-gray-300 w-16">
        <Store size={22} />
        <span className="text-[10px] font-medium">Market</span>
      </button>

      <button className="flex flex-col items-center justify-center space-y-1 text-purple-500 w-16 relative">
        {/* Active indicator dot */}
        <div className="absolute -top-3 w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,1)]"></div>
        <Hexagon size={22} fill="currentColor" className="opacity-20 absolute" />
        <Hexagon size={22} />
        <span className="text-[10px] font-medium text-purple-400">Hub</span>
      </button>

      <button className="flex flex-col items-center justify-center w-16 -mt-6">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 border-4 border-[#121212]">
          <Rocket size={24} className="text-white" />
        </div>
      </button>

      <button className="flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-gray-300 w-16">
        <Trophy size={22} />
        <span className="text-[10px] font-medium">Race</span>
      </button>

      <button className="flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-gray-300 w-16">
        <CalendarDays size={22} />
        <span className="text-[10px] font-medium">Event</span>
      </button>

    </div>
  );
};
