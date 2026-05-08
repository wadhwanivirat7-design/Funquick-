/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link, useLocation } from 'react-router-dom';
import { Home, User, Video, MessageSquare, PhoneCall, PlusSquare, LogOut, Gamepad2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

export default function Navigation({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Feed' },
    { path: '/arcade', icon: Gamepad2, label: 'Arcade' },
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/call', icon: PhoneCall, label: 'Call' },
    { path: '/studio', icon: PlusSquare, label: 'Post' },
    { path: '/profile', icon: User, label: 'Me' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 w-full flex items-center justify-between border-t-4 border-primary bg-black px-4 md:px-12 z-50 text-white shadow-[0_-10px_30px_-10px_rgba(37,99,235,0.3)]">
      <Link to="/" className="flex items-center gap-3 group relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-none bg-primary text-black font-black italic text-2xl transform transition-all group-hover:skew-x-12 group-hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">FQ</div>
        <span className="text-3xl font-black tracking-tighter uppercase hidden lg:inline-block italic text-primary">funquick</span>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white animate-ping hidden lg:block"></div>
      </Link>

      <div className="flex items-center gap-1 md:gap-4 bg-zinc-900/50 p-1 border-2 border-zinc-800 backdrop-blur-md">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Button
              variant="ghost"
              className={cn(
                "flex flex-col h-14 w-12 md:w-20 rounded-none gap-0.5 transition-all relative overflow-hidden group",
                location.pathname === item.path ? "text-primary" : "text-zinc-500 hover:text-white"
              )}
            >
              <item.icon className={cn("h-6 w-6 z-10", location.pathname === item.path && "animate-pulse")} />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter z-10">{item.label}</span>
              {location.pathname === item.path && (
                <motion.div 
                  layoutId="nav-active"
                  className="absolute inset-0 bg-primary/10 border-b-2 border-primary"
                />
              )}
            </Button>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onLogout}
          className="rounded-none border-2 border-zinc-800 bg-transparent text-zinc-500 hover:border-red-500 hover:text-red-500 transition-all h-12 w-12"
        >
          <LogOut className="h-6 w-6" />
        </Button>
      </div>
    </nav>
  );
}
