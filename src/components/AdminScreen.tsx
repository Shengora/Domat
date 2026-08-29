import React, { useEffect, useState } from 'react';
import { getAdminUsers, adminBanUser, adminModifyBalance, getAdminTransactions, getAdminGames } from '../services/api';
import { Shield, Users, Activity, History, Ban, Wallet, Check } from 'lucide-react';

export const AdminScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'games'>('users');
    const [users, setUsers] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [editBalanceId, setEditBalanceId] = useState<string | null>(null);
    const [balanceInput, setBalanceInput] = useState<string>('');

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                const data = await getAdminUsers();
                setUsers(data);
            } else if (activeTab === 'transactions') {
                const data = await getAdminTransactions();
                setTransactions(data);
            } else if (activeTab === 'games') {
                const data = await getAdminGames();
                setGames(data);
            }
        } catch (e: any) {
            console.error(e);
            alert(e.response?.data?.message || 'Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleBan = async (id: string) => {
        if (!confirm('Are you sure you want to toggle ban for this user?')) return;
        try {
            await adminBanUser(id);
            fetchData();
        } catch (e: any) {
            alert(e.response?.data?.message || 'Action failed');
        }
    };

    const handleSaveBalance = async (id: string) => {
        const amount = parseFloat(balanceInput);
        if (isNaN(amount)) {
            alert('Invalid amount');
            return;
        }
        try {
            await adminModifyBalance(id, amount);
            setEditBalanceId(null);
            setBalanceInput('');
            fetchData();
            alert('Balance updated successfully');
        } catch (e: any) {
            alert(e.response?.data?.message || 'Balance update failed');
        }
    };

    return (
        <div className="w-full pb-10">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                <Shield className="text-red-500" size={28} />
                <div>
                    <h2 className="text-lg font-black text-white">Admin Dashboard</h2>
                    <p className="text-xs text-red-400 font-medium">Restricted Access</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition ${activeTab === 'users' ? 'bg-gray-800 border-gray-600' : 'bg-gray-900 border-gray-800 hover:bg-gray-800'}`}
                >
                    <Users size={20} className={activeTab === 'users' ? 'text-white' : 'text-gray-500'} />
                    <span className={`text-xs font-bold mt-1 ${activeTab === 'users' ? 'text-white' : 'text-gray-500'}`}>Users</span>
                </button>
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition ${activeTab === 'transactions' ? 'bg-gray-800 border-gray-600' : 'bg-gray-900 border-gray-800 hover:bg-gray-800'}`}
                >
                    <Activity size={20} className={activeTab === 'transactions' ? 'text-white' : 'text-gray-500'} />
                    <span className={`text-xs font-bold mt-1 ${activeTab === 'transactions' ? 'text-white' : 'text-gray-500'}`}>Transactions</span>
                </button>
                <button
                    onClick={() => setActiveTab('games')}
                    className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition ${activeTab === 'games' ? 'bg-gray-800 border-gray-600' : 'bg-gray-900 border-gray-800 hover:bg-gray-800'}`}
                >
                    <History size={20} className={activeTab === 'games' ? 'text-white' : 'text-gray-500'} />
                    <span className={`text-xs font-bold mt-1 ${activeTab === 'games' ? 'text-white' : 'text-gray-500'}`}>Games</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-gray-800 p-4 min-h-[300px]">
                {loading && <div className="text-center py-10 text-gray-500">Loading...</div>}

                {!loading && activeTab === 'users' && (
                    <div className="space-y-4">
                        {users.map(u => (
                            <div key={u.telegram_id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-sm font-bold text-white flex items-center space-x-2">
                                            <span>{u.username ? `@${u.username}` : u.telegram_id}</span>
                                            {u.is_banned && <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded-full uppercase">Banned</span>}
                                            {u.role !== 'user' && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full uppercase">{u.role}</span>}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">ID: {u.telegram_id}</div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setEditBalanceId(u.telegram_id.toString())}
                                            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-blue-400 transition"
                                            title="Add/Subtract GRAM"
                                        >
                                            <Wallet size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleBan(u.telegram_id.toString())}
                                            className={`p-2 rounded-lg transition ${u.is_banned ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                                            title={u.is_banned ? 'Unban User' : 'Ban User'}
                                        >
                                            {u.is_banned ? <Check size={16} /> : <Ban size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {editBalanceId === u.telegram_id.toString() && (
                                    <div className="bg-gray-800 p-3 rounded-lg flex items-center space-x-2 mt-2">
                                        <input
                                            type="number"
                                            placeholder="+/- Amount (e.g. 10 or -5)"
                                            value={balanceInput}
                                            onChange={(e) => setBalanceInput(e.target.value)}
                                            className="flex-1 bg-gray-900 text-sm text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                                        />
                                        <button
                                            onClick={() => handleSaveBalance(u.telegram_id.toString())}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-500 transition"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => { setEditBalanceId(null); setBalanceInput(''); }}
                                            className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-600 transition"
                                        >
                                            X
                                        </button>
                                    </div>
                                )}

                                <div className="text-xs text-gray-400">
                                    Balance: <span className="text-white font-bold">{u.balances?.[0]?.amount ? Number(u.balances[0].amount).toFixed(2) : '0.00'} GRAM</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && activeTab === 'transactions' && (
                    <div className="space-y-3">
                         {transactions.map(tx => (
                             <div key={tx.id} className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-800">
                                 <div>
                                     <div className={`text-xs font-bold uppercase ${tx.type === 'deposit' || tx.type === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                                         {tx.type}
                                     </div>
                                     <div className="text-[10px] text-gray-500 mt-0.5">User ID: {tx.user_id}</div>
                                 </div>
                                 <div className="text-right">
                                     <div className="text-sm font-bold text-white">{Number(tx.amount).toFixed(2)} G</div>
                                     <div className="text-[10px] text-gray-500">{new Date(tx.timestamp).toLocaleString()}</div>
                                 </div>
                             </div>
                         ))}
                    </div>
                )}

                {!loading && activeTab === 'games' && (
                    <div className="space-y-3">
                         {games.map(g => (
                             <div key={g.game_id} className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                                 <div className="flex justify-between items-center mb-2">
                                    <div className="text-xs text-gray-400">Game <span className="text-white font-bold">{g.game_id.split('-')[0]}</span></div>
                                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${g.status === 'finished' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {g.status}
                                    </div>
                                 </div>
                                 <div className="text-xs text-gray-500">
                                    Players: <span className="text-gray-300">{g.participants?.length || 0}</span>
                                 </div>
                             </div>
                         ))}
                    </div>
                )}
            </div>
        </div>
    );
};
