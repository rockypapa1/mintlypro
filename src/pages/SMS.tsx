import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MessageSquare, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SMS() {
  const { appUser } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!appUser) return;
    const q = query(collection(db, "sms_requests"), where("userId", "==", appUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Firestore error:", error);
    });
    return () => unsubscribe();
  }, [appUser]);

  const handleSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    if (!appUser) return;

    setIsLoading(true);
    try {
      await addDoc(collection(db, "sms_requests"), {
        userId: appUser.uid,
        phoneNumber,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      toast.success("Request sent to Admin! Wait for approval to get balance.");
      setPhoneNumber("");
    } catch (error) {
      toast.error("Failed to send request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">SMS Task</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-[#111111] text-white border-[#222222]">
          <CardContent className="p-6 md:p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#3a7bd5]/10 flex items-center justify-center text-[#3a7bd5] mb-4">
              <MessageSquare className="w-8 h-8 fill-current" />
            </div>
            <h2 className="text-xl font-bold mb-2">Enable SMS to Earn</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-sm">
              Keep the SMS receiver active on your device to earn up to ₹500 weekly.
            </p>

            <div className="w-full flex rounded-xl border border-[#333333] overflow-hidden mb-4 focus-within:ring-2 focus-within:ring-[#3a7bd5] focus-within:border-transparent transition-all">
              <div className="bg-[#1a1a1a] px-4 py-3 border-r border-[#333333] flex items-center gap-2 text-sm font-medium">
                <span className="text-zinc-400">IN</span>
                <span className="text-[#3a7bd5]">+91 ▾</span>
              </div>
              <input 
                type="tel" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number" 
                className="flex-1 px-4 py-3 outline-none w-full bg-[#0a0a0a] text-white placeholder:text-zinc-600"
              />
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-bold bg-[#8b91a5] hover:bg-[#6c7285] text-white transition-colors border-0 h-auto active:scale-[0.98]"
            >
              {isLoading ? 'Submitting...' : 'Send Request'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="font-medium text-white mb-3 pl-1">How it works:</h3>
        <Card className="bg-[#111111] text-white border-[#222222]">
          <CardContent className="p-5">
            <ol className="text-sm text-zinc-400 space-y-3 list-decimal list-inside marker:text-zinc-500">
              <li>Enter your phone number above</li>
              <li>Wait for admin to verify and approve</li>
              <li>Once approved, you will start earning</li>
              <li>Keep the app installed to receive passive income</li>
            </ol>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="font-medium text-white mb-3 pl-1">Status</h3>
        <Card className="bg-[#111111] text-zinc-500 border-[#222222]">
           <CardContent className="p-0">
            {requests.length === 0 ? (
              <div className="p-6 text-center text-sm font-medium">Service inactive.</div>
            ) : (
              <div className="divide-y divide-[#222222]">
                {requests.map(req => (
                  <div key={req.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">{req.phoneNumber}</p>
                      <p className="text-xs mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      {req.status === 'pending' ? (
                        <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-1 rounded text-xs font-bold">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#00ec77] bg-[#00ec77]/10 px-2 py-1 rounded text-xs font-bold">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
