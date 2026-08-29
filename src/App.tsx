
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

        {/* Header with Avatar on Left, Balance on Right */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-4 shrink-0 bg-[#121212] z-40">
           {/* Left side: Avatar */}
           <div className="flex items-center space-x-3">
               <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-800 border-2 border-purple-500/50 flex-shrink-0">
                  <img src={user ? `https://i.pravatar.cc/150?u=${user.id}` : 'https://i.pravatar.cc/150'} alt="Avatar" className="w-full h-full object-cover" />
               </div>
           </div>

           {/* Right side: Balance & Wallet */}
           <div className="flex items-center space-x-3">
               <div className="flex items-center space-x-2 cursor-pointer bg-[#1A1A1A] hover:bg-[#242424] px-3 py-1.5 rounded-full transition border border-gray-800" onClick={() => setIsWalletOpen(true)}>
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                     <span className="text-blue-400 font-bold text-xs">G</span>
                  </div>
                  <span className="font-bold text-sm">{(balance || 0).toFixed(2)}</span>
               </div>
               <button onClick={() => setIsWalletOpen(true)} className="text-xs font-semibold text-gray-400 hover:text-white px-3 py-1.5 rounded-full border border-gray-800">
                   Wallet
               </button>
           </div>
        </div>

        {/* Sub-header for History and How To Play */}
        {currentView === 'game' && (
            <div className="flex items-center justify-between px-4 py-3 bg-[#1A1A1A] border-b border-gray-800 z-30">
                <div className="flex space-x-4">
                    <button className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition">
                        History
                    </button>
                    <button className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition">
                        How to play
                    </button>
                </div>
                <div className="flex space-x-4 text-xs font-medium text-gray-500">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase text-gray-600">Top Game</span>
                        <span className="text-green-400">#4829</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase text-gray-600">Last Game</span>
                        <span className="text-purple-400">#8912</span>
                    </div>
                </div>
            </div>
        )}

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
