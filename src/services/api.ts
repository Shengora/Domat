import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authTelegram = async (initData: string) => {
  const response = await apiClient.post('/auth/telegram', { initData });
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
};

export const depositGram = async (amount: number, txHash: string) => {
  const response = await apiClient.post('/payments/deposit', { amount, txHash });
  return response.data;
};

export const withdrawGram = async (amount: number) => {
  const response = await apiClient.post('/payments/withdraw', { amount });
  return response.data;
};

export const getBalance = async () => {
  const response = await apiClient.get('/payments/balance');
  return response.data;
};

export const getHistory = async () => {
  const response = await apiClient.get('/payments/history');
  return response.data;
};

export class GameSocket {
  private socket: Socket;

  constructor() {
    this.socket = io(WS_URL, { autoConnect: false });
  }

  connect() {
    const token = localStorage.getItem('token');
    this.socket.io.opts.extraHeaders = {
      Authorization: `Bearer ${token}`
    };
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }

  onGameState(callback: (data: any) => void) {
    this.socket.on('game_state', callback);
  }

  onGameStarting(callback: (data: any) => void) {
    this.socket.on('game_starting', callback);
  }

  onGameTick(callback: (data: any) => void) {
    this.socket.on('game_tick', callback);
  }

  onGameLive(callback: (data: any) => void) {
    this.socket.on('game_live', callback);
  }

  onGameFinished(callback: (data: any) => void) {
    this.socket.on('game_finished', callback);
  }

  joinGame(betAmount: number) {
    this.socket.emit('join_game', { betAmount });
  }
}

export const gameSocket = new GameSocket();

export const getGifts = async () => {
  const response = await apiClient.get('/gifts');
  return response.data;
};

export const withdrawGifts = async (giftIds: string[]) => {
  const response = await apiClient.post('/gifts/withdraw', { giftIds });
  return response.data;
};

export const mockDepositGift = async (type: string, estimatedValue: number) => {
  const response = await apiClient.post('/gifts/mock-deposit', { type, estimatedValue });
  return response.data;
};
