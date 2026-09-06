
import { useEffect, useState } from 'react';
import { mockPlayers, gameInfo } from './data/mockData';
import { BattleArea } from './components/BattleArea';
import { PlayersList } from './components/PlayersList';
import { ControlPanel } from './components/ControlPanel';
import { BottomNav } from './components/BottomNav';
import { authTelegram, gameSocket } from './services/api';
import { useGameState } from './GameStateContext';
import { WalletModal } from './components/WalletModal';
import { getBalance } from './services/api';
import { ProfileScreen } from './components/ProfileScreen';
import { AdminScreen } from './components/AdminScreen';
import { Info, MessageCircle, Calendar } from 'lucide-react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

function App() {
  const { status, setStatus, countdown, setCountdown, setWinnerFactor, setWinnerId, players, setPlayers, balance, setBalance, currentView } = useGameState();
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  // Mock user details based on typical initData parsing
  const [user, setUser] = useState<{ id: number, firstName: string, username: string, role: string } | null>(null);

  const fetchBalance = async () => {
      try {
        const balData = await getBalance();
        setBalance(balData.balance);
      } catch (e) {
          console.error('Failed to fetch balance', e);
      }
  }

  useEffect(() => {
    // initialize with mock data until real backend sends it
    setPlayers(mockPlayers);

    const initApp = async () => {
      const initData = window.Telegram?.WebApp?.initData || "query_id=mock_query_id&user=%7B%22id%22%3A123456%2C%22first_name%22%3A%22Mock%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22mockuser%22%2C%22language_code%22%3A%22en%22%7D&auth_date=1626294744&hash=mock_hash";

      try {
        const authRes = await authTelegram(initData);
        if (authRes.user) {
            setUser({ id: authRes.user.telegram_id, firstName: 'User', username: authRes.user.username, role: authRes.user.role });
        } else {
            // fallback for dev
            setUser({ id: 123456, firstName: 'Mock', username: 'mockuser', role: 'user' });
        }

        gameSocket.connect();
        await fetchBalance();
      } catch (e) {
        console.error('Authentication failed', e);
      }
    };

    initApp();

    gameSocket.onGameState((data) => {
       setStatus(data.status);
       if (data.players && data.players.length > 0) {
           const formattedPlayers = data.players.map((p: any, index: number) => ({
               id: p.user_id.toString(),
               name: `Player ${p.user_id}`,
               avatar: `https://i.pravatar.cc/150?u=${p.user_id}`,
               betAmount: Number(p.amount_or_gift_id),
               colorStart: index % 2 === 0 ? '#A855F7' : '#06B6D4',
               colorEnd: index % 2 === 0 ? '#EC4899' : '#3B82F6',
           }));
           setPlayers(formattedPlayers);
       }
       // When a new game state arrives, the player's balance might have changed (e.g. they joined and bet)
       fetchBalance();
    });
    gameSocket.onGameStarting((data) => {
      setStatus('starting');
      setCountdown(data.countdown);
    });
    gameSocket.onGameTick((data) => setCountdown(data.countdown));
    gameSocket.onGameLive((data) => {
      setStatus('live');
      if (data.winner_factor !== undefined) {
         setWinnerFactor(data.winner_factor);
         setWinnerId(data.winner_id);
      }
    });
    gameSocket.onGameFinished(() => {
      setStatus('finished');
      setCountdown(null);
      // Fetch balance after game finishes to reflect winnings
      fetchBalance();
    });

    return () => {
      gameSocket.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex justify-center">
      <div className="w-full max-w-md bg-[#121212] h-screen relative flex flex-col shadow-2xl overflow-hidden">

        {/* Header matching screenshot */}
        <div className="pt-4 pb-2 px-4 shrink-0 bg-transparent z-40">
           <div className="flex items-center justify-between">
               {/* Left side: Info, Chat, Calendar */}
               <div className="flex items-center space-x-2">
                   <button className="w-9 h-9 rounded-full bg-[#1e1e1e] flex items-center justify-center text-gray-400 hover:text-white transition">
                       <Info size={18} />
                   </button>
                   <button className="w-9 h-9 rounded-full bg-[#1e1e1e] flex items-center justify-center text-gray-400 hover:text-white transition">
                       <MessageCircle size={18} />
                   </button>
                   <button className="w-9 h-9 rounded-full bg-[#1e1e1e] flex items-center justify-center text-gray-400 hover:text-white transition">
                       <Calendar size={18} />
                   </button>
               </div>

               {/* Right side: Balance & Wallet */}
               <div className="flex items-center cursor-pointer bg-[#1e1e1e] hover:bg-[#2a2a2a] pl-2 pr-4 py-1.5 rounded-full transition" onClick={() => setIsWalletOpen(true)}>
                  <div className="flex items-center justify-center mr-2">
                     <img src="/assets/diamond.png" alt="Diamond" className="w-5 h-5 object-contain" />
                  </div>
                  <span className="font-bold text-[14px] text-white">{(balance || 0).toFixed(0)} GRAM</span>
               </div>
           </div>

           {/* Sub-header for Top game and Last game */}
           {currentView === 'game' && (
               <div className="flex items-center space-x-2 mt-4">
                   <div className="flex-1 bg-[#1e1e1e] rounded-xl p-3 flex flex-col justify-center">
                       <div className="text-[10px] text-gray-500 font-semibold mb-1 text-center">Top game</div>
                       <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-1.5">
                               <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center text-[8px] font-bold">GO</div>
                               <span className="text-xs text-gray-400 truncate max-w-[60px]">Grey Oscar</span>
                           </div>
                           <div className="flex items-center text-white font-bold text-[11px]">
                               +28 001 <img src="/assets/diamond.png" alt="Diamond" className="w-2.5 h-2.5 ml-1" />
                           </div>
                       </div>
                   </div>

                   <div className="flex-1 bg-[#1e1e1e] rounded-xl p-3 flex flex-col justify-center">
                       <div className="text-[10px] text-gray-500 font-semibold mb-1 text-center">Last game</div>
                       <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-1.5">
                               <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                                   <img src="https://i.pravatar.cc/150?u=shhveppes" alt="avatar" className="w-full h-full object-cover" />
                               </div>
                               <span className="text-xs text-gray-400 truncate max-w-[60px]">@shhveppes</span>
                           </div>
                           <div className="flex items-center text-white font-bold text-[11px]">
                               +8.55 <img src="/assets/diamond.png" alt="Diamond" className="w-2.5 h-2.5 ml-1" />
                           </div>
                       </div>
                   </div>
               </div>
           )}
        </div>

        {/* Main Content Container */}
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-[200px] no-scrollbar">

          {currentView === 'game' && (
            <>
              <BattleArea
                players={players.length > 0 ? players : mockPlayers}
                totalBet={gameInfo.totalBet}
                currency={gameInfo.currency}
                status={status}
                countdown={countdown}
              />
              <PlayersList
                players={players.length > 0 ? players : mockPlayers}
                gameId={gameInfo.gameId}
                totalBet={gameInfo.totalBet}
              />
            </>
          )}

          {currentView === 'profile' && (
              <ProfileScreen user={user} />
          )}

          {currentView === 'admin' && (user?.role === 'superadmin' || user?.role === 'moderator') && (
              <AdminScreen />
          )}

        </div>

        {currentView === 'game' && <ControlPanel />}
        <BottomNav isAdmin={user?.role === 'superadmin' || user?.role === 'moderator'} />

        <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
      </div>
    </div>
  );
}

export default App;
