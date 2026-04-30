import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Bell, ChevronRight, Gift, Trophy, MessageCircle, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Home() {
  const { appUser, updateUser } = useAuth();
  const [isClaiming, setIsClaiming] = useState(false);
  const [hideWelcome, setHideWelcome] = useState(false);
  
  // Checking for welcome bonus popup state locally to prevent flicker while firestore updates
  const hasSeenWelcome = appUser?.hasSeenWelcomeBonus;
  
  if (!appUser) return null;

  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const lastClaimed = appUser.lastClaimedTimestamp || 0;
  const timeSinceLastClaim = now - lastClaimed;
  const hasClaimedToday = timeSinceLastClaim < ONE_DAY_MS;
  
  const handleAcknowledgeWelcome = async () => {
    setHideWelcome(true); // Hide immediately
    localStorage.setItem(`welcome_${appUser.uid}`, 'true');
    try {
      await updateUser({ hasSeenWelcomeBonus: true });
    } catch (e) {
      console.error(e);
    }
  };

  const handleClaimReward = async () => {
    if (hasClaimedToday) {
      const remainingHours = Math.ceil((ONE_DAY_MS - timeSinceLastClaim) / (1000 * 60 * 60));
      toast(`Come back in ${remainingHours} hours for your next reward!`, { icon: '⏳' });
      return;
    }

    setIsClaiming(true);
    const loadToast = toast.loading('Claiming reward...');
    
    try {
      const rewardPoints = 1; // ₹1 daily
      await updateUser({ 
        balance: appUser.balance + rewardPoints,
        streak: (appUser.streak || 0) + 1,
        lastClaimedTimestamp: now,
      });
      
      await addDoc(collection(db, "transactions"), {
        userId: appUser.uid,
        title: "Daily Check-in",
        type: "earn",
        amount: rewardPoints,
        status: "completed",
        createdAt: new Date().toISOString()
      });
      
      toast.dismiss(loadToast);
      toast.success('You earned ₹1!');
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error('Failed to claim reward');
    } finally {
      setIsClaiming(false);
    }
  };

  const hasSeenWelcomeLocally = localStorage.getItem(`welcome_${appUser.uid}`) === 'true';

  return (
    <div className="space-y-6 pb-6 relative">
      {/* Welcome Bonus Modal */}
      {hasSeenWelcome === false && !hideWelcome && !hasSeenWelcomeLocally && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            className="bg-gradient-to-b from-[#1a1a1a] to-[#111111] border border-amber-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl shadow-amber-500/20"
          >
            <div className="w-24 h-24 bg-amber-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
              <Gift className="w-12 h-12 text-black" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome Bonus! 🎉</h2>
            <p className="text-zinc-400 mb-6 font-medium">You received a welcome bonus of <span className="text-amber-400 font-bold">₹80</span> for creating your new account!</p>
            <div className="bg-black/50 rounded-2xl p-4 mb-8 border border-white/5">
              <p className="text-sm text-zinc-500 font-bold">YOUR BALANCE</p>
              <p className="text-4xl font-black text-white mt-1">₹80</p>
            </div>
            <button 
              onClick={handleAcknowledgeWelcome}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-xl text-lg transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
            >
              Start Earning
            </button>
          </motion.div>
        </div>
      )}
      {/* Mobile Top Bar Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2">
        <div>
          <h2 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase mb-1">MINTLY PRO</h2>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Hello, {appUser.name.split(' ')[0]} 👋
          </h1>
        </div>
        <button 
          onClick={() => toast('No new notifications')}
          className="absolute top-4 right-4 md:relative md:top-auto md:right-auto w-10 h-10 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          <Bell className="w-5 h-5 text-zinc-300" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
      </div>

      {/* Hero Balance Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-[#00d2ff] to-[#3a7bd5] text-white shadow-xl shadow-[#00d2ff]/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <p className="text-white/90 font-medium">Total Balance</p>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                <span className="text-amber-400 text-sm">₹</span>
                <span className="font-bold text-sm">₹{appUser.balance.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-5xl font-bold tracking-tight">₹{appUser.balance.toLocaleString()}</h2>
            </div>
            
            <Link to="/wallet" className="inline-flex items-center gap-1 bg-white text-slate-900 px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm">
              Withdraw Funds <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Reward Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-[#111111] border-[#222222]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Daily Reward</h3>
                  <p className="text-xs text-zinc-400">Streak: {appUser.streak || 0} Days</p>
                </div>
              </div>
              <button 
                onClick={handleClaimReward}
                disabled={isClaiming || hasClaimedToday}
                className={`${hasClaimedToday ? 'bg-[#222222] text-zinc-500' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20'} px-4 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-all`}
              >
                {isClaiming ? '...' : hasClaimedToday ? 'Claimed' : 'Claim'}
              </button>
            </div>
            
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const currentStreak = appUser.streak || 0;
                const isClaimed = currentStreak >= day && !(currentStreak === day && !hasClaimedToday) || (currentStreak + 1 === day && hasClaimedToday);
                return (
                  <div key={day} className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-xl border ${isClaimed ? 'border-amber-500/50 bg-amber-500/10' : 'border-[#333333] bg-[#1a1a1a]'}`}>
                    <span className={`text-[10px] font-medium mb-1 ${isClaimed ? 'text-amber-500' : 'text-zinc-500'}`}>Day {day}</span>
                    <Gift className={`w-5 h-5 ${isClaimed ? 'text-amber-500' : 'text-zinc-600'}`} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/whatsapp">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full bg-gradient-to-br from-[#111111] to-[#112211] border-[#222222] hover:border-[#00ec77] transition-all">
              <CardContent className="p-5 flex flex-col">
                <div className="w-10 h-10 rounded-full bg-[#00ec77]/20 flex items-center justify-center text-[#00ec77] mb-3">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">WhatsApp</h3>
                <p className="text-xs text-zinc-400">Link to earn ₹1200</p>
              </CardContent>
            </Card>
          </motion.div>
        </Link>
        
        <Link to="/sms">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="h-full bg-gradient-to-br from-[#111111] to-[#111a2a] border-[#222222] hover:border-[#3a7bd5] transition-all">
              <CardContent className="p-5 flex flex-col">
                <div className="w-10 h-10 rounded-full bg-[#3a7bd5]/20 flex items-center justify-center text-[#3a7bd5] mb-3">
                  <MessageSquare className="w-5 h-5 fill-current" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">SMS Task</h3>
                <p className="text-xs text-zinc-400">Read & earn ₹500</p>
              </CardContent>
            </Card>
          </motion.div>
        </Link>

        <div className="col-span-2">
          <Link to="/leaderboard">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="h-full bg-gradient-to-br from-[#111111] to-[#221a11] border-[#222222] hover:border-[#d97706] transition-all cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Leaderboard</h3>
                    <p className="text-sm text-zinc-400">Rank & Win big</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-500 ml-auto" />
                </CardContent>
              </Card>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
