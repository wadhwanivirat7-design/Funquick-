/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuthUser, setAuthUser } from '@/src/lib/api';
import { Toaster } from '@/src/components/ui/sonner';

// Pages
import Home from '@/src/pages/Home';
import Profile from '@/src/pages/Profile';
import Studio from '@/src/pages/Studio';
import ChatPage from '@/src/pages/ChatPage';
import VideoCallPage from '@/src/pages/VideoCallPage';
import Arcade from '@/src/pages/Arcade';
import AuthPage from '@/src/pages/AuthPage';
import Navigation from '@/src/components/Navigation';

export default function App() {
  const [user, setUser] = useState<any>(getAuthUser());
  const [loading, setLoading] = useState(false);

  const handleLogin = (newUser: any) => {
    setAuthUser(newUser);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("vibe_user");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <Routes>
            <Route path="/" element={user ? <Home /> : <Navigate to="/auth" />} />
            <Route path="/auth" element={!user ? <AuthPage onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
            <Route path="/studio" element={user ? <Studio /> : <Navigate to="/auth" />} />
            <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/auth" />} />
            <Route path="/arcade" element={user ? <Arcade /> : <Navigate to="/auth" />} />
            <Route path="/call" element={user ? <VideoCallPage /> : <Navigate to="/auth" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        {user && <Navigation onLogout={handleLogout} />}
        <Toaster />
      </div>
    </Router>
  );
}
