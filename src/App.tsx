
import { mockPlayers, gameInfo } from './data/mockData';
import { BattleArea } from './components/BattleArea';
import { PlayersList } from './components/PlayersList';
import { ControlPanel } from './components/ControlPanel';
import { BottomNav } from './components/BottomNav';

function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex justify-center">
      <div className="w-full max-w-md bg-[#121212] h-screen relative flex flex-col shadow-2xl overflow-hidden">

        {/* Main Content Container */}
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-[200px] no-scrollbar">

          <BattleArea
            players={mockPlayers}
            totalBet={gameInfo.totalBet}
            currency={gameInfo.currency}
            status={gameInfo.status}
          />

          <PlayersList
            players={mockPlayers}
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
