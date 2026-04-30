import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Search, CheckCircle, XCircle, ShieldBan } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rulesError, setRulesError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setRulesError(false);
    const q = query(collection(db, "withdrawals"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by newest first
      fetched.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setWithdrawals(fetched);
      setLoading(false);
    }, (e: any) => {
      console.error(e);
      if (e?.message?.includes("Missing or insufficient permissions")) {
        setRulesError(true);
        toast.error("Firebase Rules Error: Please allow read/write in Firebase Console.");
      } else {
        toast.error("Failed to load withdrawals");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (withdrawal: any, newStatus: string) => {
    try {
      await setDoc(doc(db, "withdrawals", withdrawal.id), {
        status: newStatus,
        updatedAt: Date.now()
      }, { merge: true });

      if (withdrawal.transactionId) {
         await setDoc(doc(db, "transactions", withdrawal.transactionId), {
           status: newStatus
         }, { merge: true });
      }

      if (newStatus === 'Rejected') {
        const userRef = doc(db, "users", withdrawal.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const currentBalance = userData.balance || 0;
          await setDoc(userRef, { balance: currentBalance + withdrawal.amount }, { merge: true });

          await setDoc(doc(collection(db, "transactions")), {
            userId: withdrawal.userId,
            title: `Refund: ${withdrawal.method} Withdrawal Rejected`,
            type: "earn",
            amount: withdrawal.amount,
            status: "completed",
            createdAt: new Date().toISOString()
          });
        }
      }

      toast.success(`Request marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filtered = withdrawals.filter(w => 
    w.userId?.includes(searchTerm) || 
    w.method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.details?.toLowerCase().includes(searchTerm.toLowerCase())
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
            Your Firebase Firestore Database is blocking read/write requests. To fix this so the Admin panel can manage withdrawals:
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
        <h1 className="text-2xl font-bold">Withdrawal Requests</h1>
        <div className="relative w-full sm:w-64">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500 animate-pulse font-medium">Loading requests...</div>
      ) : (
        <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1a1a1a] text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">User ID</th>
                  <th className="px-4 py-3 font-medium">Method & Details</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-[#151515] transition-colors">
                    <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                      {new Date(req.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                      {req.userId}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-white">{req.method}</p>
                      <p className="text-amber-500 text-xs mt-0.5">{req.details}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-right">
                      {req.amount} ₹
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                        req.status === 'Approved' ? 'bg-green-500/10 text-green-500' :
                        req.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {req.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(req.status === 'Pending' || !req.status) && (
                        <div className="flex items-center gap-2 justify-end">
                          <button 
                            onClick={() => handleUpdateStatus(req, 'Approved')}
                            className="p-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(req, 'Rejected')}
                            className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-zinc-600 font-medium">No withdrawal requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
