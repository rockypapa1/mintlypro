import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Home, CheckSquare, MessageCircle, Wallet, User, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function AppLayout() {
  const { appUser } = useAuth();
  
  const NAV_ITEMS = [
    { name: "Home", path: "/", icon: Home },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
    { name: "WhatsApp", path: "/whatsapp", icon: MessageCircle },
    { name: "SMS", path: "/sms", icon: MessageSquare },
    { name: "Wallet", path: "/wallet", icon: Wallet },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <div className="flex h-screen w-full bg-[#000000] text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0a0a0a] border-r border-[#222222] flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-wider text-white">
              GLOBALREWARD PRO
            </span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#111111] text-[#00d2ff]"
                    : "text-zinc-500 hover:text-white hover:bg-[#111111]"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#222222] z-10 sticky top-0">
          <div className="text-sm font-medium text-zinc-400">Welcome back!</div>
          <div className="flex items-center gap-4">
            <div className="bg-[#111111] px-4 py-1.5 rounded-full flex items-center gap-2">
              <span className="text-amber-500 text-lg">₹</span>
              <span className="font-bold text-white">₹{appUser?.balance?.toLocaleString() || 0}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-white font-semibold overflow-hidden">
              <img src={appUser?.avatar} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto w-full pb-20 md:pb-0">
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#222222] pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  isActive ? "text-[#00ec77]" : "text-[#888888] hover:text-white"
                )
              }
            >
              <item.icon className={cn("w-6 h-6", "transition-transform duration-200")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
