import React, { useState } from "react";
import { User, Settings, Shield, HelpCircle, LogOut, ChevronRight, Bell, Smartphone, ArrowLeft, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/Card";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

import { Clock } from "lucide-react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Profile() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { appUser, updateUser } = useAuth();
  
  // Local state for editing fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [historyDocs, setHistoryDocs] = useState<any[]>([]);

  if (!appUser) return null;

  const handleOpenModal = async (modalName: string) => {
    setActiveModal(modalName);
    if (modalName === "Personal Information") {
      setName(appUser.name);
      setEmail(appUser.email);
      setPhone(appUser.phone);
    }
    if (modalName === "Task History") {
      try {
        const q = query(collection(db, "task_requests"), where("userId", "==", appUser.uid));
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => d.data());
        docs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setHistoryDocs(docs);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSave = async () => {
    if (activeModal === "Personal Information") {
      await updateUser({ name, email, phone });
    }
    toast.success("Settings saved successfully!");
    setActiveModal(null);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-6 relative">
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#000000] p-4 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6 pt-2">
              <button 
                onClick={() => setActiveModal(null)}
                className="w-10 h-10 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-xl font-bold tracking-tight text-white">{activeModal}</h1>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeModal === "Personal Information" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#111111] border border-[#222222] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00d2ff]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#111111] border border-[#222222] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00d2ff]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Phone Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#111111] border border-[#222222] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00d2ff]" />
                  </div>
                </div>
              )}

              {activeModal === "Task History" && (
                <div className="space-y-3">
                  {historyDocs.length === 0 ? (
                    <div className="text-center text-zinc-500 py-12">No tasks history found.</div>
                  ) : (
                    historyDocs.map((doc, idx) => (
                      <div key={idx} className="bg-[#111111] border border-[#222222] p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-sm">{doc.taskTitle}</p>
                          <p className="text-xs text-zinc-500 mt-1">{new Date(doc.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-500 text-sm mb-1">+₹{doc.rewardValue}</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            doc.status === 'Approved' ? 'bg-green-500/10 text-green-500' :
                            doc.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                            'bg-blue-500/10 text-blue-500'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeModal === "Linked Devices" && (
                <div className="space-y-3">
                  <Card className="bg-[#111111] border-[#222222]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-6 h-6 text-[#00d2ff]" />
                        <div>
                          <p className="font-bold text-white text-sm">Current Device</p>
                          <p className="text-xs text-zinc-500">Active now</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-[#00ec77]" />
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeModal === "Notifications" && (
                <div className="space-y-4">
                  {Object.entries(appUser.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-[#111111] border border-[#222222] p-4 rounded-xl">
                      <span className="font-medium text-white">{key}</span>
                      <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input 
                          type="checkbox" 
                          checked={value} 
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-[#00d2ff] transition-all" 
                          style={{ right: value ? '0' : '24px', borderColor: value ? '#00d2ff' : '#333' }} 
                          onChange={(e) => {
                            updateUser({ notifications: { ...appUser.notifications, [key]: e.target.checked } });
                          }} 
                        />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-[#333] cursor-pointer"></label>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeModal === "Security & Privacy" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-[#111111] border border-[#222222] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00d2ff]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">New Password</label>
                    <input type="password" placeholder="New Password" className="w-full bg-[#111111] border border-[#222222] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00d2ff]" />
                  </div>
                  <div className="flex items-center justify-between bg-[#111111] border border-[#222222] p-4 rounded-xl mt-6">
                    <div>
                      <h4 className="font-bold text-white text-sm">Two-Factor Authentication</h4>
                      <p className="text-xs text-zinc-500">Add an extra layer of security</p>
                    </div>
                    <button onClick={() => toast.success('2FA Setup email sent!')} className="text-[#00d2ff] bg-[#00d2ff]/10 px-3 py-1.5 rounded-full text-xs font-bold">Enable</button>
                  </div>
                </div>
              )}

              {activeModal === "Help Center & FAQ" && (
                <div className="space-y-3">
                  {[
                    "How do I withdraw my earnings?",
                    "When do balance get credited?",
                    "My WhatsApp pairing code expired.",
                    "How to increase my daily tasks limit?",
                    "I want to report an issue"
                  ].map((q, i) => (
                    <details key={i} className="group bg-[#111111] border border-[#222222] rounded-xl">
                      <summary className="font-medium text-white p-4 cursor-pointer list-none flex justify-between items-center">
                        {q}
                        <ChevronRight className="w-5 h-5 text-zinc-500 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="px-4 pb-4 text-sm text-zinc-400 border-t border-[#222222] pt-4 mt-2 mx-4">
                        We have a comprehensive guide for solving this issue. Generally, it takes about 24-48 hours for our team to process most requests. Please ensure you have completed the minimum required conditions.
                      </div>
                    </details>
                  ))}
                  <Button onClick={() => toast('Opening Live Chat...', { icon: '💬' })} className="w-full mt-4 bg-[#3a7bd5] hover:bg-[#2563eb] text-white">Contact Support</Button>
                </div>
              )}

              {activeModal === "General Settings" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Language</label>
                    <select 
                      value={appUser.language}
                      onChange={(e) => updateUser({ language: e.target.value })}
                      className="w-full bg-[#111111] border border-[#222222] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00d2ff] appearance-none"
                    >
                      <option>English (US)</option>
                      <option>Hindi (भारत)</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Currency Display</label>
                    <select 
                      value={appUser.currency}
                      onChange={(e) => updateUser({ currency: e.target.value })}
                      className="w-full bg-[#111111] border border-[#222222] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00d2ff] appearance-none"
                    >
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {activeModal !== "Task History" && activeModal !== "Linked Devices" && activeModal !== "Help Center & FAQ" && (
              <div className="pt-4">
                <Button onClick={handleSave} className="w-full h-14 bg-white hover:bg-zinc-200 text-black font-bold text-lg border-0">
                  Save Changes
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#222222] shadow-xl">
            <img src={appUser.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#3a7bd5] rounded-full border-2 border-[#111111] flex items-center justify-center text-white shadow-sm">
            <span className="text-xs">👑</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white">{appUser.name}</h1>
        <p className="text-zinc-400 font-medium text-sm">{appUser.email}</p>
        <div className="mt-4 flex gap-2">
          <span className="px-3 py-1 bg-amber-500/10 text-amber-500 font-bold text-xs rounded-full border border-amber-500/20 uppercase tracking-wide">Pro Earner</span>
          <span className="px-3 py-1 bg-[#00ec77]/10 text-[#00ec77] font-bold text-xs rounded-full border border-[#00ec77]/20 uppercase tracking-wide">Verified</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-zinc-500 text-xs uppercase tracking-wider pl-4">Account Settings</h3>
        <Card className="bg-[#111111] border-[#222222]">
          <CardContent className="p-0 divide-y divide-[#222222]">
            <MenuItem icon={<User className="w-5 h-5 text-blue-400" />} title="Personal Information" onClick={() => handleOpenModal("Personal Information")} />
            <MenuItem icon={<Clock className="w-5 h-5 text-amber-400" />} title="Task History" onClick={() => handleOpenModal("Task History")} />
            <MenuItem icon={<Smartphone className="w-5 h-5 text-indigo-400" />} title="Linked Devices" onClick={() => handleOpenModal("Linked Devices")} />
            <MenuItem icon={<Bell className="w-5 h-5 text-amber-400" />} title="Notifications" onClick={() => handleOpenModal("Notifications")} />
          </CardContent>
        </Card>

        <h3 className="font-bold text-zinc-500 text-xs uppercase tracking-wider pl-4 pt-4">Security & Help</h3>
        <Card className="bg-[#111111] border-[#222222]">
          <CardContent className="p-0 divide-y divide-[#222222]">
            <MenuItem icon={<Shield className="w-5 h-5 text-emerald-400" />} title="Security & Privacy" onClick={() => handleOpenModal("Security & Privacy")} />
            <MenuItem icon={<HelpCircle className="w-5 h-5 text-purple-400" />} title="Help Center & FAQ" onClick={() => handleOpenModal("Help Center & FAQ")} />
            <MenuItem icon={<Settings className="w-5 h-5 text-zinc-400" />} title="General Settings" onClick={() => handleOpenModal("General Settings")} />
          </CardContent>
        </Card>

        {appUser.email === "vanem4910@gmail.com" && (
          <button 
            onClick={() => window.location.href = "/admin"}
            className="w-full mt-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-amber-500/20 transition-colors active:scale-[0.98]"
          >
            <Shield className="w-5 h-5" />
            Admin Panel
          </button>
        )}

        <button 
          onClick={async () => {
            try {
              const { signOut } = await import("firebase/auth");
              const { auth } = await import("@/lib/firebase");
              await signOut(auth);
              toast.success('Logged out successfully');
            } catch (error) {
              toast.error('Failed to log out');
            }
          }}
          className="w-full mt-6 bg-rose-500/10 text-rose-500 border border-rose-500/20 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-rose-500/20 transition-colors active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
      
      <p className="text-center text-zinc-500 text-xs py-4 flex flex-col items-center">
        MINTLY PRO v1.0.4
        <span className="cursor-pointer hover:text-white mt-1 border-b border-transparent hover:border-white transition-colors" onClick={() => toast('Checking for updates...')}>Check for updates</span>
      </p>
    </div>
  );
}

function MenuItem({ icon, title, onClick }: { icon: React.ReactNode, title: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors cursor-pointer group active:bg-[#222]"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#0a0a0a] border border-[#222222] flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="font-medium text-white">{title}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
    </div>
  );
}
