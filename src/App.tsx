
import { useEffect } from 'react';
import { mockPlayers, gameInfo } from './data/mockData';
import { BattleArea } from './components/BattleArea';
import { PlayersList } from './components/PlayersList';
import { ControlPanel } from './components/ControlPanel';
import { BottomNav } from './components/BottomNav';
import { authTelegram, gameSocket } from './services/api';
import { useGameState } from './GameStateContext';

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

function App() {
  const { status, setStatus, countdown, setCountdown, setWinnerFactor, setWinnerId, players, setPlayers } = useGameState();

  useEffect(() => {
    // initialize with mock data until real backend sends it
    setPlayers(mockPlayers);

    const initApp = async () => {
      const initData = window.Telegram?.WebApp?.initData || "query_id=mock_query_id&user=%7B%22id%22%3A123456%2C%22first_name%22%3A%22Mock%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22mockuser%22%2C%22language_code%22%3A%22en%22%7D&auth_date=1626294744&hash=mock_hash";

      try {
        await authTelegram(initData);
        gameSocket.connect();
      } catch (e) {
        console.error('Authentication failed', e);
      }
    };

    initApp();

    gameSocket.onGameState((data) => setStatus(data.status));
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
    });

    const handleMockJoin = () => {
       gameSocket.joinGame();
    }
    window.addEventListener('mock-join', handleMockJoin);

    return () => {
      gameSocket.disconnect();
      window.removeEventListener('mock-join', handleMockJoin);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex justify-center">
      <div className="w-full max-w-md bg-[#121212] h-screen relative flex flex-col shadow-2xl overflow-hidden">

        {/* Main Content Container */}
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-[200px] no-scrollbar">

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

        </div>

        <ControlPanel />
        <BottomNav />

      </div>
    </div>
  );
}

export default App;
