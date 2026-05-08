/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { api, getAuthUser } from '@/src/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { UploadCloud, FileVideo, CheckCircle2, AlertCircle, Zap, Cross, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Studio() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const user = getAuthUser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
      } else {
        toast.error("Vibe Error: Must be a video");
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !user) {
      toast.error("Specs missing for post");
      return;
    }

    setUploading(true);
    try {
      const sampleVideos = [
        "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      ];
      const videoUrl = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
      const thumbnailUrl = `https://picsum.photos/seed/${Math.random()}/800/450`;

      await api.uploadVideo({
        id: 'vid_' + Math.random().toString(36).substr(2, 9),
        title,
        description,
        videoUrl,
        thumbnailUrl,
        creatorId: user.uid,
        creatorName: user.displayName,
        creatorPhoto: user.photoURL,
      });

      toast.success("Vibe published to network");
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error("Network sync failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-12 pb-24">
        
        <header className="space-y-2">
            <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] text-primary">
              funquick<span className="text-white">.Drop</span>
            </h1>
            <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase italic font-bold">Inject your vibe into the global sync</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <div className="border-4 border-zinc-900 p-2 bg-zinc-900 rounded-[3rem] shadow-[20px_20px_60px_rgba(0,0,0,0.3)]">
              <label htmlFor="video-upload" className="block relative cursor-pointer group">
                  <div className={cn(
                    "bg-black h-[400px] flex flex-col items-center justify-center text-center p-8 border-4 border-dashed border-zinc-800 rounded-[2.5rem] transition-all overflow-hidden",
                    file ? "bg-primary/10 border-primary" : "hover:bg-zinc-800/50 hover:border-primary"
                  )}>
                    {file ? (
                      <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="mx-auto h-32 w-32 bg-primary text-black rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(55,99,235,0.4)]">
                          <FileVideo className="h-16 w-16" />
                        </div>
                        <div className="space-y-2">
                          <p className="font-black text-3xl uppercase italic tracking-tighter text-white">{file.name}</p>
                          <p className="font-mono text-[10px] uppercase font-bold text-primary italic bg-primary/10 px-4 py-1 rounded-full w-fit mx-auto">{(file.size / (1024 * 1024)).toFixed(2)} MB // STATUS: LOCAL_READY</p>
                        </div>
                        <Button 
                           variant="outline" 
                           className="rounded-full border-4 border-zinc-800 bg-background text-zinc-400 font-black uppercase text-xs hover:border-red-500 hover:text-red-500 px-8 transition-colors h-12"
                           onClick={(e) => { e.preventDefault(); setFile(null); }}
                        >
                          Eject File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-8 flex flex-col items-center">
                        <div className="h-24 w-24 bg-primary text-black rounded-[2rem] flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-[4px_4px_20px_rgba(55,99,235,0.3)]">
                          <UploadCloud className="h-12 w-12" />
                        </div>
                        <div className="space-y-3">
                          <p className="font-black text-6xl uppercase italic tracking-tighter leading-none text-white">Select.Me</p>
                          <p className="font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Drag vibes here or click to browse</p>
                        </div>
                        <div className="h-2 w-48 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-primary w-0 group-hover:w-full transition-all duration-700"></div></div>
                      </div>
                    )}
                  </div>
                  <Input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            <div className="border-4 border-zinc-900 p-10 bg-card rounded-[3rem] space-y-10 shadow-2xl">
              <h3 className="text-4xl font-black uppercase italic border-b-4 border-primary pb-2 inline-block text-white">Data Specs</h3>
              <div className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Post Title</Label>
                  <Input 
                    id="title" 
                    className="h-16 rounded-full border-4 border-zinc-800 bg-zinc-900 text-xl font-bold uppercase italic focus-visible:border-primary focus-visible:bg-zinc-800 text-white transition-all px-8 placeholder:text-zinc-600"
                    placeholder="Enter Vibe Title..." 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Internal Sync Description</Label>
                  <textarea
                    id="description"
                    className="w-full min-h-[160px] rounded-[2rem] border-4 border-zinc-800 bg-zinc-900 p-8 font-bold text-sm outline-none focus:border-primary focus:bg-zinc-800 text-white transition-all placeholder:text-zinc-600"
                    placeholder="Briefly describe the pulse being shared..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="border-4 border-zinc-900 p-10 bg-primary text-black space-y-10 rounded-[3rem] shadow-[20px_20px_60px_rgba(55,99,235,0.2)]">
               <h3 className="text-4xl font-black uppercase italic tracking-tighter text-black">Pulse Check</h3>
               <div className="space-y-5">
                  <div className="flex items-center gap-4 font-black uppercase italic text-sm">
                    <div className="h-7 w-7 bg-black text-primary rounded-full flex items-center justify-center"><CheckCircle2 className="h-4 w-4" /></div>
                    Video Meta Valid
                  </div>
                  <div className="flex items-center gap-4 font-black uppercase italic text-sm">
                    <div className="h-7 w-7 bg-black text-primary rounded-full flex items-center justify-center"><CheckCircle2 className="h-4 w-4" /></div>
                    Encoding Optimal
                  </div>
                  <div className="flex items-center gap-4 font-black uppercase italic text-sm">
                    <div className="h-7 w-7 bg-red-600 text-white rounded-full flex items-center justify-center"><AlertCircle className="h-4 w-4" /></div>
                    Verification Skip
                  </div>
               </div>

               <Button 
                  className="w-full h-24 rounded-full bg-black text-primary hover:bg-white hover:text-black font-black italic text-3xl uppercase transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95"
                  disabled={uploading || !file || !title}
                  onClick={handleUpload}
               >
                  {uploading ? "INJECTING..." : (
                    <>
                      PUSH.VIBE
                      <div className="bg-primary text-black rounded-full p-2 h-10 w-10 flex items-center justify-center group-hover:bg-black group-hover:text-primary transition-colors">
                        <Plus className="h-6 w-6 stroke-[3]" />
                      </div>
                    </>
                  )}
               </Button>
            </div>

            <div className="bg-zinc-900 p-8 rounded-[2rem] border-2 border-zinc-800 font-mono text-[10px] uppercase text-zinc-500 leading-tight italic">
               Safety Notice: By publishing a Pulse, you confirm that your content doesn't violate the sync standards or community safety protocols. Sync responsibly.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
