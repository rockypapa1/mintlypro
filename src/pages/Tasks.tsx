import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, ShieldCheck, Flame, Star, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { collection, addDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const CATEGORIES = ["All"];

export default function Tasks() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const { appUser, updateUser } = useAuth();
  
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "tasks"), where("status", "==", "active"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasksList(fetchedTasks);
      setLoading(false);
    }, (err: any) => {
      console.error(err);
      if (err?.message?.includes("Missing or insufficient permissions")) {
        toast.error("Firebase Details: Admin needs to fix rules to allow users to see tasks.");
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const filteredTasks = tasksList.filter(t => {
    const matchesTab = activeTab === "All"; // can expand if you add categories to AdminTasks
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleEarn = async (task: any) => {
    if (!appUser) return;
    
    // In a real app this would go to the provider, but for the demo we'll directly simulate finishing it
    const loadToast = toast.loading(`Starting ${task.title}...`);
    
    // If it has a URL, we would normally open it.
    if (task.url) {
      window.open(task.url, "_blank");
    }
    
    if (task.approvalType === 'manual') {
      setTimeout(async () => {
        try {
          await addDoc(collection(db, "task_requests"), {
            userId: appUser.uid,
            userEmail: appUser.email,
            userName: appUser.name,
            taskId: task.id,
            taskTitle: task.title,
            rewardValue: task.rewardValue,
            status: "Pending",
            timestamp: Date.now()
          });
          toast.dismiss(loadToast);
          toast.success("Task submitted for admin approval!");
        } catch (err) {
          toast.dismiss(loadToast);
          toast.error("Failed to submit task");
        }
      }, 1500);
      return;
    }

    setTimeout(async () => {
      try {
        await updateUser({ balance: appUser.balance + task.rewardValue });
        await addDoc(collection(db, "transactions"), {
          userId: appUser.uid,
          title: task.title,
          type: "earn",
          amount: task.rewardValue,
          status: "completed",
          createdAt: new Date().toISOString()
        });
        toast.dismiss(loadToast);
        toast.success(`You earned ${task.reward} balance!`);
      } catch (err) {
        toast.dismiss(loadToast);
        toast.error("Failed to credit balance");
      }
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Earn Wall</h1>
          <p className="text-zinc-400 text-sm mt-1">Complete tasks to earn huge coin rewards.</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search offers..." 
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#222222] bg-[#111111] text-white focus:outline-none focus:ring-2 focus:ring-[#00d2ff] transition-all font-medium text-sm placeholder:text-zinc-500"
          />
        </div>
        <Button variant="outline" className="w-12 h-12 p-0 flex-shrink-0 bg-[#111111] border-[#222222] text-white">
          <Filter className="w-5 h-5" />
        </Button>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === cat 
              ? "bg-white text-black shadow-md shadow-white/10" 
              : "bg-[#111111] text-zinc-400 border border-[#222222] hover:bg-[#1a1a1a]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task, idx) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="hover:border-[#00d2ff] transition-all overflow-hidden group">
              <CardContent className="p-0">
                <div className="p-5 flex gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#0a0a0a] border border-[#222222] flex items-center justify-center text-3xl shadow-sm relative shrink-0 group-hover:scale-105 transition-transform">
                    {task.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#00d2ff] bg-[#00d2ff]/10 px-2 py-0.5 rounded-sm">
                        OfferWall
                      </span>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" title="Verified Provider" />
                    </div>
                    <h3 className="font-bold text-white truncate">{task.title}</h3>
                  </div>
                </div>
                <div className="bg-[#0a0a0a] px-5 py-3 border-t border-[#222222] flex items-center justify-between">
                  <div className="font-bold text-lg text-white flex items-center gap-1.5">
                    {task.reward} <span className="text-amber-500 text-base">₹</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleEarn(task)}
                    className="h-8 rounded-lg px-4 font-semibold hover:bg-white hover:text-black active:scale-95 transition-all"
                  >
                    Earn Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {filteredTasks.length === 0 && (
         <div className="text-center py-12">
            <p className="text-zinc-500">No tasks found for this category.</p>
         </div>
      )}
    </div>
  );
}
