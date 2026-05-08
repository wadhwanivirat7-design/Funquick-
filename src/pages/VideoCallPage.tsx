/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { socket, getAuthUser } from '@/src/lib/api';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, User, Copy, Hash, Users as UsersIcon, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import Peer from 'simple-peer';
import { motion, AnimatePresence } from 'motion/react';

interface PeerConnection {
  peerId: string;
  peer: Peer.Instance;
  stream?: MediaStream;
  audioOnly?: boolean;
}

export default function VideoCallPage() {
  const [roomName, setRoomName] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [peers, setPeers] = useState<PeerConnection[]>([]);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<PeerConnection[]>([]);
  const user = getAuthUser();

  useEffect(() => {
    return () => {
      stopLocalStream();
      peersRef.current.forEach(p => p.peer.destroy());
    };
  }, []);

  const stopLocalStream = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  };

  const startLocalStream = async (audioOnly = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: !audioOnly, 
        audio: true 
      });
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      toast.error("Access denied");
      return null;
    }
  };

  const joinRoom = async (audioOnly = false) => {
    if (!roomName.trim()) return toast.error("Enter room name");
    setIsAudioOnly(audioOnly);
    
    const stream = await startLocalStream(audioOnly);
    if (!stream) return;

    setInRoom(true);
    socket.emit("join-room", roomName);

    socket.on("all-users", (users: string[]) => {
      const newPeers: PeerConnection[] = [];
      users.forEach(userID => {
        const peer = createPeer(userID, socket.id!, stream, audioOnly);
        peersRef.current.push({ peerId: userID, peer });
        newPeers.push({ peerId: userID, peer });
      });
      setPeers(newPeers);
    });

    socket.on("user-joined", (payload: any) => {
      const peer = addPeer(payload.signal, payload.callerId, stream);
      const newPeerRecord = { peerId: payload.callerId, peer, audioOnly: payload.audioOnly };
      peersRef.current.push(newPeerRecord);
      setPeers(prev => [...prev, newPeerRecord]);
    });

    socket.on("receiving-returned-signal", (payload: any) => {
      const item = peersRef.current.find(p => p.peerId === payload.id);
      item?.peer.signal(payload.signal);
    });
  };

  function createPeer(userToSignal: string, callerId: string, stream: MediaStream, audioOnly: boolean) {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on("signal", signal => {
      socket.emit("sending-signal", { userToSignal, callerId, signal, audioOnly });
    });
    peer.on("stream", stream => {
      setPeers(prev => prev.map(p => p.peerId === userToSignal ? { ...p, stream } : p));
    });
    return peer;
  }

  function addPeer(incomingSignal: any, callerId: string, stream: MediaStream) {
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on("signal", signal => {
      socket.emit("returning-signal", { signal, callerId });
    });
    peer.on("stream", stream => {
      setPeers(prev => prev.map(p => p.peerId === callerId ? { ...p, stream } : p));
    });
    peer.signal(incomingSignal);
    return peer;
  }

  const leaveRoom = () => {
    socket.emit("leave-room", roomName);
    peersRef.current.forEach(p => p.peer.destroy());
    peersRef.current = [];
    setPeers([]);
    setInRoom(false);
    stopLocalStream();
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-background text-foreground overflow-hidden font-sans italic selection:bg-primary selection:text-black">
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center space-y-12">
        
        <div className="relative">
          <div className="h-48 w-48 bg-zinc-900 border-8 border-primary rounded-full flex items-center justify-center animate-pulse">
            <PhoneOff className="h-24 w-24 text-primary" />
          </div>
          <div className="absolute -top-4 -right-4 bg-red-600 text-white font-black px-4 py-2 text-xl uppercase italic shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            OFFLINE
          </div>
        </div>

        <div className="space-y-6 max-w-2xl">
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">
            Global<span className="text-primary">.Sync</span>
          </h1>
          <div className="space-y-4">
            <p className="text-zinc-500 font-mono text-lg tracking-widest uppercase font-bold">Communications Network Severed</p>
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-[loading_2s_ease-in-out_infinite]" style={{ width: '30%' }}></div>
            </div>
            <p className="text-zinc-600 font-mono text-xs uppercase tracking-tight">
              Notice: The funquick global call network is currently under maintenance. 
              Our team of digital architects is recalibrating the sync frequencies. 
              Real-time video communications are temporarily suspended to optimize the vibe flow.
            </p>
          </div>
        </div>

        <Button 
          onClick={() => window.location.href = '/'}
          className="h-20 px-12 rounded-full border-4 border-primary bg-primary text-black font-black italic text-2xl uppercase hover:bg-white transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]"
        >
          Return to Feed
        </Button>

        <div className="flex gap-8 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em]">
           <span>Status: Re-routing Hubs</span>
           <span>ETA: Unknown</span>
           <span>Code: X-SYNC-77</span>
        </div>
      </div>
    </div>
  );
}

interface RemoteVideoProps {
  peer: PeerConnection;
}

const RemoteVideo: React.FC<RemoteVideoProps> = ({ peer }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  return (
    <div className="bg-zinc-100 border-4 border-black relative overflow-hidden group shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
      {peer.audioOnly ? (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
           <div className="h-24 w-24 border-4 border-black flex items-center justify-center p-6">
             <User className="w-full h-full text-zinc-300" />
           </div>
           <span className="font-black uppercase italic tracking-tighter text-xl text-zinc-400">Remote Syncing</span>
           <video ref={videoRef} autoPlay className="hidden" />
        </div>
      ) : (
        <video ref={videoRef} autoPlay className="w-full h-full object-cover border-none" />
      )}
      <div className="absolute bottom-4 left-4 bg-white border-2 border-black text-black px-3 py-1 font-black text-[10px] uppercase italic tracking-widest">
         Peer Connected
      </div>
    </div>
  );
}
