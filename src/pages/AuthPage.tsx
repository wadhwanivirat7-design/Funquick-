/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { api } from '@/src/lib/api';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { toast } from 'sonner';
import { Play } from 'lucide-react';
import { motion } from 'motion/react';

export default function AuthPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      const user = {
        uid: 'user_' + Math.random().toString(36).substr(2, 9),
        displayName: name,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@pulse.local`,
      };

      await api.syncUser(user);
      onLogin(user);
      toast.success(`Welcome to VibePulse, ${name}!`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans selection:bg-primary selection:text-black italic">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="w-full max-w-md"
      >
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-[4rem] blur-3xl group-hover:bg-primary/30 transition-all duration-1000"></div>
          
          <Card className="relative overflow-hidden border-4 border-zinc-900 bg-card rounded-[4rem] shadow-[20px_20px_60px_rgba(0,0,0,0.5)] p-10 space-y-10">
            <header className="text-center space-y-6">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary text-black shadow-[0_0_50px_rgba(55,99,235,0.4)] transition-transform hover:scale-110 hover:rotate-12 duration-500">
                <Play className="h-12 w-12 fill-current" />
              </div>
              <div className="space-y-4">
                <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase italic leading-none text-white underline decoration-primary decoration-4 underline-offset-8">funquick</h1>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Global Sync Network Access</p>
              </div>
            </header>

            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 block text-center">Citizen Identification</Label>
                <Input 
                  id="name" 
                  placeholder="Enter User Tag..." 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="h-16 text-2xl font-black rounded-full bg-zinc-900 border-4 border-zinc-800 text-white italic uppercase px-10 focus-visible:border-primary transition-all text-center placeholder:text-zinc-700"
                  autoFocus
                />
              </div>
              
              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-20 text-3xl font-black italic uppercase rounded-full bg-primary text-black hover:bg-white transition-all shadow-[8px_8px_0px_0px_rgba(55,99,235,0.2)] active:scale-95"
              >
                {loading ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
                ) : (
                  "JOIN.SYNC"
                )}
              </Button>
            </form>

            <footer className="pt-8 border-t-2 border-zinc-900">
              <div className="text-[9px] text-zinc-600 uppercase text-center font-mono tracking-widest leading-relaxed">
                Notice: Unauthorized vibe injection is strictly prohibited. Sync metrics are logged for security.
              </div>
            </footer>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
