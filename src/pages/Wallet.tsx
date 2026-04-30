import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const WITHDRAWAL_METHODS = [
  { id: "upi", name: "UPI", min: 220, icon: "📱", color: "bg-green-500/20 text-green-500 border-green-500/30" },
  { id: "bank", name: "Bank Account", min: 220, icon: "🏦", color: "bg-blue-500/20 text-blue-500 border-blue-500/30" },
];

export default function Wallet() {
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const { appUser, updateUser } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Method Details
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");
  
  const [bankAcc, setBankAcc] = useState("");
  const [bankName, setBankName] = useState("");
  const [ifsc, setIfsc] = useState("");
  
  useEffect(() => {
    if (appUser?.paymentConfig) {
      if (appUser.paymentConfig.upiId) setUpiId(appUser.paymentConfig.upiId);
      if (appUser.paymentConfig.upiName) setUpiName(appUser.paymentConfig.upiName);
      if (appUser.paymentConfig.bankAcc) setBankAcc(appUser.paymentConfig.bankAcc);
      if (appUser.paymentConfig.bankName) setBankName(appUser.paymentConfig.bankName);
      if (appUser.paymentConfig.ifsc) setIfsc(appUser.paymentConfig.ifsc);
    }
  }, [appUser?.paymentConfig]);

  useEffect(() => {
    if (!appUser) return;
    const q = query(
      collection(db, "transactions"), 
      where("userId", "==", appUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      // Sort client-side to avoid requiring a composite index
      txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(txs);
    }, (error) => {
      console.error("Error fetching transactions:", error);
    });

    return () => unsubscribe();
  }, [appUser]);

  if (!appUser) return null;

  const currentBalance = appUser.balance;

  const handleWithdraw = async () => {
    const method = WITHDRAWAL_METHODS.find(m => m.id === selectedMethod);
    if (!method) return;

    if (currentBalance < method.min) {
      toast.error(`Insufficient balance. Minimum is ${method.min} ₹.`);
      return;
    }
    
    let withdrawalDetails = "";
    if (selectedMethod === "upi") {
      if (!upiId || !upiName) {
        return toast.error("Please fill in all UPI details.");
      }
      withdrawalDetails = `UPI ID: ${upiId} | Name: ${upiName} | Email: ${appUser.email}`;
    } else if (selectedMethod === "bank") {
      if (!bankAcc || !bankName || !ifsc) {
        return toast.error("Please fill in all Bank Account details.");
      }
      withdrawalDetails = `Acc: ${bankAcc} | Name: ${bankName} | IFSC: ${ifsc} | Email: ${appUser.email}`;
    }

    setIsLoading(true);
    try {
      // Save details to profile automatically
      const paymentConfig = appUser.paymentConfig || {};
      if (selectedMethod === "upi") {
        paymentConfig.upiId = upiId;
        paymentConfig.upiName = upiName;
      } else if (selectedMethod === "bank") {
        paymentConfig.bankAcc = bankAcc;
        paymentConfig.bankName = bankName;
        paymentConfig.ifsc = ifsc;
      }

      await updateUser({ 
        balance: currentBalance - method.min,
        paymentConfig 
      });
      const newTx = {
        userId: appUser.uid,
        title: `${method.name} Withdrawal`,
        type: "withdraw",
        amount: method.min,
        status: "Pending",
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "transactions"), newTx);

      const withdrawalData = {
        userId: appUser.uid,
        amount: method.min,
        method: method.name,
        details: withdrawalDetails,
        status: "Pending",
        transactionId: docRef.id,
        timestamp: Date.now()
      };

      await addDoc(collection(db, "withdrawals"), withdrawalData);
      setTransactions([{ id: docRef.id, ...newTx }, ...transactions]);
      toast.success('Withdrawal request submitted! Details saved.');
    } catch (error) {
      toast.error('Failed to submit withdrawal request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Wallet</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage your balance and withdrawals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-gradient-to-r from-[#00d2ff] to-[#3a7bd5] text-white border-0 overflow-hidden relative shadow-xl shadow-[#00d2ff]/20">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-2 text-white/90 mb-2">
                <WalletIcon className="w-5 h-5" />
                <span className="font-medium">Available Balance</span>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <h2 className="text-4xl md:text-5xl font-bold">{currentBalance.toLocaleString()}</h2>
                <span className="text-xl text-amber-400 mb-1">₹</span>
              </div>
              <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full rounded-full" style={{ width: `${Math.min(100, (currentBalance / 5000) * 100)}%` }} />
              </div>
              <p className="text-xs text-white/80 mt-2 text-center">
                {currentBalance < 5000 ? `${5000 - currentBalance} balance away from minimum PayPal withdrawal.` : 'Ready for withdrawal!'}
              </p>
            </CardContent>
          </Card>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Select Payout Method</h3>
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
              {WITHDRAWAL_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    selectedMethod === method.id 
                    ? `border-[#00d2ff] ring-4 ring-[#00d2ff]/20 bg-[#111111]` 
                    : `border-[#222222] hover:border-[#333333] bg-[#0a0a0a]`
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 ${method.color}`}>
                    {method.icon}
                  </div>
                  <span className="font-bold text-white text-sm">{method.name}</span>
                  <span className="text-xs text-zinc-400 mt-1 font-medium">Min: {method.min.toLocaleString()} ₹</span>
                </button>
              ))}
            </div>

            <div className="space-y-4 mb-6">
              {selectedMethod === "upi" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2">UPI ID</label>
                    <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2">HOLDER NAME</label>
                    <input type="text" value={upiName} onChange={e => setUpiName(e.target.value)} placeholder="John Doe" className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                </>
              )}

              {selectedMethod === "bank" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2">ACCOUNT NUMBER</label>
                    <input type="text" value={bankAcc} onChange={e => setBankAcc(e.target.value)} placeholder="000123456789" className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2">HOLDER NAME</label>
                    <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="John Doe" className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2">IFSC CODE</label>
                    <input type="text" value={ifsc} onChange={e => setIfsc(e.target.value)} placeholder="HDFC0001234" className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                </>
              )}
            </div>

            {(() => {
              const selectedObj = WITHDRAWAL_METHODS.find(m => m.id === selectedMethod);
              const minLimit = selectedObj?.min || 5000;
              return (
                <>
                  <Button 
                    size="lg" 
                    disabled={isLoading}
                    className={`w-full text-base h-14 border-0 ${currentBalance < minLimit ? 'bg-[#222] text-zinc-500 cursor-not-allowed' : 'bg-[#3a7bd5] hover:bg-[#2563eb] active:scale-95 transition-all'}`} 
                    onClick={handleWithdraw}
                  >
                    {isLoading ? 'Processing...' : 'Withdraw Funds'}
                  </Button>
                  {currentBalance < minLimit && (
                    <p className="text-xs text-center text-zinc-500 mt-3 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Minimum withdrawal is {minLimit.toLocaleString()} ₹.
                    </p>
                  )}
                </>
              )
            })()}
          </div>
        </div>

        <div className="md:col-span-1">
          <Card className="h-full bg-[#111111] border-[#222222]">
            <CardContent className="p-0 flex flex-col h-full max-h-[500px]">
              <div className="p-5 border-b border-[#222222] flex items-center justify-between shrink-0">
                <h3 className="font-bold text-white">Recent Transactions</h3>
              </div>
              <div className="divide-y divide-[#222222] overflow-y-auto flex-1">
                {transactions.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500 text-sm">No transactions yet.</div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors bg-[#111111]">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center ${tx.type === 'earn' ? 'bg-[#00ec77]/20 text-[#00ec77]' : 'bg-rose-500/20 text-rose-500'}`}>
                          {tx.type === 'earn' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-white truncate max-w-[120px]">{tx.title}</p>
                          <p className="text-xs text-zinc-500 flex items-center gap-1">
                            {tx.status === 'pending' && <Clock className="w-3 h-3 text-amber-500" />}
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-sm shrink-0 ${tx.type === 'earn' ? 'text-[#00ec77]' : 'text-white'}`}>
                          {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                        </div>
                        {tx.type === 'withdraw' && (
                          <div className={`text-[10px] font-bold mt-0.5 uppercase tracking-wider ${tx.status === 'Success' || tx.status === 'Approved' ? 'text-[#00ec77]' : tx.status === 'Rejected' ? 'text-rose-500' : 'text-amber-500'}`}>
                            {tx.status === 'Success' || tx.status === 'Approved' ? 'Success' : tx.status === 'Rejected' ? 'Rejected' : 'Pending'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
