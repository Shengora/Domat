import React from 'react';
import { Swords, User as UserIcon, ShieldAlert } from 'lucide-react';
import { useGameState } from '../GameStateContext';

interface BottomNavProps {
    isAdmin?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ isAdmin }) => {
  const { currentView, setCurrentView } = useGameState();

  return (
    <div className="fixed bottom-4 left-0 w-full px-4 flex items-center gap-3 z-50">

      {/* Pill Container for Arena */}
      <div className="flex-1 h-[72px] bg-[#161618] rounded-[36px] flex items-center justify-center shadow-lg border border-white/5 relative">

        {/* Arena Button */}
        <button
          onClick={() => setCurrentView('game')}
          className="flex flex-col items-center justify-center relative w-full h-full"
          aria-label="Arena"
        >
          <div className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-colors mb-3 ${currentView === 'game' ? 'bg-[#0a0a0c]' : 'bg-transparent'}`}>
            <Swords size={22} className={currentView === 'game' ? 'text-[#C955FF]' : 'text-gray-500'} />
          </div>
          <span className={`absolute bottom-2 text-[10px] font-medium leading-none ${currentView === 'game' ? 'text-[#C955FF]' : 'text-gray-500'}`}>
            Arena
          </span>
        </button>

      </div>

      {/* Profile Button (The large standalone circle on the right) */}
      <button
        onClick={() => setCurrentView('profile')}
        className="w-[72px] h-[72px] shrink-0 rounded-full bg-[#161618] border border-white/5 flex items-center justify-center shadow-lg relative overflow-hidden transition-colors"
        aria-label="Profile"
      >
         {/* Using an inner div to mimic the profile image container in the screenshot */}
         <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all ${currentView === 'profile' ? 'border-[2px] border-[#C955FF] shadow-[0_0_10px_rgba(201,85,255,0.3)]' : 'border-[2px] border-transparent'}`}>
             <div className="w-[56px] h-[56px] rounded-full bg-[#0a0a0c] flex items-center justify-center overflow-hidden">
                <UserIcon size={24} className={currentView === 'profile' ? 'text-[#C955FF]' : 'text-gray-400'} />
             </div>
         </div>
      </button>

      {/* Admin Button - Placed floating above if admin is true */}
      {isAdmin && (
        <button
          onClick={() => setCurrentView('admin')}
          className={`absolute -top-14 right-4 w-12 h-12 rounded-full bg-[#161618] border border-red-500/30 flex items-center justify-center shadow-lg ${
            currentView === 'admin' ? 'text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'text-gray-500'
          }`}
          aria-label="Admin"
        >
          <ShieldAlert size={20} />
        </button>
      )}

    </div>
  );
};
