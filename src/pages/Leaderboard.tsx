import React, { useMemo, useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trophy, Medal, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Leaderboard() {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const [realUsers, setRealUsers] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("balance", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        isReal: true,
        ...doc.data()
      }));
      setRealUsers(users);
    }, (error) => {
      console.error("Leaderboard error:", error);
    });

    return () => unsubscribe();
  }, []);

  const leaderboardData = useMemo(() => {
    const users = [...realUsers];
    const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharva", "Rohan", "Kabir", "Dhruv", "Zara", "Anya", "Diya", "Priya", "Riya", "Kavya", "Sanya", "Tara", "Neha", "Maya", "John", "David", "Michael", "Chris", "Sarah", "Emily", "Jessica", "Lisa", "Emma"];
    const lastNames = ["Kumar", "Singh", "Sharma", "Patel", "Verma", "Chauhan", "Yadav", "Gupta", "Das", "Rajput", "Smith", "Johnson", "Williams", "Brown", "Jones"];

    // Use a seeded approach so they don't randomly shuffle on every state change
    for (let i = 0; i < 100; i++) {
      // Deterministic pseudo-random based on index to keep leaderboard somewhat stable
      const seedName = (i * 13) % firstNames.length;
      const seedLast = (i * 17) % lastNames.length;
      const seedPoints = (i * 997) % (100000 - 12000 + 1) + 12000;
      
      users.push({
        id: `fake_${i}`,
        isReal: false,
        name: `${firstNames[seedName]} ${lastNames[seedLast]}`,
        avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
        balance: seedPoints,
      });
    }
    
    // Deduplicate if real user is already in the list
    const uniqueUsers = Array.from(new Map(users.map(item => [item.id, item])).values());
    
    return uniqueUsers.sort((a, b) => b.balance - a.balance);
  }, [realUsers]);

  const topThree = leaderboardData.slice(0, 3);
  const restUsers = leaderboardData.slice(3, 100); // show top 100

  return (
    <div className="space-y-6 pb-20 md:pb-6 relative z-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Leaderboard</h1>
          <p className="text-sm font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full inline-block">Weekly Ranking</p>
        </div>
      </div>

      <div className="flex items-end justify-center gap-2 md:gap-4 mt-8 mb-12">
        {topThree[1] && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
            <div className="relative">
              <div className={`w-16 h-16 rounded-full overflow-hidden border-4 ${topThree[1].id === appUser?.uid ? 'border-[#00d2ff]' : 'border-slate-300'} z-10 relative`}>
                <img src={topThree[1].avatar} alt={topThree[1].name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-300 rounded-full border-2 border-[#000000] flex items-center justify-center text-xs font-bold text-slate-800 z-20">
                2
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className={`font-bold text-sm max-w-[80px] truncate ${topThree[1].id === appUser?.uid ? 'text-[#00d2ff]' : 'text-white'}`}>{topThree[1].name.split(' ')[0]}</p>
              <p className="text-amber-400 text-xs font-bold mt-1">{topThree[1].balance.toLocaleString()} ₹</p>
            </div>
          </motion.div>
        )}

        {topThree[0] && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center">
            <div className="relative mb-2">
              <Trophy className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] z-20" />
              <div className={`w-20 h-20 rounded-full overflow-hidden border-4 ${topThree[0].id === appUser?.uid ? 'border-[#00d2ff]' : 'border-amber-400'} z-10 relative shadow-[0_0_20px_rgba(251,191,36,0.3)]`}>
                <img src={topThree[0].avatar} alt={topThree[0].name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-400 rounded-full border-2 border-[#000000] flex items-center justify-center text-xs font-bold text-amber-900 z-20">
                1
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className={`font-bold text-base max-w-[100px] truncate ${topThree[0].id === appUser?.uid ? 'text-[#00d2ff]' : 'text-white'}`}>{topThree[0].name.split(' ')[0]}</p>
              <p className="text-amber-400 text-sm font-bold mt-1">{topThree[0].balance.toLocaleString()} ⭐</p>
            </div>
          </motion.div>
        )}

        {topThree[2] && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col items-center">
            <div className="relative">
              <div className={`w-16 h-16 rounded-full overflow-hidden border-4 ${topThree[2].id === appUser?.uid ? 'border-[#00d2ff]' : 'border-amber-700'} z-10 relative`}>
                <img src={topThree[2].avatar} alt={topThree[2].name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-700 rounded-full border-2 border-[#000000] flex items-center justify-center text-xs font-bold text-white z-20">
                3
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className={`font-bold text-sm max-w-[80px] truncate ${topThree[2].id === appUser?.uid ? 'text-[#00d2ff]' : 'text-white'}`}>{topThree[2].name.split(' ')[0]}</p>
              <p className="text-amber-400 text-xs font-bold mt-1">{topThree[2].balance.toLocaleString()} ⭐</p>
            </div>
          </motion.div>
        )}
      </div>

      <Card className="bg-[#111111] border-[#222222]">
        <CardContent className="p-0 divide-y divide-[#222222]">
          {restUsers.map((user, idx) => (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (idx % 10) * 0.05 }}
              className={`flex items-center gap-4 p-4 transition-colors ${user.id === appUser?.uid ? 'bg-[#00d2ff]/10 border-l-2 border-[#00d2ff]' : 'hover:bg-[#1a1a1a]'}`}
            >
              <span className={`w-8 text-center font-bold ${user.id === appUser?.uid ? 'text-[#00d2ff]' : 'text-zinc-500'}`}>
                {idx + 4}
              </span>
              <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border ${user.id === appUser?.uid ? 'border-[#00d2ff]' : 'border-[#333333]'}`}>
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <h3 className={`font-bold truncate text-sm ${user.id === appUser?.uid ? 'text-[#00d2ff]' : 'text-white'}`}>{user.name}</h3>
                {user.id === appUser?.uid && (
                  <span className="text-[10px] bg-[#00d2ff] text-black px-2 py-0.5 rounded-full font-bold">YOU</span>
                )}
              </div>
              <div className="font-bold text-amber-400 flex items-center gap-1 shrink-0 text-sm">
                {user.balance.toLocaleString()} ⭐
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
