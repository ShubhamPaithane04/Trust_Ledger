import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Globe, MapPin, Activity, Cpu, Radio, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '../components/DashboardLayout';

export const Route = createFileRoute('/map')({
  component: LiveNetworkMap,
});

// Adjusted coordinates to roughly match an equirectangular world map
const NODES: Record<string, { x: number; y: number }> = {
  'New York': { x: 28, y: 35 },
  'London': { x: 47, y: 25 },
  'Dubai': { x: 64, y: 43 },
  'Mumbai': { x: 70, y: 47 },
  'Tokyo': { x: 86, y: 37 },
  'Paris': { x: 49, y: 27 },
  'Singapore': { x: 76, y: 56 },
  'Sydney': { x: 89, y: 80 },
  'San Francisco': { x: 15, y: 35 },
  'Toronto': { x: 27, y: 32 }
};

function LiveNetworkMap() {
  const [chain, setChain] = useState<any[]>([]);
  const [activeScan, setActiveScan] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/chain').then(r => r.json());
        const blocks = (res?.chain || []).filter((b: any) => b.index > 0);
        setChain(blocks);
        if (blocks.length > 0) {
          setActiveScan(blocks[blocks.length - 1].data);
          setIsScanning(true);
          setTimeout(() => setIsScanning(false), 1500);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
        <header className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-[var(--cv-border)] backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-[var(--cv-cyan)]/20 p-3 rounded-xl border border-[var(--cv-cyan)]/30">
              <Globe className="w-6 h-6 text-[var(--cv-cyan)]" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-display tracking-tight text-[var(--cv-text)]">
                Global Network <span className="text-gradient-cyan">Grid</span>
              </h2>
              <p className="text-xs text-[var(--cv-muted)] font-mono tracking-widest mt-1">REAL-TIME ASSET TRACKING</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-[#111] text-[#fff] px-4 py-2 rounded-lg flex items-center gap-3 border border-[#333] shadow-inner">
              <Activity className="w-4 h-4 text-[var(--cv-green)] animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[9px] text-[#888] font-mono tracking-widest font-bold">NETWORK STATUS</span>
                <span className="text-xs font-mono font-bold tracking-widest">SECURE & ACTIVE</span>
              </div>
            </div>
            <div className="glass bg-white/40 px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-mono text-[var(--cv-cyan)] border border-[var(--cv-cyan)]/30 font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--cv-cyan)] animate-pulse" /> SATELLITE UPLINK
            </div>
          </div>
        </header>

        <div className="flex-1 glass relative overflow-hidden flex items-center justify-center rounded-2xl border border-[var(--cv-border)] bg-[#0a0f12] shadow-2xl">
          {/* Cyber Grid Background */}
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(46, 93, 84, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(46, 93, 84, 0.1) 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}></div>
          
          <div className="relative w-full max-w-6xl h-[700px] z-20">
            <svg
              aria-hidden="true"
              viewBox="0 0 100 60"
              className="absolute inset-0 h-full w-full opacity-25 drop-shadow-md"
              preserveAspectRatio="xMidYMid meet"
            >
              <path d="M8 24c5-7 14-9 22-6 6 2 9 6 16 5 8-2 14-8 23-7 7 1 11 6 18 8 4 1 7 0 10 2-3 4-9 5-13 7-5 2-7 7-12 9-8 3-15-1-22-1-8 0-13 6-21 5-6-1-9-6-14-8-5-2-11-4-7-14Z" fill="none" stroke="var(--cv-cyan)" strokeWidth="0.8" />
              <path d="M12 29c6 2 10 5 16 7 5 1 9-1 14 0 5 2 8 7 14 8 9 2 14-4 22-5 6-1 12 3 17 1" fill="none" stroke="var(--cv-purple)" strokeWidth="0.7" />
              <path d="M18 20c4-1 8 0 11 2m25 0c5-3 10-4 15-2m-8 20c5-1 9-4 12-8" fill="none" stroke="white" strokeOpacity="0.7" strokeWidth="0.4" />
            </svg>

            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--cv-cyan)" />
                  <stop offset="100%" stopColor="var(--cv-purple)" />
                </linearGradient>
                <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="50%" stopColor="#fff" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>

              {chain.map((block, i) => {
                if (i === 0) return null;
                const prev = chain[i - 1].data;
                const curr = block.data;
                if (prev?.productId === curr?.productId && NODES[prev.location] && NODES[curr.location]) {
                  const n1 = NODES[prev.location];
                  const n2 = NODES[curr.location];
                  // Calculate slight curve
                  const cx = (n1.x + n2.x) / 2;
                  const cy = (n1.y + n2.y) / 2 - 10;

                  const d = `M ${n1.x} ${n1.y} Q ${cx} ${cy} ${n2.x} ${n2.y}`;
                  
                  return (
                    <g key={i}>
                      {/* Base Line */}
                      <path
                        d={`M ${n1.x}% ${n1.y}% Q ${cx}% ${cy}% ${n2.x}% ${n2.y}%`}
                        fill="none"
                        stroke="url(#line-gradient)" 
                        strokeWidth="2"
                        opacity="0.3"
                      />
                      {/* Animated Flow Line */}
                      <motion.path
                        d={`M ${n1.x}% ${n1.y}% Q ${cx}% ${cy}% ${n2.x}% ${n2.y}%`}
                        fill="none"
                        stroke="url(#flow-gradient)"
                        strokeWidth="3"
                        initial={{ strokeDasharray: "10 100", strokeDashoffset: 110 }}
                        animate={{ strokeDashoffset: -10 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="drop-shadow-[0_0_8px_rgba(46,93,84,0.8)]"
                      />
                    </g>
                  );
                }
                return null;
              })}
            </svg>

            {Object.entries(NODES).map(([city, coords]) => {
              const isActive = activeScan && activeScan.location === city;
              return (
                <div 
                  key={city}
                  className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-20"
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                >
                  {/* Radar Ripple Effect */}
                  {isActive && (
                    <>
                      <motion.div 
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 4, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                        className="absolute w-12 h-12 rounded-full border-2 border-[var(--cv-cyan)] z-0"
                      />
                      <motion.div 
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 6, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
                        className="absolute w-12 h-12 rounded-full border border-[var(--cv-cyan)] z-0"
                      />
                    </>
                  )}
                  
                  <motion.div 
                    whileHover={{ scale: 1.2 }}
                    className={`relative w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                      isActive ? 'bg-[var(--cv-cyan)] shadow-[0_0_20px_var(--cv-cyan)]' : 'bg-[#1a252c] border-2 border-[var(--cv-cyan)]/50'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-[var(--cv-cyan)]'}`} />
                  </motion.div>
                  
                  <div className="mt-2 text-[10px] font-mono font-bold tracking-widest text-white bg-black/80 px-3 py-1 rounded border border-[var(--cv-cyan)]/30 backdrop-blur-md shadow-lg z-20">
                    {city.toUpperCase()}
                  </div>
                </div>
              )
            })}
          </div>

          <AnimatePresence>
            {activeScan && (
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="absolute bottom-8 left-8 w-80 bg-black/80 border border-[var(--cv-cyan)]/50 rounded-xl overflow-hidden z-30 shadow-[0_0_30px_rgba(46,93,84,0.2)] backdrop-blur-xl"
              >
                {/* HUD Header */}
                <div className="bg-gradient-to-r from-[var(--cv-cyan)]/20 to-transparent p-4 border-b border-[var(--cv-cyan)]/30 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[var(--cv-cyan)] animate-pulse" />
                    <h4 className="text-[var(--cv-cyan)] font-mono font-bold tracking-widest text-xs">
                      INTERCEPTED SIGNAL
                    </h4>
                  </div>
                  <span className="text-[10px] text-white/50 font-mono">{new Date().toLocaleTimeString()}</span>
                </div>
                
                {/* HUD Body */}
                <div className="p-5 space-y-4">
                  {/* Scanner Effect Overlay */}
                  {isScanning && (
                    <motion.div 
                      initial={{ top: 0 }}
                      animate={{ top: "100%" }}
                      transition={{ duration: 1.5, ease: "linear" }}
                      className="absolute left-0 w-full h-1 bg-[var(--cv-cyan)] shadow-[0_0_10px_var(--cv-cyan)] z-40 opacity-50"
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      <span className="text-[9px] text-[#888] font-mono tracking-widest block mb-1">ASSET ID</span>
                      <span className="text-sm text-white font-mono font-bold">{activeScan.productId}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      <span className="text-[9px] text-[#888] font-mono tracking-widest block mb-1">LOCATION</span>
                      <span className="text-sm text-white font-mono font-bold flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-[var(--cv-cyan)]" /> {activeScan.location}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-[var(--cv-purple)]/10 p-4 rounded border border-[var(--cv-purple)]/30">
                    <span className="text-[9px] text-[var(--cv-purple)] font-mono tracking-widest block mb-1 font-bold">CURRENT STAGE</span>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg text-white font-display font-black tracking-widest uppercase">{activeScan.stage}</span>
                      <ShieldAlert className={`w-5 h-5 ${activeScan.aiResult?.anomalies?.length > 0 ? 'text-[#FF4455]' : 'text-[var(--cv-green)]'}`} />
                    </div>
                  </div>
                </div>
                
                {/* HUD Footer */}
                <div className="bg-white/5 px-4 py-2 border-t border-white/10 flex justify-between items-center">
                  <span className="text-[8px] text-[#888] font-mono tracking-widest">BLOCKCHAIN SYNCHRONIZED</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-[var(--cv-cyan)] animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-3 bg-[var(--cv-cyan)] animate-pulse" style={{ animationDelay: '100ms' }} />
                    <div className="w-1 h-3 bg-[var(--cv-cyan)] animate-pulse" style={{ animationDelay: '200ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
