/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { api, socket, getAuthUser } from '@/src/lib/api';
import { Message } from '@/src/types';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { Send, Hash, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = getAuthUser();

  useEffect(() => {
    // Initial fetch
    async function initChat() {
      try {
        const history = await api.getMessages();
        setMessages(history);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    initChat();
    socket.emit("join-chat");

    socket.on("new-message", (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off("new-message");
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
        const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const msgPayload = {
      text: inputText,
      senderId: user.uid,
      senderName: user.displayName,
      senderPhoto: user.photoURL,
    };

    socket.emit("send-message", msgPayload);
    setInputText('');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      <div className="hidden md:flex w-80 border-r flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Messages</h2>
          <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="py-4 space-y-1">
            {['Global Pulse', 'Pulse Hub', 'Vibe Circle'].map((chat, i) => (
              <Button key={chat} variant={i === 0 ? "secondary" : "ghost"} className="w-full justify-start gap-3 h-14 rounded-2xl">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {i === 0 ? <Hash className="h-5 w-5" /> : chat[0]}
                </div>
                <div className="text-left overflow-hidden">
                  <p className="font-bold truncate">{chat}</p>
                  <p className="text-[10px] text-muted-foreground truncate italic">Real-time vibes active</p>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="h-16 border-b flex items-center justify-between px-6 bg-card/30 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
              <Hash className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold">Global Pulse</h3>
              <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Live Connection</p>
            </div>
          </div>
        </div>

        <ScrollArea ref={scrollRef} className="flex-1 p-6">
          <div className="space-y-6 pb-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.senderId === user?.uid ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex gap-3 max-w-[85%] md:max-w-[70%]",
                    msg.senderId === user?.uid ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <Avatar className="h-8 w-8 mt-1 border">
                    <AvatarImage src={(msg as any).senderPhoto} />
                    <AvatarFallback>{msg.senderName[0]}</AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "space-y-1",
                    msg.senderId === user?.uid ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                        "rounded-3xl px-4 py-2.5 text-sm shadow-sm",
                        msg.senderId === user?.uid 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-muted rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                    <p className="text-[9px] text-muted-foreground px-2 uppercase font-bold">
                      {msg.senderName} • {msg.createdAt ? new Date(msg.createdAt as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>

        <div className="p-6 pt-0">
          <form onSubmit={handleSend} className="relative">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Post a vibe..."
              className="pr-14 h-14 rounded-2xl bg-muted/50 border-2 focus-visible:ring-primary shadow-inner"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-2 top-2 h-10 w-10 rounded-xl"
              disabled={!inputText.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
