import React from 'react';
import { Hexagon, Trophy, CalendarDays, Rocket, User as UserIcon } from 'lucide-react';
import { useGameState } from '../GameStateContext';

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView } = useGameState();

  return (
    <div className="absolute bottom-0 left-0 w-full h-[72px] bg-[#121212] border-t border-gray-800 flex items-center justify-around px-2 z-50">

      <button
        onClick={() => setCurrentView('game')}
        className={`flex flex-col items-center justify-center space-y-1 w-16 relative ${currentView === 'game' ? 'text-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
      >
        {currentView === 'game' && <div className="absolute -top-3 w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,1)]"></div>}
        {currentView === 'game' && <Hexagon size={22} fill="currentColor" className="opacity-20 absolute" />}
        <Hexagon size={22} />
        <span className="text-[10px] font-medium">Hub</span>
      </button>

      <button className="flex flex-col items-center justify-center w-16 -mt-6">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 border-4 border-[#121212]">
          <Rocket size={24} className="text-white" />
        </div>
      </button>

      <button
        onClick={() => setCurrentView('profile')}
        className={`flex flex-col items-center justify-center space-y-1 w-16 relative ${currentView === 'profile' ? 'text-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
      >
        {currentView === 'profile' && <div className="absolute -top-3 w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,1)]"></div>}
        <UserIcon size={22} />
        <span className="text-[10px] font-medium">Profile</span>
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
