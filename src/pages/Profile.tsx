/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { api, getAuthUser } from '@/src/lib/api';
import { UserProfile, Video as VideoType } from '@/src/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { Button } from '@/src/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Settings, Grid, Heart, Play, Zap, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const [profile, setProfile] = useState<any>(getAuthUser());
  const [userVideos, setUserVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserContent() {
      if (!profile) return;
      try {
        const videos = await api.getVideos();
        setUserVideos(videos.filter((v: VideoType) => v.creatorId === profile.uid));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserContent();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 bg-primary animate-spin"></div>
        <p className="font-black uppercase tracking-tighter italic text-primary">Citizen Scan...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12 pb-24">
        
        {/* Profile Header */}
        <div className="flex flex-col lg:flex-row items-center lg:items-end gap-12 border-4 border-zinc-900 p-12 bg-card rounded-[4rem] shadow-[20px_20px_60px_rgba(0,0,0,0.4)]">
           <div className="relative">
              <div className="border-4 border-primary p-2 bg-primary rounded-[3rem] shadow-[0_0_40px_rgba(55,99,235,0.3)]">
                <Avatar className="h-56 w-56 rounded-[2.5rem]">
                  <AvatarImage src={profile?.photoURL} className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                  <AvatarFallback className="text-6xl font-black bg-black text-white">{profile?.displayName?.[0]}</AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-4 -right-4 h-16 w-16 bg-primary border-4 border-black rounded-2xl flex items-center justify-center shadow-xl">
                 <Zap className="h-8 w-8 text-black" />
              </div>
           </div>

           <div className="flex-1 text-center lg:text-left space-y-8">
              <div className="space-y-3">
                 <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">{profile?.displayName}</h1>
                 <p className="font-mono text-xs uppercase tracking-[0.4em] font-bold text-primary italic bg-primary/10 w-fit px-4 py-1 rounded-full mx-auto lg:mx-0">Verified Citizen of funquick</p>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-12">
                 <div className="border-l-4 border-primary pl-6 py-1">
                    <span className="text-5xl font-black italic block text-white">{userVideos.length}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Pulses Shot</span>
                 </div>
                 <div className="border-l-4 border-primary pl-6 py-1">
                    <span className="text-5xl font-black italic block text-white">8.4K</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Global Rhythm</span>
                 </div>
                 <div className="border-l-4 border-primary pl-6 py-1">
                      <span className="text-5xl font-black italic block text-white">102</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Syncing With</span>
                 </div>
              </div>

              <div className="flex gap-4 justify-center lg:justify-start pt-4">
                 <Button className="rounded-full bg-primary text-black px-12 h-16 font-black uppercase italic tracking-tighter text-xl hover:bg-white transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] active:scale-95">
                    <Edit3 className="mr-3 h-6 w-6" /> Edit Vibe
                 </Button>
                 <Button variant="outline" className="rounded-full border-4 border-zinc-800 h-16 w-16 p-0 hover:border-primary hover:text-primary text-zinc-500 transition-all active:rotate-45">
                    <Settings className="h-7 w-7" />
                 </Button>
              </div>
           </div>

           <div className="lg:w-72 italic bg-zinc-900/50 p-8 rounded-[2.5rem] border-2 border-zinc-800 self-stretch flex items-center">
              <p className="text-sm font-bold uppercase tracking-tight leading-relaxed text-zinc-400">
                "{profile?.bio || 'Streamlining rhythms and capturing pulses for the global collective. Synced to the frequency of the future.'}"
              </p>
           </div>
        </div>

        {/* Content Section */}
        <Tabs defaultValue="grid" className="w-full space-y-8">
          <TabsList className="w-full flex h-20 bg-zinc-900/50 p-2 border-2 border-zinc-800 rounded-full gap-2 overflow-hidden backdrop-blur-md">
              <TabsTrigger value="grid" className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-black text-zinc-500 font-black uppercase italic text-xl transition-all h-full">
                <Grid className="mr-3 h-6 w-6" /> The Grid
              </TabsTrigger>
              <TabsTrigger value="syncs" className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-black text-zinc-500 font-black uppercase italic text-xl transition-all h-full">
                <Heart className="mr-3 h-6 w-6" /> Saved Syncs
              </TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="rounded-[4rem] bg-card border-4 border-zinc-900 p-12 shadow-2xl">
            {userVideos.length === 0 ? (
              <div className="text-center py-32 italic space-y-8">
                  <div className="h-24 w-24 bg-zinc-900/50 border-4 border-primary mx-auto flex items-center justify-center rounded-[2rem] shadow-neon">
                    <Zap className="h-12 w-12 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-5xl font-black uppercase italic tracking-tighter text-white">No Pulses Found</h3>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">The silent frequency of a new citizen.</p>
                  </div>
                  <Button 
                    className="h-14 px-10 rounded-full bg-primary text-black font-black uppercase text-sm italic hover:bg-white transition-all"
                    onClick={() => window.location.href='/studio'}
                  >
                    Sync First Pulse
                  </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {userVideos.map((video) => (
                  <motion.div 
                      key={video.id} 
                      whileHover={{ scale: 1.05, y: -10 }}
                      className="group cursor-pointer rounded-[2.5rem] border-4 border-zinc-800 bg-black overflow-hidden shadow-xl hover:border-primary transition-all duration-300"
                  >
                    <div className="aspect-[3/4] relative overflow-hidden">
                       <img src={video.thumbnailUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                       <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-black">
                         <Play className="h-16 w-16 fill-black" />
                         <span className="font-black uppercase italic tracking-tighter mt-4 text-xl">{video.likes?.length || 0} Rhythm</span>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="syncs" className="rounded-[4rem] bg-card border-4 border-zinc-900 py-32 text-center font-black uppercase italic text-3xl text-zinc-800 tracking-[0.5em] opacity-30">
             SYNC_PROTOCOL_OFFLINE
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
