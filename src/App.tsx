/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import WhatsApp from './pages/WhatsApp';
import SMS from './pages/SMS';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';

import AdminLayout from './layouts/AdminLayout';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTasks from './pages/admin/AdminTasks';
import AdminTaskApprovals from './pages/admin/AdminTaskApprovals';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminWhatsApp from './pages/admin/AdminWhatsApp';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { appUser } = useAuth();
  
  if (!appUser) {
    return <Login />;
  }

  if (appUser.isBlocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-red-500/20 p-8 rounded-2xl max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account Temp-Blocked</h2>
          <p className="text-zinc-400">Your account has been temporarily disabled. Please contact support.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '12px',
            }
          }} 
        />
        <AuthGuard>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminUsers />} />
              <Route path="tasks" element={<AdminTasks />} />
              <Route path="approvals" element={<AdminTaskApprovals />} />
              <Route path="withdrawals" element={<AdminWithdrawals />} />
              <Route path="whatsapp" element={<AdminWhatsApp />} />
            </Route>

            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="whatsapp" element={<WhatsApp />} />
              <Route path="sms" element={<SMS />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="profile" element={<Profile />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthGuard>
      </BrowserRouter>
    </AuthProvider>
  );
}
