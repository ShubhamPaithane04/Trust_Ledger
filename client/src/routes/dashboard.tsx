import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Plus, Server, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/DashboardLayout';

export const Route = createFileRoute('/dashboard')({
  component: ManufacturerDashboard,
});

interface ProductMap {
  [key: string]: { name: string };
}

interface BlockData {
  type: string;
  productId?: string;
  location?: string;
  stage?: string;
  tampered?: boolean;
}

interface Block {
  index: number;
  timestamp: string;
  data: BlockData;
  previousHash: string;
  hash: string;
}

interface Alert {
  id: string;
  timestamp: string;
  productId: string;
  location: string;
  anomalies: string[];
  trustScore: number;
}

function ManufacturerDashboard() {
  const [products, setProducts] = useState<ProductMap>({});
  const [chain, setChain] = useState<Block[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [formData, setFormData] = useState({ productId: '', name: '', location: 'Tokyo', stage: 'Factory', image: '' });

  const fetchData = async () => {
    try {
      const prodRes = await fetch('/api/products').then(r => r.json());
      setProducts(prodRes);
      
      const chainRes = await fetch('/api/chain').then(r => r.json());
      if (chainRes) {
        setChain(chainRes.chain);
        setIsValid(chainRes.isValid);
      }

      const alertRes = await fetch('/api/alerts').then(r => r.json());
      setAlerts(alertRes || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setFormData({ productId: '', name: '', location: 'Tokyo', stage: 'Factory', image: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const tamperChain = async () => {
    try {
      await fetch('/api/tamper', { method: 'POST' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const scansCount = chain.filter((b) => b.data?.type === 'SCAN').length;
  const blocksCount = chain.length;
  const productsCount = Object.keys(products).length;
  const anomaliesCount = alerts.length;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--cv-border)] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-black/5 mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--cv-cyan)] animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-[var(--cv-muted)] uppercase font-bold">
                Manufacturer Hub // Online
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black font-display tracking-tight text-[var(--cv-text)]">
              Command <span className="text-gradient-cyan">Center</span>
            </h2>
          </div>
          {!isValid && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#FF4455]/10 text-[#FF4455] px-5 py-3 rounded-xl flex items-center gap-3 border border-[#FF4455]/50 glow-red font-mono tracking-widest text-xs font-bold"
            >
              <AlertTriangle className="w-5 h-5" /> INTEGRITY COMPROMISED
            </motion.div>
          )}
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { l: "Total Products", v: productsCount, c: "var(--cv-cyan)" },
            { l: "Total Scans", v: scansCount, c: "var(--cv-purple)" },
            { l: "Anomalies", v: anomaliesCount, c: "var(--cv-red)" },
            { l: "Blocks Mined", v: blocksCount, c: "var(--cv-green)" },
          ].map((m, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={m.l} 
              className="glass rounded-2xl p-6 border border-[var(--cv-border)] relative overflow-hidden group bg-white/50"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 opacity-90 transition-opacity group-hover:opacity-100" style={{ backgroundColor: m.c }} />
              <p className="font-mono text-xs text-[var(--cv-muted)] tracking-wider relative z-10 font-bold uppercase">{m.l}</p>
              <p className="font-display font-black text-5xl mt-3 relative z-10 tracking-tight" style={{ color: m.c }}>{m.v}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass p-8 rounded-2xl bg-white/60 border border-[var(--cv-border)] shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-[var(--cv-text)] font-display tracking-wider border-b border-[var(--cv-border)] pb-4">
                <Plus className="w-5 h-5 text-[var(--cv-cyan)]" /> REGISTER ASSET
              </h3>
              
              <form onSubmit={handleMint} className="space-y-6">
                <div>
                  <label className="block text-xs text-[var(--cv-muted)] mb-2 tracking-widest font-mono font-bold">PRODUCT ID</label>
                  <input 
                    required 
                    className="w-full bg-white/70 border border-[var(--cv-border)] rounded-xl p-3.5 text-[var(--cv-text)] focus:border-[var(--cv-cyan)] outline-none font-mono text-sm transition-all shadow-sm" 
                    value={formData.productId} 
                    onChange={e => setFormData({...formData, productId: e.target.value})}
                    placeholder="e.g. PRD-999"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--cv-muted)] mb-2 tracking-widest font-mono font-bold">PRODUCT NAME</label>
                  <input 
                    required 
                    className="w-full bg-white/70 border border-[var(--cv-border)] rounded-xl p-3.5 text-[var(--cv-text)] focus:border-[var(--cv-cyan)] outline-none font-mono text-sm transition-all shadow-sm" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Quantum Chip v2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--cv-muted)] mb-2 tracking-widest font-mono font-bold">LOCATION</label>
                    <select 
                      className="w-full bg-white/70 border border-[var(--cv-border)] rounded-xl p-3.5 text-[var(--cv-text)] focus:border-[var(--cv-cyan)] outline-none font-mono text-sm shadow-sm"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    >
                      {['Tokyo', 'London', 'New York', 'Mumbai', 'Dubai', 'Paris', 'Singapore', 'Sydney', 'San Francisco', 'Toronto'].map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--cv-muted)] mb-2 tracking-widest font-mono font-bold">STAGE</label>
                    <input 
                      disabled
                      value="Factory"
                      className="w-full bg-black/5 border border-transparent rounded-xl p-3.5 text-[var(--cv-muted)] font-mono text-sm cursor-not-allowed" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[var(--cv-muted)] font-mono tracking-widest mb-2 block font-bold">PRODUCT IMAGE (OPTIONAL)</label>
                  <label className="w-full bg-white/50 border-2 border-dashed border-[var(--cv-border)] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--cv-cyan)]/5 hover:border-[var(--cv-cyan)]/50 transition-all text-[var(--cv-muted)] relative overflow-hidden group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setFormData({...formData, image: event.target.result as string});
                            }
                          };
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                    />
                    {formData.image ? (
                      <div className="absolute inset-0">
                        <img src={formData.image} alt="Upload Preview" className="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <span className="font-mono text-xs font-bold text-white bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-sm">IMAGE ATTACHED ✓</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Plus className="w-8 h-8 mb-3 opacity-40 group-hover:opacity-60 transition-opacity" />
                        <span className="font-mono text-xs font-bold">CLICK OR DROP TO UPLOAD IMAGE</span>
                      </>
                    )}
                  </label>
                </div>

                <button type="submit" className="w-full btn-primary mt-4 py-4 tracking-widest text-sm font-bold rounded-xl shadow-md hover:shadow-lg">
                  MINT TO BLOCKCHAIN
                </button>
              </form>
            </div>

            <div className="glass p-6 rounded-2xl border border-[var(--cv-red)]/30 bg-[var(--cv-red)]/5">
              <h4 className="text-xs text-[var(--cv-red)] font-bold mb-3 tracking-widest font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> SECURITY DEMO
              </h4>
              <p className="text-sm text-[var(--cv-text)] mb-5 font-medium opacity-80">Simulate a malicious node attempting to rewrite history.</p>
              <button onClick={tamperChain} className="w-full bg-transparent border-2 border-[var(--cv-red)] text-[var(--cv-red)] hover:bg-[var(--cv-red)] hover:text-white py-3.5 rounded-xl transition-colors text-xs font-mono tracking-widest font-bold shadow-sm">
                TAMPER LEDGER
              </button>
            </div>
          </div>

          {/* Right Column: Ledger */}
          <div className="lg:col-span-8 glass p-8 rounded-2xl flex flex-col h-[800px] border border-[var(--cv-border)] bg-white/50">
            <div className="flex justify-between items-center mb-6 border-b border-[var(--cv-border)] pb-5">
              <h3 className="text-xl font-bold flex items-center gap-3 text-[var(--cv-text)] font-display tracking-wider">
                <Server className="w-5 h-5 text-[var(--cv-purple)]" /> LIVE LEDGER FEED
              </h3>
              <div className="flex gap-2 items-center bg-white/80 px-4 py-2 rounded-full border border-[var(--cv-border)] shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--cv-green)] animate-pulse" />
                <span className="text-xs font-mono text-[var(--cv-muted)] tracking-widest font-bold">SYNCING</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-5 pr-4 custom-scrollbar">
              {[...chain].reverse().map((block: Block, idx: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={idx} 
                  className="bg-white/80 border border-[var(--cv-border)] p-6 rounded-2xl relative overflow-hidden group hover:border-[var(--cv-cyan)] transition-colors shadow-sm"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[var(--cv-cyan)] to-[var(--cv-purple)] opacity-80" />
                  
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5 pl-2">
                    <div className="flex items-center gap-3">
                      <span className="bg-[var(--cv-cyan)]/10 text-[var(--cv-cyan)] px-3 py-1 rounded-md text-xs font-bold font-mono border border-[var(--cv-cyan)]/20">
                        BLOCK #{block.index}
                      </span>
                      {block.data.type === 'MINT' ? (
                        <span className="text-xs text-[var(--cv-green)] border border-[var(--cv-green)]/30 bg-[var(--cv-green)]/10 px-3 py-1 rounded-full font-mono font-bold">GENESIS MINT</span>
                      ) : (
                        <span className="text-xs text-[var(--cv-purple)] border border-[var(--cv-purple)]/30 bg-[var(--cv-purple)]/10 px-3 py-1 rounded-full font-mono font-bold">SCAN EVENT</span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--cv-muted)] font-mono font-bold">{new Date(block.timestamp).toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 bg-black/5 p-4 rounded-xl border border-[var(--cv-border)]">
                    <div>
                      <span className="text-[10px] text-[var(--cv-muted)] block tracking-widest mb-1.5 font-mono font-bold uppercase">Previous Hash</span>
                      <span className="text-xs font-mono text-[var(--cv-text)] truncate block w-full opacity-70" title={block.previousHash}>{block.previousHash}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--cv-muted)] block tracking-widest mb-1.5 font-mono font-bold uppercase">Block Hash</span>
                      <span className="text-xs font-mono text-[var(--cv-purple)] truncate block w-full font-bold" title={block.hash}>{block.hash}</span>
                    </div>
                  </div>

                  <div className="bg-[#1C1814] p-5 rounded-xl text-xs font-mono text-[#F2EBDD] shadow-inner overflow-x-auto">
                    <pre>{JSON.stringify(block.data, null, 2)}</pre>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
