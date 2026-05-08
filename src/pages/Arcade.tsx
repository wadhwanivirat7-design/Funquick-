/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getAuthUser } from '@/src/lib/api';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Gamepad2, Trophy, Users, User, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const socket = io();

export default function Arcade() {
  const [user] = useState(getAuthUser());
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'single'>('lobby');
  const [activeGame, setActiveGame] = useState<'pong' | 'snake'>('pong');
  const [roomId, setRoomId] = useState('');
  const [score, setScore] = useState({ p1: 0, p2: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  
  // Pong Refs
  const paddleRef = useRef({ y: 150 });
  const remotePaddleRef = useRef({ y: 150 });
  const ballRef = useRef({ x: 300, y: 200, dx: 4, dy: 4 });

  // Snake Refs
  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const foodRef = useRef({ x: 15, y: 15 });
  const directionRef = useRef({ x: 0, y: -1 });
  const nextDirectionRef = useRef({ x: 0, y: -1 });

  // Canvas dimensions
  const WIDTH = 600;
  const HEIGHT = 400;
  const GRID_SIZE = 20;

  useEffect(() => {
    if (gameState !== 'lobby') {
      const handleUpdate = (data: any) => {
        if (data.type === 'paddle') {
          remotePaddleRef.current.y = data.y;
        }
      };

      socket.on('game:update', handleUpdate);
      return () => { socket.off('game:update', handleUpdate); };
    }
  }, [gameState]);

  const startGame = (mode: 'playing' | 'single', game: 'pong' | 'snake') => {
    setGameState(mode);
    setActiveGame(game);
    if (game === 'pong') {
      setTimeout(() => startPong(), 100);
    } else {
      setTimeout(() => startSnake(), 100);
    }
  };

  const startPong = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;
    const PADDLE_HEIGHT = 80;
    const PADDLE_WIDTH = 10;

    const update = (time: number) => {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Draw middle line
      ctx.setLineDash([5, 15]);
      ctx.strokeStyle = '#222';
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, 0);
      ctx.lineTo(WIDTH / 2, HEIGHT);
      ctx.stroke();

      // Draw Paddles
      ctx.fillStyle = '#3763eb';
      ctx.fillRect(10, paddleRef.current.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.fillRect(WIDTH - 20, remotePaddleRef.current.y, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw Ball
      ctx.beginPath();
      ctx.arc(ballRef.current.x, ballRef.current.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // AI logic for single player
      const aiSpeed = 3.8;
      if (remotePaddleRef.current.y + PADDLE_HEIGHT / 2 < ballRef.current.y) {
        remotePaddleRef.current.y += aiSpeed;
      } else {
        remotePaddleRef.current.y -= aiSpeed;
      }

      // Ball Physics
      ballRef.current.x += ballRef.current.dx;
      ballRef.current.y += ballRef.current.dy;

      if (ballRef.current.y <= 0 || ballRef.current.y >= HEIGHT) ballRef.current.dy *= -1;

      if (ballRef.current.x <= 20 && ballRef.current.y >= paddleRef.current.y && ballRef.current.y <= paddleRef.current.y + PADDLE_HEIGHT) {
        ballRef.current.dx *= -1.05;
      }
      if (ballRef.current.x >= WIDTH - 20 && ballRef.current.y >= remotePaddleRef.current.y && ballRef.current.y <= remotePaddleRef.current.y + PADDLE_HEIGHT) {
        ballRef.current.dx *= -1.05;
      }

      if (ballRef.current.x < 0) {
        setScore(s => ({ ...s, p2: s.p2 + 1 }));
        resetPongBall();
      } else if (ballRef.current.x > WIDTH) {
        setScore(s => ({ ...s, p1: s.p1 + 1 }));
        resetPongBall();
      }

      gameLoopRef.current = requestAnimationFrame(update);
    };
    gameLoopRef.current = requestAnimationFrame(update);
  };

  const startSnake = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    resetSnakeFood();

    let frameCount = 0;
    const update = () => {
      frameCount++;
      if (frameCount % 8 !== 0) {
        gameLoopRef.current = requestAnimationFrame(update);
        return;
      }

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      directionRef.current = nextDirectionRef.current;
      const head = { ...snakeRef.current[0] };
      head.x += directionRef.current.x;
      head.y += directionRef.current.y;

      // Wrap around
      if (head.x < 0) head.x = WIDTH / GRID_SIZE - 1;
      if (head.x >= WIDTH / GRID_SIZE) head.x = 0;
      if (head.y < 0) head.y = HEIGHT / GRID_SIZE - 1;
      if (head.y >= HEIGHT / GRID_SIZE) head.y = 0;

      // Check collision with self
      if (snakeRef.current.some(s => s.x === head.x && s.y === head.y)) {
        toast.error("Game Over!");
        exitGame();
        return;
      }

      snakeRef.current.unshift(head);

      // Eat food
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore(s => ({ ...s, p1: s.p1 + 1 }));
        resetSnakeFood();
      } else {
        snakeRef.current.pop();
      }

      // Draw food
      ctx.fillStyle = '#3763eb';
      ctx.beginPath();
      ctx.roundRect(foodRef.current.x * GRID_SIZE + 2, foodRef.current.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4, 4);
      ctx.fill();

      // Draw snake
      snakeRef.current.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? '#fff' : '#444';
        ctx.beginPath();
        ctx.roundRect(p.x * GRID_SIZE + 1, p.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2, 6);
        ctx.fill();
      });

      gameLoopRef.current = requestAnimationFrame(update);
    };
    gameLoopRef.current = requestAnimationFrame(update);
  };

  const resetPongBall = () => {
    ballRef.current = { x: WIDTH / 2, y: HEIGHT / 2, dx: 4 * (Math.random() > 0.5 ? 1 : -1), dy: 4 * (Math.random() > 0.5 ? 1 : -1) };
  };

  const resetSnakeFood = () => {
    foodRef.current = {
      x: Math.floor(Math.random() * (WIDTH / GRID_SIZE)),
      y: Math.floor(Math.random() * (HEIGHT / GRID_SIZE))
    };
  };

  const handleInput = (e: React.KeyboardEvent | React.MouseEvent | React.TouchEvent) => {
    if (activeGame === 'snake') {
       // Keyboard handling is better in window listener usually, but for now we'll use a hack or just buttons
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeGame === 'snake') {
        const dir = directionRef.current;
        if (e.key === 'ArrowUp' && dir.y === 0) nextDirectionRef.current = { x: 0, y: -1 };
        if (e.key === 'ArrowDown' && dir.y === 0) nextDirectionRef.current = { x: 0, y: 1 };
        if (e.key === 'ArrowLeft' && dir.x === 0) nextDirectionRef.current = { x: -1, y: 0 };
        if (e.key === 'ArrowRight' && dir.x === 0) nextDirectionRef.current = { x: 1, y: 0 };
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGame]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (activeGame === 'pong') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      let y = 0;
      if ('touches' in e) {
        y = e.touches[0].clientY - rect.top;
      } else {
        y = e.clientY - rect.top;
      }
      paddleRef.current.y = Math.max(0, Math.min(HEIGHT - 80, y - 40));
    }
  };

  const exitGame = () => {
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    setGameState('lobby');
    setScore({ p1: 0, p2: 0 });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex flex-col font-sans selection:bg-primary selection:text-black">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-zinc-900">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary text-black font-black px-4 py-1.5 italic uppercase text-xs rounded-full">
              <Gamepad2 className="h-4 w-4" /> Gaming Collective
            </div>
            <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">
              funquick<span className="text-primary">.XT</span>
            </h1>
            <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">High Voltage Gaming Only // Restricted Area</p>
          </div>
          {gameState !== 'lobby' && (
             <Button 
                variant="outline" 
                className="rounded-full border-4 border-zinc-800 bg-background text-white hover:border-primary hover:text-primary h-16 px-10 font-black italic uppercase transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]" 
                onClick={exitGame}
             >
                <ArrowLeft className="mr-2 h-5 w-5" /> Abandon Session
             </Button>
          )}
        </header>

        <AnimatePresence mode="wait">
          {gameState === 'lobby' ? (
            <motion.div 
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Pong Card */}
              <div 
                className="bg-card border-4 border-zinc-800 rounded-[2rem] p-10 hover:border-primary transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-[450px]"
                onClick={() => startGame('single', 'pong')}
              >
                <div className="space-y-8 z-10">
                  <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center text-black shadow-[4px_4px_30px_rgba(55,99,235,0.4)] transition-transform group-hover:scale-110 group-hover:rotate-6">
                    <Gamepad2 className="w-16 h-16" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-6xl font-black uppercase italic leading-none text-white transition-colors group-hover:text-primary">Retro Pong</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-tight text-sm">Classic neon battle. Face the Host AI in a test of pure reaction.</p>
                  </div>
                </div>
                <div className="z-10">
                   <div className="inline-flex items-center gap-2 bg-zinc-900 text-zinc-400 px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest">
                      Difficulty: Elevated
                   </div>
                </div>
                {/* Decorative ball */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
              </div>

              {/* Snake Card */}
              <div 
                className="bg-card border-4 border-zinc-800 rounded-[2rem] p-10 hover:border-primary transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-[450px]"
                onClick={() => startGame('single', 'snake')}
              >
                <div className="space-y-8 z-10">
                  <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-black shadow-[4px_4px_30px_rgba(255,255,255,0.1)] transition-transform group-hover:scale-110 group-hover:rotate-[-6deg]">
                    <Trophy className="w-16 h-16" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-6xl font-black uppercase italic leading-none text-white transition-colors group-hover:text-primary">Neon Crawler</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-tight text-sm">Classic snake evolution. Eat data pulses to expand your logic stream.</p>
                  </div>
                </div>
                <div className="z-10">
                   <div className="inline-flex items-center gap-2 bg-zinc-900 text-zinc-400 px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest">
                      Mode: Endless Loop
                   </div>
                </div>
                {/* Decorative tail */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-zinc-100/5 rounded-full blur-3xl group-hover:bg-zinc-100/10 transition-all"></div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center space-y-12 pb-24"
            >
              <div className="flex items-center gap-16 text-8xl font-black italic">
                <div className="flex flex-col items-center">
                  <span className="text-primary">{score.p1}</span>
                  <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-500 mt-2">USER_LOCAL</span>
                </div>
                {activeGame === 'pong' && (
                  <>
                    <div className="h-24 w-2 bg-zinc-800 skew-x-[-20deg] rounded-full"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-white">{score.p2}</span>
                      <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-500 mt-2">HOST_AI</span>
                    </div>
                  </>
                )}
              </div>

              <div className="relative border-[12px] border-zinc-900/50 p-2 rounded-[2.5rem] shadow-[0_0_80px_rgba(55,99,235,0.1)] bg-zinc-900/40">
                <canvas 
                  ref={canvasRef}
                  width={WIDTH}
                  height={HEIGHT}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleMouseMove}
                  className="bg-[#0a0a0a] cursor-none w-full max-w-2xl touch-none border-4 border-zinc-800 rounded-[2rem]"
                />
                
                {/* Visual effects overlay */}
                <div className="absolute inset-0 pointer-events-none rounded-[2rem] border-2 border-primary/20 animate-pulse"></div>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/20 animate-[scan_3s_linear_infinite] rounded-full"></div>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                  <div className="w-2 h-2 bg-primary animate-ping rounded-full"></div>
                  Gaming Session Active // {activeGame.toUpperCase()}
                </div>
                {activeGame === 'snake' && (
                  <div className="grid grid-cols-3 gap-2 opacity-30">
                    <div className="col-start-2 px-3 py-2 bg-zinc-800 rounded text-[10px] font-bold">W</div>
                    <div className="col-start-1 px-3 py-2 bg-zinc-800 rounded text-[10px] font-bold">A</div>
                    <div className="col-start-2 px-3 py-2 bg-zinc-800 rounded text-[10px] font-bold">S</div>
                    <div className="col-start-3 px-3 py-2 bg-zinc-800 rounded text-[10px] font-bold">D</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-12 py-8 border-t-2 border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
          <p>© funquick Arcade / v2.1.0 - The Round Edition</p>
          <div className="flex gap-8">
            <span className="hover:text-primary transition-colors cursor-pointer border-b border-transparent hover:border-primary">Privacy Protocol</span>
            <span className="hover:text-primary transition-colors cursor-pointer border-b border-transparent hover:border-primary">Leaderboards</span>
          </div>
        </footer>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(400px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
