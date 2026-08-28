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
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-end justify-center">
        <div className="w-full max-w-md bg-[#1a1a1a] rounded-t-3xl p-6 h-[80vh] flex flex-col relative animate-slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white">
                <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-4">Wallet</h2>

            <div className="flex justify-center mb-6">
                <TonConnectButton />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#242424] p-4 rounded-xl flex flex-col items-center">
                    <ArrowDownToLine size={24} className="text-blue-400 mb-2" />
                    <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="w-16 bg-black text-center text-white rounded px-2 py-1 mb-2" />
                    <button onClick={handleDeposit} className="bg-blue-600 hover:bg-blue-500 w-full py-2 rounded-lg font-bold text-sm">Deposit</button>
                </div>
                <div className="bg-[#242424] p-4 rounded-xl flex flex-col items-center">
                    <ArrowUpFromLine size={24} className="text-pink-400 mb-2" />
                    <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-16 bg-black text-center text-white rounded px-2 py-1 mb-2" />
                    <button onClick={handleWithdraw} className="bg-pink-600 hover:bg-pink-500 w-full py-2 rounded-lg font-bold text-sm">Withdraw</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="flex items-center space-x-2 text-gray-400 mb-4">
                    <History size={18} />
                    <h3 className="font-semibold uppercase tracking-wider text-xs">Transaction History</h3>
                </div>
                {history.length === 0 ? (
                    <div className="text-center text-gray-600 py-4">No transactions found</div>
                ) : (
                    <div className="space-y-3">
                        {history.map((tx, idx) => (
                            <div key={idx} className="flex justify-between bg-[#121212] p-3 rounded-lg text-sm border border-[#333]">
                                <div className="flex flex-col">
                                   <span className="font-semibold capitalize text-gray-300">{tx.type}</span>
                                   <span className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleString()}</span>
                                </div>
                                <div className={`font-bold self-center ${tx.type === 'deposit' || tx.type === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.type === 'deposit' || tx.type === 'win' ? '+' : '-'}{tx.amount} GRAM
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
