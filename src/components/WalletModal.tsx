import React, { useEffect, useState } from 'react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import { depositGram, withdrawGram, getHistory } from '../services/api';
import { useGameState } from '../GameStateContext';
import { X, ArrowDownToLine, ArrowUpFromLine, History } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const address = useTonAddress();
  const { setBalance, history, setHistory } = useGameState();
  const [depositAmount, setDepositAmount] = useState('1');
  const [withdrawAmount, setWithdrawAmount] = useState('1');

  useEffect(() => {
    if (isOpen) {
      getHistory().then(data => setHistory(data)).catch(console.error);
    }
  }, [isOpen, setHistory]);

  if (!isOpen) return null;

  const handleDeposit = async () => {
     if (!address) {
         alert('Please connect your TON wallet first');
         return;
     }
     try {
         // Mock sending real transaction
         const txHash = "mock_tx_hash_" + Date.now();
         const res = await depositGram(Number(depositAmount), txHash);
         setBalance(res.new_balance);
         alert('Deposit successful');
         getHistory().then(data => setHistory(data)).catch(console.error);
     } catch(e) {
         console.error(e);
     }
  }

  const handleWithdraw = async () => {
    try {
        const res = await withdrawGram(Number(withdrawAmount));
        setBalance(res.new_balance);
        alert('Withdraw successful');
        getHistory().then(data => setHistory(data)).catch(console.error);
    } catch(e: any) {
        alert(e?.response?.data?.message || 'Withdraw failed');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-end justify-center transition-opacity">
        <div className="w-full max-w-md bg-[#121212] border-t border-gray-800 rounded-t-3xl p-6 h-[85vh] flex flex-col relative animate-slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
            <button onClick={onClose} className="absolute right-5 top-5 bg-[#1e1e1e] rounded-full p-2 text-gray-400 hover:text-white transition">
                <X size={20} />
            </button>
            <h2 className="text-2xl font-black mb-6 text-center tracking-tight">WALLET</h2>

            <div className="flex justify-center mb-8">
                <TonConnectButton className="my-ton-connect-btn" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Deposit Card */}
                <div className="bg-[#1e1e1e] p-5 rounded-2xl flex flex-col items-center border border-gray-800 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                        <ArrowDownToLine size={24} />
                    </div>
                    <div className="text-sm text-gray-400 font-medium mb-1">Deposit GRAM</div>
                    <div className="flex items-center space-x-2 w-full mb-4">
                        <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="w-full bg-[#121212] border border-gray-700 text-center text-white font-bold rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition" />
                    </div>
                    <button onClick={handleDeposit} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-blue-500/20 relative z-10">
                        Deposit
                    </button>
                </div>

                {/* Withdraw Card */}
                <div className="bg-[#1e1e1e] p-5 rounded-2xl flex flex-col items-center border border-gray-800 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mb-4 text-pink-400">
                        <ArrowUpFromLine size={24} />
                    </div>
                    <div className="text-sm text-gray-400 font-medium mb-1">Withdraw GRAM</div>
                    <div className="flex items-center space-x-2 w-full mb-4">
                        <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full bg-[#121212] border border-gray-700 text-center text-white font-bold rounded-lg px-3 py-2 outline-none focus:border-pink-500 transition" />
                    </div>
                    <button onClick={handleWithdraw} className="w-full bg-pink-600 hover:bg-pink-500 text-white py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-pink-500/20 relative z-10">
                        Withdraw
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="flex items-center space-x-2 text-gray-400 mb-4 px-1">
                    <History size={16} />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Transaction History</h3>
                </div>
                {history.length === 0 ? (
                    <div className="bg-[#1e1e1e] rounded-xl p-8 text-center border border-gray-800">
                        <div className="text-gray-500 text-sm">No transactions yet</div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {history.map((tx, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-[#1e1e1e] p-4 rounded-xl border border-gray-800">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'deposit' || tx.type === 'win' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {tx.type === 'deposit' || tx.type === 'win' ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="font-bold text-white capitalize text-sm">{tx.type}</span>
                                       <span className="text-[11px] text-gray-500">{new Date(tx.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className={`font-black ${tx.type === 'deposit' || tx.type === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.type === 'deposit' || tx.type === 'win' ? '+' : '-'}{tx.amount} <span className="text-xs font-bold text-gray-500">GRAM</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
