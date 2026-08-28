export interface Player {
  id: string;
  username: string | null;
  avatar: string;
  betAmount: number;
  betCurrency: string;
  colorStart: string;
  colorEnd: string;
}

export const mockPlayers: Player[] = [
  {
    id: "user_1",
    username: "Alex_Pro",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    betAmount: 15, // P0 - BG
    betCurrency: "TON",
    colorStart: "#8B5CF6", // Violet 500
    colorEnd: "#D946EF",   // Fuchsia 500
  },
  {
    id: "user_2",
    username: "CryptoKing",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    betAmount: 7, // Corner 0
    betCurrency: "TON",
    colorStart: "#06B6D4", // Cyan 500
    colorEnd: "#3B82F6",   // Blue 500
  },
  {
    id: "user_3",
    username: null,
    avatar: "https://i.pravatar.cc/150?u=a04258a2462d826712d",
    betAmount: 3.5, // Corner 1
    betCurrency: "TON",
    colorStart: "#F59E0B", // Amber 500
    colorEnd: "#EF4444",   // Red 500
  },
  {
    id: "user_4",
    username: "Ninja",
    avatar: "https://i.pravatar.cc/150?u=a04258a2462d826752c",
    betAmount: 1, // Corner 2
    betCurrency: "TON",
    colorStart: "#10B981",
    colorEnd: "#059669",
  }
];

export const gameInfo = {
  gameId: "G-8A4F92",
  status: "waiting", // 'waiting' | 'starting' | 'live'
  totalBet: 26.5,
  currency: "TON"
};
