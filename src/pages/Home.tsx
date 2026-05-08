/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { api, getAuthUser } from '@/src/lib/api';
import { Video as VideoType } from '@/src/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { Button } from '@/src/components/ui/button';
import { Heart, MessageCircle, Share2, MoreVertical, Video as VideoIcon, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function Home() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getAuthUser();

  useEffect(() => {
    async function fetchVideos() {
      try {
        const data = await api.getVideos();
        setVideos(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  const handleLike = async (video: VideoType) => {
    if (!user) return;
    try {
      const { likes } = await api.likeVideo(video.id, user.uid);
      setVideos(prev => prev.map(v => v.id === video.id ? { ...v, likes } : v));
    } catch (error) {
      toast.error("Vibe check failed");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="h-20 w-20 bg-secondary animate-bounce flex items-center justify-center border-4 border-primary shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]">
             <Zap className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <p className="font-black italic uppercase tracking-tighter text-2xl animate-pulse text-primary">Syncing Vibes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar / Stats */}
        <aside className="lg:col-span-3 space-y-8 hidden lg:block">
           <div className="border-4 border-primary p-6 space-y-4 bg-card rounded-[2rem]">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none text-primary">The Feed</h2>
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-primary text-black p-3 rounded-xl">
                    <TrendingUp className="h-3 w-3" /> Trending Now
                 </div>
                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-2 border-primary p-3 text-primary rounded-xl">
                    <Sparkles className="h-3 w-3" /> Fresh Beats
                 </div>
              </div>
           </div>

           <div className="aspect-square bg-primary p-6 border-4 border-black flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rounded-[2.5rem]">
              <Zap className="h-12 w-12 text-black" />
              <div className="space-y-1">
                 <h3 className="text-4xl font-black uppercase italic leading-none">Boost Your Pulse</h3>
                 <p className="text-[10px] font-bold uppercase tracking-widest leading-tight">Post daily to stay in the sync zone.</p>
              </div>
           </div>
        </aside>

        {/* Main Feed */}
        <main className="lg:col-span-6 space-y-12">
          <AnimatePresence>
            {videos.length === 0 ? (
              <div className="border-4 border-zinc-800 rounded-[3rem] p-12 flex flex-col items-center gap-8 text-center italic bg-card/50">
                <div className="bg-primary text-black p-8 group transition-transform hover:rotate-6 rounded-3xl">
                  <VideoIcon className="h-24 w-24 group-hover:animate-ping" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-6xl font-black uppercase leading-none tracking-tighter text-white">Zero Pulse</h3>
                  <p className="font-bold text-zinc-500 uppercase tracking-widest text-xs">The network is hungry for your vibe.</p>
                </div>
                <Button className="h-20 w-full bg-primary text-black rounded-full font-black italic text-4xl uppercase shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all" onClick={() => window.location.href = '/studio'}>
                    POST.NOW
                </Button>
              </div>
            ) : (
              videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                >
                  <VideoPost video={video} onLike={() => handleLike(video)} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </main>

        {/* Right Sidebar / Citizens */}
        <aside className="lg:col-span-3 space-y-8 hidden lg:block">
           <div className="border-4 border-black p-6 space-y-6">
              <h3 className="text-xl font-black italic uppercase tracking-tighter border-b-2 border-black pb-2">Top Citizens</h3>
              <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                       <div className="h-10 w-10 bg-black border-2 border-black"></div>
                       <div className="flex-1">
                          <p className="text-xs font-black uppercase">Citizen_{i+102}</p>
                          <div className="h-1 w-full bg-zinc-200"><div className="h-full bg-primary w-2/3"></div></div>
                       </div>
                    </div>
                  ))}
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}

function VideoPost({ video, onLike }: { video: VideoType, onLike: () => void }) {
  const user = getAuthUser();
  const isLiked = video.likes?.includes(user?.uid || '');

  return (
    <div className="border-4 border-zinc-900 bg-card rounded-[3rem] shadow-[12px_12px_60px_0px_rgba(0,0,0,0.5)] overflow-hidden transition-all group">
      
      {/* Header */}
      <div className="p-6 border-b-4 border-zinc-900 flex items-center justify-between bg-zinc-900/50 group-hover:bg-zinc-900 transition-colors">
        <div className="flex items-center gap-4">
          <div className="border-4 border-primary p-0.5 rounded-full overflow-hidden shadow-[4px_4px_20px_0px_rgba(55,99,235,0.3)]">
             <Avatar className="h-12 w-12 rounded-full">
               <AvatarImage src={video.creatorPhoto} className="object-cover" />
               <AvatarFallback className="bg-primary text-black font-black">{video.creatorName?.[0]}</AvatarFallback>
             </Avatar>
          </div>
          <div>
            <p className="font-black text-xl italic uppercase tracking-tighter leading-none text-white">{video.creatorName}</p>
            <p className="text-[10px] font-mono font-bold text-primary mt-1 uppercase tracking-widest">
              ID_{video.id.substr(0,8)} // {video.createdAt ? new Date(video.createdAt as any).toLocaleDateString() : 'SYNCED'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary hover:text-black transition-colors text-zinc-500">
          <MoreVertical className="h-6 w-6" />
        </Button>
      </div>

      {/* Media Content */}
      <div className="relative aspect-video bg-black overflow-hidden border-b-4 border-zinc-900">
        <video 
          src={video.videoUrl} 
          className="w-full h-full object-contain" 
          controls 
          poster={video.thumbnailUrl}
          playsInline
        />
        <div className="absolute top-4 right-4 bg-primary text-black font-black px-4 py-1.5 italic uppercase text-[10px] shadow-[4px_4px_10px_0px_rgba(0,0,0,0.3)] border-2 border-black rounded-full">
            funquick.Live
        </div>
      </div>

      {/* Info & Actions */}
      <div className="p-10 space-y-8">
        <div>
          <h3 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-4 text-white">{video.title}</h3>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-tight leading-relaxed">
            {video.description}
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 pt-6 border-t-2 border-zinc-800">
          <div className="flex gap-4">
             <Button 
                onClick={onLike}
                className={cn(
                  "h-16 flex-1 md:flex-none px-10 rounded-full border-4 border-primary font-black italic gap-3 transition-transform active:scale-95",
                  isLiked ? "bg-red-500 text-white border-red-500 shadow-[4px_4px_20px_0px_rgba(239,68,68,0.3)]" : "bg-transparent text-primary shadow-[4px_4px_0px_0px_rgba(37,99,235,0.2)] hover:bg-primary hover:text-black"
                )}
              >
                <Heart className={cn("h-6 w-6", isLiked && "fill-current")} />
                {video.likes?.length || 0} PULSE
              </Button>
              <Button className="h-16 flex-1 md:flex-none px-10 rounded-full border-4 border-zinc-800 bg-zinc-900 text-white font-black italic gap-3 hover:bg-zinc-800">
                <MessageCircle className="h-6 w-6" />
                COMMS
              </Button>
          </div>
          <div className="flex-1 flex justify-end">
            <Button variant="ghost" className="h-16 px-8 rounded-full font-black italic uppercase text-xs hover:bg-primary hover:text-black text-zinc-500 transition-colors">
              <Share2 className="mr-2 h-5 w-5" /> EXPORT VIBE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
