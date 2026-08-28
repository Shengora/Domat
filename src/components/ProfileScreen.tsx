import React, { useEffect, useState } from 'react';
import { useGameState } from '../GameStateContext';
import { getGifts, withdrawGifts, mockDepositGift } from '../services/api';
import { Gift as GiftIcon, Download, Plus, Check } from 'lucide-react';

interface ProfileScreenProps {
  user: { id: number, firstName: string, username: string } | null;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const { gifts, setGifts, balance, setBalance } = useGameState();
  const [selectedGifts, setSelectedGifts] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchGifts = async () => {
      try {
          const data = await getGifts();
          setGifts(data);
      } catch (e) {
          console.error("Failed to fetch gifts", e);
      }
  };

  useEffect(() => {
      fetchGifts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSelect = (giftId: string) => {
      setSelectedGifts(prev =>
          prev.includes(giftId) ? prev.filter(id => id !== giftId) : [...prev, giftId]
      );
  };

  const handleWithdraw = async () => {
      if (selectedGifts.length === 0) return;
      const totalFee = selectedGifts.length * 0.25;

      if (balance < totalFee) {
          alert(`Insufficient GRAM balance. Need ${totalFee} GRAM for commission.`);
          return;
      }

      setLoading(true);
      try {
          const res = await withdrawGifts(selectedGifts);
          alert(res.message);
          setBalance(res.new_balance);
          setSelectedGifts([]);
          fetchGifts();
      } catch (e: any) {
          alert(e.response?.data?.message || 'Failed to withdraw gifts');
      } finally {
          setLoading(false);
      }
  };

  const handleMockAdd = async () => {
      try {
          await mockDepositGift('Star', 10);
          alert('Mock gift added to inventory');
          fetchGifts();
          setIsAddModalOpen(false);
      } catch (e) {
          console.error(e);
      }
  };

  const totalFee = selectedGifts.length * 0.25;

  return (
    <div className="w-full pb-10">
      {/* User Info Section */}
      <div className="flex flex-col items-center justify-center bg-[#1A1A1A] rounded-2xl p-6 mb-6 border border-gray-800 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
         <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-800 shadow-[0_0_15px_rgba(168,85,247,0.4)] mb-4">
             <img src={user ? `https://i.pravatar.cc/150?u=${user.id}` : 'https://i.pravatar.cc/150'} alt="Avatar" className="w-full h-full object-cover" />
         </div>
         <h2 className="text-xl font-black text-white">{user?.firstName || 'Player'}</h2>
         <p className="text-gray-400 text-sm font-medium mt-1">@{user?.username || 'player'}</p>
      </div>

      {/* Inventory Section */}
      <div className="bg-[#1A1A1A] rounded-2xl border border-gray-800 p-4">
         <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
             <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <GiftIcon size={20} className="text-pink-400" />
                    <span>Inventory</span>
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">You have {gifts.length} gifts</p>
             </div>

             <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition"
             >
                 <Plus size={20} />
             </button>
         </div>

         {/* Gift Grid */}
         {gifts.length === 0 ? (
             <div className="py-8 text-center text-gray-500 font-medium">
                 Your inventory is empty.
             </div>
         ) : (
             <div className="grid grid-cols-3 gap-3 mb-6">
                 {gifts.map(gift => {
                     const isSelected = selectedGifts.includes(gift.gift_id);
                     return (
                         <div
                            key={gift.gift_id}
                            onClick={() => toggleSelect(gift.gift_id)}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all border-2 relative
                                ${isSelected ? 'border-pink-500 bg-pink-500/10' : 'border-gray-800 bg-gray-900 hover:border-gray-700'}`}
                         >
                             {isSelected && (
                                 <div className="absolute top-1 right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                                     <Check size={10} className="text-white" />
                                 </div>
                             )}
                             <GiftIcon size={32} className={isSelected ? 'text-pink-400' : 'text-gray-500'} />
                             <span className="text-xs font-bold mt-2 text-gray-300">{gift.type}</span>
                         </div>
                     );
                 })}
             </div>
         )}

         {/* Withdraw Action */}
         {selectedGifts.length > 0 && (
             <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                 <div className="flex justify-between items-center mb-3">
                     <span className="text-sm text-gray-400">Selected ({selectedGifts.length})</span>
                     <span className="text-sm font-bold text-white">Fee: {totalFee} GRAM</span>
                 </div>
                 <button
                    onClick={handleWithdraw}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:shadow-[0_0_20px_rgba(236,72,153,0.6)] transition disabled:opacity-50"
                 >
                     <Download size={18} />
                     <span>Withdraw Gifts</span>
                 </button>
             </div>
         )}
      </div>

      {/* Add Gift Modal */}
      {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-[#1A1A1A] w-full max-w-sm rounded-2xl border border-gray-800 p-6 relative">
                <button
                   onClick={() => setIsAddModalOpen(false)}
                   className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                   ✕
                </button>
                <h3 className="text-xl font-black text-white mb-4">Add Gift</h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    To add a gift to your inventory, send it directly to our official system bot in Telegram. It will automatically appear here within seconds.
                </p>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center mb-6">
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Send to</span>
                    <span className="text-lg text-blue-400 font-bold">@SizningLoyihaBot</span>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleMockAdd}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition"
                    >
                        Mock Deposit (For Testing)
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(false)}
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition"
                    >
                        Close
                    </button>
                </div>
             </div>
          </div>
      )}

    </div>
  );
};
