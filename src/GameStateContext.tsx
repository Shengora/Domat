import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Player } from './data/mockData';

interface GameStateContextType {
  status: 'waiting' | 'starting' | 'live' | 'finished';
  setStatus: (status: 'waiting' | 'starting' | 'live' | 'finished') => void;
  countdown: number | null;
  setCountdown: (countdown: number | null) => void;
  winnerFactor: number | null;
  setWinnerFactor: (factor: number | null) => void;
  winnerId: string | number | null;
  setWinnerId: (id: string | number | null) => void;
  players: Player[];
  setPlayers: (players: Player[]) => void;
  balance: number;
  setBalance: (bal: number) => void;
  history: any[];
  setHistory: (hist: any[]) => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<'waiting' | 'starting' | 'live' | 'finished'>('waiting');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [winnerFactor, setWinnerFactor] = useState<number | null>(null);
  const [winnerId, setWinnerId] = useState<string | number | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);

  return (
    <GameStateContext.Provider value={{ status, setStatus, countdown, setCountdown, winnerFactor, setWinnerFactor, winnerId, setWinnerId, players, setPlayers, balance, setBalance, history, setHistory }}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};
