import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Database, Search, Link as LinkIcon, Clock, Hash, AlertOctagon, Activity } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';

export const Route = createFileRoute('/explorer')({
  component: Explorer,
});

function Explorer() {
  const [chainData, setChainData] = useState<{ chain: any[], isValid: boolean } | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchChain = async () => {
      try {
        const res = await fetch('/api/chain').then(r => r.json());
        setChainData(res);
        // Default select latest block
        if (res.chain && res.chain.length > 0) {
          setSelectedBlock(res.chain.length - 1);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchChain();
    // Refresh occasionally
    const interval = setInterval(fetchChain, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!chainData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-[var(--cv-cyan)] animate-pulse font-mono tracking-widest">CONNECTING TO LEDGER...</div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredChain = chainData.chain.filter(b => 
    b.hash.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.data.productId && b.data.productId.toLowerCase().includes(searchTerm.toLowerCase()))
  ).reverse();

  const activeBlock = chainData.chain[selectedBlock];

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display text-[var(--cv-text)]">Block Explorer</h2>
          <p className="text-[var(--cv-muted)] font-mono text-sm tracking-widest mt-1">
            CRYPTOGRAPHIC LEDGER INSPECTOR
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cv-muted)]" />
            <input 
              type="text" 
              placeholder="Search hash or PRD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass pl-9 pr-4 py-2 rounded-lg border border-[var(--cv-border)] bg-white/50 text-[var(--cv-text)] font-mono text-sm focus:border-[var(--cv-cyan)] outline-none w-64"
            />
          </div>
          <div className={`px-4 py-2 rounded-lg font-mono text-xs font-bold flex items-center gap-2 ${chainData.isValid ? 'bg-[var(--cv-green)]/10 text-[var(--cv-green)] border border-[var(--cv-green)]/30' : 'bg-[var(--cv-red)]/10 text-[var(--cv-red)] border border-[var(--cv-red)]/30 glow-red'}`}>
            {chainData.isValid ? <><Database className="w-4 h-4" /> CHAIN INTACT</> : <><AlertOctagon className="w-4 h-4" /> CHAIN COMPROMISED</>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        
        {/* Left Column: Block List */}
        <div className="glass rounded-xl border border-[var(--cv-border)] overflow-hidden flex flex-col bg-white/40">
          <div className="p-4 border-b border-[var(--cv-border)] bg-[var(--cv-bg)] flex justify-between items-center">
            <span className="font-mono text-xs tracking-widest text-[var(--cv-muted)]">LATEST BLOCKS</span>
            <span className="font-mono text-xs text-[var(--cv-cyan)]">{filteredChain.length} FOUND</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            <AnimatePresence>
              {filteredChain.map((block) => (
                <motion.button
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={block.index}
                  onClick={() => setSelectedBlock(block.index)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-2 ${
                    selectedBlock === block.index 
                      ? 'bg-[var(--cv-cyan)]/10 border-[var(--cv-cyan)]/50 shadow-[0_0_15px_rgba(46,93,84,0.1)]' 
                      : 'bg-white/50 border-[var(--cv-border)] hover:border-[var(--cv-cyan)]/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-[var(--cv-text)]">BLOCK #{block.index}</span>
                    <span className="font-mono text-[10px] text-[var(--cv-muted)]">
                      {new Date(block.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Hash className="w-3 h-3 text-[var(--cv-cyan)]" />
                    <span className="font-mono text-xs text-[var(--cv-muted)] truncate">
                      {block.hash.substring(0, 16)}...
                    </span>
                  </div>

                  {block.data.productId && (
                    <div className="inline-block px-2 py-0.5 bg-black/5 rounded text-[10px] font-mono text-[var(--cv-text)] border border-[var(--cv-border)] w-fit mt-1">
                      {block.data.type}: {block.data.productId}
                    </div>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
            {filteredChain.length === 0 && (
              <div className="p-8 text-center text-[var(--cv-muted)] font-mono text-sm">NO BLOCKS FOUND</div>
            )}
          </div>
        </div>

        {/* Right Column: Block Details */}
        <div className="lg:col-span-2 glass rounded-xl border border-[var(--cv-border)] overflow-hidden flex flex-col bg-white/60 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--cv-cyan)]/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="p-5 border-b border-[var(--cv-border)] flex justify-between items-center bg-[var(--cv-bg)]/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-[var(--cv-cyan)]" />
              <h3 className="font-display font-bold text-lg tracking-wider text-[var(--cv-text)]">
                Block #{activeBlock?.index} Details
              </h3>
            </div>
            {activeBlock?.data?.tampered && (
              <span className="bg-[var(--cv-red)]/10 text-[var(--cv-red)] border border-[var(--cv-red)]/30 px-3 py-1 rounded font-mono text-xs font-bold animate-pulse">
                DATA TAMPERED
              </span>
            )}
          </div>

          {activeBlock ? (
            <div className="flex-1 overflow-y-auto p-6 relative z-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-widest text-[var(--cv-muted)] font-bold">TIMESTAMP</label>
                  <div className="flex items-center gap-2 font-mono text-sm text-[var(--cv-text)] bg-white/80 p-3 rounded-lg border border-[var(--cv-border)]">
                    <Clock className="w-4 h-4 text-[var(--cv-cyan)]" />
                    {new Date(activeBlock.timestamp).toLocaleString()}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-widest text-[var(--cv-muted)] font-bold">TRANSACTION TYPE</label>
                  <div className="flex items-center gap-2 font-mono text-sm text-[var(--cv-text)] bg-white/80 p-3 rounded-lg border border-[var(--cv-border)]">
                    <Activity className="w-4 h-4 text-[var(--cv-purple)]" />
                    {activeBlock.data.type || 'GENESIS'}
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-widest text-[var(--cv-muted)] font-bold">BLOCK HASH (SHA-256)</label>
                  <div className="font-mono text-xs md:text-sm text-[var(--cv-cyan)] bg-[var(--cv-cyan)]/5 p-4 rounded-lg border border-[var(--cv-cyan)]/20 break-all select-all shadow-inner">
                    {activeBlock.hash}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-widest text-[var(--cv-muted)] font-bold">PREVIOUS HASH</label>
                  <div className="flex items-center gap-2 font-mono text-xs text-[var(--cv-muted)] bg-white/80 p-3 rounded-lg border border-[var(--cv-border)] break-all shadow-sm">
                    <LinkIcon className="w-3 h-3 flex-shrink-0" />
                    {activeBlock.previousHash}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest text-[var(--cv-muted)] font-bold flex items-center gap-2">
                  RAW PAYLOAD DATA
                  <div className="h-px flex-1 bg-[var(--cv-border)]" />
                </label>
                <div className="bg-[#1A1A1A] rounded-xl p-5 overflow-x-auto shadow-inner border border-[#333]">
                  <pre className="font-mono text-sm text-[#00D4FF] leading-relaxed">
                    {JSON.stringify(activeBlock.data, null, 2)}
                  </pre>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--cv-muted)] font-mono text-sm">
              SELECT A BLOCK TO VIEW DETAILS
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
