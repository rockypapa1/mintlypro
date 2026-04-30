import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Search, Edit2, ShieldBan, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newBalance, setNewBalance] = useState('');

  const [rulesError, setRulesError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setRulesError(false);
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(fetchedUsers);
      setLoading(false);
    }, (e: any) => {
      console.error(e);
      if (e?.message?.includes("Missing or insufficient permissions")) {
        setRulesError(true);
        toast.error("Firebase Rules Error: Please allow read/write in Firebase Console.");
      } else {
        toast.error("Failed to load users: " + e?.message);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    const balanceNum = parseInt(newBalance);
    if (isNaN(balanceNum)) return toast.error("Invalid amount");

    try {
      await setDoc(doc(db, "users", editingUser.id), {
        balance: balanceNum
      }, { merge: true });
      
      toast.success("Balance updated");
      setEditingUser(null);
      setNewBalance('');
    } catch (error) {
      toast.error("Failed to update balance");
    }
  };

  const handleToggleBlock = async (user: any) => {
    const isCurrentlyBlocked = user.isBlocked || false;
    try {
      await setDoc(doc(db, "users", user.id), {
        isBlocked: !isCurrentlyBlocked
      }, { merge: true });
      toast.success(isCurrentlyBlocked ? "User Unblocked" : "User Blocked");
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.uid?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {rulesError && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-2xl p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
            <ShieldBan className="w-5 h-5" />
            Firebase Security Rules Error
          </h2>
          <p className="text-sm">
            Your Firebase Firestore Database is blocking read/write requests. To fix this so the Admin panel can see all users:
          </p>
          <ol className="list-decimal pl-5 text-sm mt-3 space-y-1">
            <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-bold">Firebase Console</a></li>
            <li>Select your project <strong>earning-wh</strong></li>
            <li>Go to <strong>Firestore Database</strong> &gt; <strong>Rules</strong></li>
            <li>Replace the default rules with the secure rules provided by the AI Assistant.</li>
            <li>Click <strong>Publish</strong>. Then refresh this page.</li>
          </ol>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h1 className="text-2xl font-bold">Users Directory</h1>
        <div className="relative w-full sm:w-64">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500 animate-pulse font-medium">Loading users...</div>
      ) : (
        <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1a1a1a] text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Balance (₹)</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#151515] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} alt="" className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-bold text-white">{user.name}</p>
                          <p className="text-xs text-zinc-500">{user.email || user.phone}</p>
                          <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {user.balance?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {user.isBlocked ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 text-red-500 text-xs font-semibold">
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-semibold">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button 
                          onClick={() => {
                            setEditingUser(user);
                            setNewBalance(user.balance?.toString() || '0');
                          }}
                          className="p-2 bg-[#222] hover:bg-[#333] text-white rounded-lg transition-colors"
                          title="Edit Balance"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleBlock(user)}
                          className={`p-2 rounded-lg transition-colors ${user.isBlocked ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                          title={user.isBlocked ? "Unblock User" : "Block User"}
                        >
                          {user.isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-zinc-600 font-medium">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Balance Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#222] p-6 rounded-2xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Edit Balance</h3>
            <div className="mb-4 text-sm text-zinc-400">
              User: <span className="text-white font-semibold">{editingUser.name}</span>
            </div>
            <form onSubmit={handleUpdateBalance}>
              <div className="mb-6">
                <label className="block text-xs font-semibold text-zinc-500 mb-2">NEW BALANCE (₹)</label>
                <input 
                  type="number" 
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-3 bg-[#222] text-white font-semibold rounded-xl hover:bg-[#333] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
