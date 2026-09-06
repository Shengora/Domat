import React from 'react';
import { Swords, User as UserIcon, ShieldAlert } from 'lucide-react';
import { useGameState } from '../GameStateContext';

interface BottomNavProps {
    isAdmin?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ isAdmin }) => {
  const { currentView, setCurrentView } = useGameState();

  return (
    <div className="absolute bottom-0 left-0 w-full h-[72px] bg-[#121212] border-t border-gray-800 flex items-center justify-between px-6 z-50">

      {/* Left side spacer */}
      <div className="flex-1 flex justify-start">
      </div>

      {/* Center - Arena */}
      <div className="flex-1 flex justify-center">
        <button
          onClick={() => setCurrentView('game')}
          className={`flex flex-col items-center justify-center space-y-1 w-12 relative ${currentView === 'game' ? 'text-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          {currentView === 'game' && <div className="absolute -top-3 w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,1)]"></div>}
          {currentView === 'game' && <Swords size={22} fill="currentColor" className="opacity-20 absolute" />}
          <Swords size={22} />
          <span className="text-[10px] font-medium">Arena</span>
        </button>
      </div>

      {/* Right side - Profile & Admin */}
      <div className="flex-1 flex justify-end gap-2">
        <button
          onClick={() => setCurrentView('profile')}
          className={`flex flex-col items-center justify-center space-y-1 w-12 relative ${currentView === 'profile' ? 'text-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          {currentView === 'profile' && <div className="absolute -top-3 w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,1)]"></div>}
          <UserIcon size={22} />
          <span className="text-[10px] font-medium">Profile</span>
        </button>

        {isAdmin && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`flex flex-col items-center justify-center space-y-1 w-12 relative ${currentView === 'admin' ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
            >
              {currentView === 'admin' && <div className="absolute -top-3 w-1 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,1)]"></div>}
              <ShieldAlert size={22} />
              <span className="text-[10px] font-bold text-red-500">Admin</span>
            </button>
        )}
      </div>

    </div>
  );
};
