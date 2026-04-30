import React from "react";
import { NavLink, Outlet, Navigate } from "react-router-dom";
import { Users, CheckSquare, Wallet, LogOut, ArrowLeft, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
  const { appUser } = useAuth();

  if (!appUser || appUser.email !== "vanem4910@gmail.com") {
    return <Navigate to="/" replace />;
  }

  const NAV_ITEMS = [
    { name: "Users", path: "/admin", icon: Users, exact: true },
    { name: "Tasks", path: "/admin/tasks", icon: CheckSquare },
    { name: "Approvals", path: "/admin/approvals", icon: CheckSquare },
    { name: "Withdrawals", path: "/admin/withdrawals", icon: Wallet },
    { name: "WhatsApp", path: "/admin/whatsapp", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-black text-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 border-r border-[#222] bg-[#0a0a0a] p-4">
        <div className="flex flex-col items-center gap-2 mb-8 mt-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[#333]">
            <img src={appUser.avatar} alt="admin" className="w-full h-full object-cover" />
          </div>
          <div className="text-center">
            <h2 className="font-bold text-sm text-white">Admin Panel</h2>
            <p className="text-xs text-zinc-500">{appUser.email}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors",
                  isActive ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white hover:bg-white/5"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
        
        <NavLink to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors text-zinc-400 hover:text-white hover:bg-white/5 mt-auto">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to App</span>
        </NavLink>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 bg-black pb-24 md:pb-0 h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-[#222]">
          <h1 className="font-bold text-lg">Admin Panel</h1>
          <NavLink to="/" className="text-sm font-semibold text-amber-500">Exit</NavLink>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-md border-t border-[#222] px-4 py-3 pb-safe z-50">
        <nav className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors",
                  isActive ? "text-amber-500" : "text-zinc-500"
                )
              }
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-bold">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
