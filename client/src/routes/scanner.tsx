import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { ScanFace, CheckCircle, XCircle, ShieldCheck, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Route = createFileRoute('/scanner')({
  component: ConsumerScanner,
});

interface ProductMap {
  [key: string]: { name: string };
}

interface ScanData {
  productId: string;
  location: string;
  image?: string;
}

interface ScanResult {
  isAuthentic: boolean;
  trustScore: number;
  anomalies: string[];
}

function ConsumerScanner() {
  const [products, setProducts] = useState<ProductMap>({});
  const [scanData, setScanData] = useState<ScanData>({ productId: 'PRD-101', location: 'Tokyo' });
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  const handleScan = async () => {
    if (!scanData.productId) return;
    
    setIsScanning(true);
    setScanResult(null);
    setScanLogs(['> INITIALIZING SECURE SCAN...', '> AWAITING SENSOR DATA...']);
    
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    
    await sleep(600);
    setScanLogs(prev => [...prev, '> CAPTURING ENVIRONMENTAL PARAMS (LOCATION, TEMP)...', '> STATUS: OK']);
    
    await sleep(700);
    setScanLogs(prev => [...prev, '> CALCULATING SHA-256 CRYPTOGRAPHIC HASH...']);
    
    await sleep(500);
    setScanLogs(prev => [...prev, '> HASH: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855']);
    
    await sleep(800);
    setScanLogs(prev => [...prev, '> QUERYING AI ANOMALY ENGINE...', '> CHECKING SPATIAL-TEMPORAL CONSTRAINTS...']);
    
    await sleep(1000);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scanData, stage: 'Consumer' })
      });
      const res = await response.json();
      
      setScanLogs(prev => [...prev, '> AI ANALYSIS COMPLETE.', '> BLOCKCHAIN VERIFICATION COMPLETE.', '> RENDERING RESULT...']);
      await sleep(400);

      if (!response.ok || res.error) {
        setScanResult({
          isAuthentic: false,
          trustScore: 0,
          anomalies: ['PRODUCT NOT FOUND IN LEDGER', 'UNREGISTERED OR COUNTERFEIT ITEM']
        });
      } else {
        setScanResult(res.result);
      }
    } catch (err) {
      console.error(err);
      setScanLogs(prev => [...prev, '> ERROR: NETWORK FAILURE']);
    }
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-display text-[var(--cv-text)] pb-12">
      <header className="p-6 md:p-8 flex justify-between items-center z-10 relative">
        <Link to="/" className="flex items-center gap-3 text-[var(--cv-cyan)] hover:opacity-80 transition-opacity">
          <Shield className="w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-wider">ChainVerify</h1>
        </Link>
        <div className="glass px-5 py-2.5 rounded-full border border-[var(--cv-cyan)]/30 text-xs font-mono font-bold tracking-widest text-[var(--cv-cyan)] shadow-sm bg-white/40 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--cv-cyan)] animate-pulse" /> CONSUMER PORTAL
        </div>
      </header>

      <main className="flex-1 p-6 relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 max-w-7xl mx-auto w-full">
        {/* Scanner Card */}
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3 font-display text-[var(--cv-text)] tracking-tight">Verify Product</h2>
            <p className="text-[var(--cv-muted)] font-mono text-sm tracking-widest font-bold">SCAN QR TO AUTHENTICATE VIA BLOCKCHAIN</p>
          </div>

          {!scanResult ? (
            <div className="glass bg-white/70 p-8 md:p-10 flex flex-col items-center relative overflow-hidden rounded-3xl border border-[var(--cv-border)] shadow-xl transition-all">
              <AnimatePresence>
                {isScanning && (
                  <motion.div 
                    initial={{ top: -100 }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-1.5 bg-[var(--cv-cyan)] shadow-[0_0_20px_rgba(46,93,84,0.8)] z-10"
                  />
                )}
              </AnimatePresence>

              <ScanFace className={`w-32 h-32 mb-8 transition-colors duration-500 ${isScanning ? 'text-[var(--cv-cyan)] animate-pulse drop-shadow-lg' : 'text-[var(--cv-muted)] opacity-50'}`} />
              
              <div className="w-full space-y-6">
                <div>
                  <label className="text-xs text-[var(--cv-muted)] font-mono tracking-widest mb-2 block font-bold">ENTER OR SELECT PRODUCT ID</label>
                  <input 
                    type="text"
                    list="product-ids"
                    placeholder="e.g. PRD-101..."
                    className="w-full bg-white border border-[var(--cv-border)] rounded-xl p-4 text-[var(--cv-text)] outline-none focus:border-[var(--cv-cyan)] font-mono text-sm shadow-sm transition-colors"
                    value={scanData.productId}
                    onChange={e => setScanData({...scanData, productId: e.target.value})}
                    disabled={isScanning}
                  />
                  <datalist id="product-ids">
                    {Object.keys(products).map(id => (
                      <option key={id} value={id}>{products[id].name}</option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-xs text-[var(--cv-muted)] font-mono tracking-widest mb-2 block font-bold">SCAN LOCATION</label>
                  <select 
                    className="w-full bg-white border border-[var(--cv-border)] rounded-xl p-4 text-[var(--cv-text)] outline-none focus:border-[var(--cv-cyan)] font-mono text-sm shadow-sm transition-colors"
                    value={scanData.location}
                    onChange={e => setScanData({...scanData, location: e.target.value})}
                    disabled={isScanning}
                  >
                    {['Tokyo', 'London', 'New York', 'Mumbai', 'Dubai', 'Paris', 'Singapore', 'Sydney', 'San Francisco', 'Toronto'].map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
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
                          setScanData({...scanData, image: URL.createObjectURL(e.target.files[0])});
                        }
                      }}
                      disabled={isScanning}
                    />
                    {scanData.image ? (
                      <div className="absolute inset-0">
                        <img src={scanData.image} alt="Upload Preview" className="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <span className="font-mono text-xs font-bold text-white bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-sm">IMAGE CAPTURED ✓</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Shield className="w-8 h-8 mb-3 opacity-40 group-hover:opacity-60 transition-opacity" />
                        <span className="font-mono text-xs font-bold">CLICK OR DROP TO UPLOAD EVIDENCE</span>
                      </>
                    )}
                  </label>
                </div>

                <button 
                  onClick={handleScan}
                  disabled={isScanning || !scanData.productId}
                  className={`w-full py-4 rounded-xl font-bold tracking-widest text-sm transition-all duration-300 shadow-md ${
                    isScanning || !scanData.productId ? 'bg-[var(--cv-cyan)]/10 text-[var(--cv-cyan)] cursor-not-allowed shadow-none' : 'btn-primary hover:-translate-y-1'
                  }`}
                >
                  {isScanning ? 'ANALYZING LEDGER...' : 'SIMULATE SCAN'}
                </button>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`glass bg-white/90 p-10 text-center rounded-3xl border-2 shadow-2xl ${scanResult.isAuthentic ? 'border-[var(--cv-green)]' : 'border-[var(--cv-red)] glow-red'} relative overflow-hidden`}
            >
              <div className={`absolute inset-0 opacity-5 ${scanResult.isAuthentic ? 'bg-[var(--cv-green)]' : 'bg-[var(--cv-red)]'}`} />
              
              <div className="relative z-10">
                {scanResult.isAuthentic ? (
                  <CheckCircle className="w-32 h-32 text-[var(--cv-green)] mx-auto mb-6 drop-shadow-md" />
                ) : (
                  <XCircle className="w-32 h-32 text-[var(--cv-red)] mx-auto mb-6 drop-shadow-md animate-pulse" />
                )}
                
                <h3 className={`text-3xl font-black mb-3 font-display tracking-wider ${scanResult.isAuthentic ? 'text-[var(--cv-green)]' : 'text-[var(--cv-red)]'}`}>
                  {scanResult.isAuthentic ? 'VERIFIED AUTHENTIC' : 'COUNTERFEIT WARNING'}
                </h3>
                
                <div className="flex items-center justify-center gap-3 mb-8 bg-black/5 inline-flex px-5 py-2.5 rounded-full border border-[var(--cv-border)] shadow-sm">
                  <ShieldCheck className={`w-5 h-5 ${scanResult.isAuthentic ? 'text-[var(--cv-green)]' : 'text-[var(--cv-red)]'}`} />
                  <span className="text-[var(--cv-text)] font-mono tracking-wider font-bold text-sm">TRUST SCORE: {scanResult.trustScore}%</span>
                </div>

                {!scanResult.isAuthentic && scanResult.anomalies.length > 0 && (
                  <div className="bg-[var(--cv-red)]/10 border border-[var(--cv-red)]/20 p-6 rounded-2xl text-left mb-8 backdrop-blur-md shadow-inner">
                    <p className="text-[var(--cv-red)] font-bold mb-4 font-mono tracking-widest text-xs uppercase">AI Flags Detected:</p>
                    <ul className="space-y-3">
                      {scanResult.anomalies.map((anom, i) => (
                        <li key={i} className="text-sm text-[var(--cv-orange)] font-mono flex items-start gap-3 font-bold leading-relaxed">
                          <span className="text-[var(--cv-red)] mt-0.5">&gt;</span> {anom.toUpperCase()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button 
                  onClick={() => setScanResult(null)}
                  className="w-full bg-white border border-[var(--cv-border)] text-[var(--cv-text)] font-bold py-4 rounded-xl hover:bg-black/5 transition-colors text-sm tracking-widest shadow-sm"
                >
                  SCAN ANOTHER ITEM
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Terminal Logs */}
        <div className="w-full lg:w-[500px] h-[500px] lg:h-[650px] bg-[#0A0A0A] rounded-3xl border border-[var(--cv-cyan)]/20 shadow-2xl overflow-hidden flex flex-col relative">
          <div className="bg-[#151515] p-4 border-b border-[var(--cv-cyan)]/10 flex items-center justify-between">
            <div className="flex gap-2.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-sm" />
            </div>
            <span className="font-mono text-[10px] text-[var(--cv-cyan)] tracking-[0.2em] opacity-80 font-bold">CHAINVERIFY_NODE_v1.0.4</span>
          </div>
          
          <div className="flex-1 p-6 font-mono text-xs md:text-sm text-[var(--cv-cyan)] overflow-y-auto space-y-3 relative">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none" />
            
            {scanLogs.length === 0 ? (
              <div className="opacity-40">SYSTEM IDLE... AWAITING SCAN INPUT.</div>
            ) : (
              <AnimatePresence>
                {scanLogs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="leading-relaxed"
                  >
                    {log}
                  </motion.div>
                ))}
                {isScanning && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2.5 h-4 bg-[var(--cv-cyan)] mt-2 inline-block"
                  />
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
