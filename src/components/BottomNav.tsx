import React from 'react';
import { Swords, ShieldAlert } from 'lucide-react';
import { useGameState } from '../GameStateContext';

interface BottomNavProps {
    isAdmin?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ isAdmin }) => {
  const { currentView, setCurrentView } = useGameState();

  return (
    <div className="absolute bottom-0 left-0 w-full h-[72px] bg-[#121212] border-t border-gray-800 flex items-center justify-center space-x-12 px-2 z-50">

      {/* Arena Button */}
      <button
        onClick={() => setCurrentView('game')}
        className="flex flex-col items-center justify-center w-16 relative"
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${currentView === 'game' ? 'bg-[#c549ff]/20 text-[#c549ff]' : 'bg-transparent text-gray-500'}`}>
          <Swords size={24} />
        </div>
        <span className={`text-[10px] font-bold mt-1 ${currentView === 'game' ? 'text-[#c549ff]' : 'text-gray-500'}`}>Arena</span>
      </button>

      {/* Profile Button (User Avatar) */}
      <button
        onClick={() => setCurrentView('profile')}
        className="flex flex-col items-center justify-center w-16 relative"
      >
        <div className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-colors ${currentView === 'profile' ? 'border-white' : 'border-[#2a2a2a]'}`}>
          <img src="https://i.pravatar.cc/150?u=shhveppes" alt="Profile" className="w-full h-full object-cover" />
        </div>
        <span className={`text-[10px] font-bold mt-1 ${currentView === 'profile' ? 'text-white' : 'text-gray-500'}`}>Profile</span>
      </button>

      {isAdmin && (
          <button
            onClick={() => setCurrentView('admin')}
            className={`flex flex-col items-center justify-center w-16 relative`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${currentView === 'admin' ? 'bg-red-500/20 text-red-500' : 'bg-transparent text-gray-500'}`}>
               <ShieldAlert size={24} />
            </div>
            <span className={`text-[10px] font-bold mt-1 ${currentView === 'admin' ? 'text-red-500' : 'text-gray-500'}`}>Admin</span>
          </button>
      )}

    </div>
  );
};
