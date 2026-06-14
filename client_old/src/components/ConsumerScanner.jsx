import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ScanFace, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductTimeline from './ProductTimeline';

const API_URL = 'http://localhost:3001/api';

export default function ConsumerScanner() {
  const [products, setProducts] = useState({});
  const [scanData, setScanData] = useState({ productId: 'PRD-101', location: 'Tokyo' });
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    axios.get(`\${API_URL}/products`).then(res => setProducts(res.data));
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    
    // Simulate network delay for effect
    setTimeout(async () => {
      try {
        const res = await axios.post(`\${API_URL}/scan`, { ...scanData, stage: 'Consumer' });
        setScanResult(res.data.result);
      } catch (err) {
        console.error(err);
      }
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Verify Product</h2>
        <p className="text-gray-400">Scan QR to authenticate via Blockchain</p>
      </div>

      {!scanResult && (
        <div className="glass-panel p-8 flex flex-col items-center relative overflow-hidden">
          {/* Scanning Animation overlay */}
          <AnimatePresence>
            {isScanning && (
              <motion.div 
                initial={{ top: -100 }}
                animate={{ top: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute left-0 w-full h-1 bg-cyber-neon shadow-[0_0_20px_rgba(0,240,255,0.8)] z-10"
              />
            )}
          </AnimatePresence>

          <ScanFace className={`w-32 h-32 mb-6 \${isScanning ? 'text-cyber-neon animate-pulse' : 'text-gray-500'}`} />
          
          <div className="w-full space-y-4">
            <select 
              className="w-full bg-black/50 border border-white/20 rounded p-3 text-white outline-none"
              value={scanData.productId}
              onChange={e => setScanData({...scanData, productId: e.target.value})}
              disabled={isScanning}
            >
              {Object.keys(products).map(id => (
                <option key={id} value={id}>{products[id].name} ({id})</option>
              ))}
            </select>

            <select 
              className="w-full bg-black/50 border border-white/20 rounded p-3 text-white outline-none"
              value={scanData.location}
              onChange={e => setScanData({...scanData, location: e.target.value})}
              disabled={isScanning}
            >
              <option>Tokyo</option>
              <option>London</option>
              <option>New York</option>
              <option>Mumbai</option>
              <option>Dubai</option>
            </select>

            <button 
              onClick={handleScan}
              disabled={isScanning}
              className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition"
            >
              {isScanning ? 'Analyzing...' : 'Simulate Scan'}
            </button>
          </div>
        </div>
      )}

      {scanResult && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`glass-panel p-8 text-center border \${scanResult.isAuthentic ? 'border-cyber-green neon-border-green' : 'border-cyber-red neon-border-red'}`}
        >
          {scanResult.isAuthentic ? (
            <CheckCircle className="w-24 h-24 text-cyber-green mx-auto mb-4" />
          ) : (
            <XCircle className="w-24 h-24 text-cyber-red mx-auto mb-4" />
          )}
          
          <h3 className={`text-2xl font-bold mb-2 \${scanResult.isAuthentic ? 'text-cyber-green neon-text-green' : 'text-cyber-red neon-text-red'}`}>
            {scanResult.isAuthentic ? 'VERIFIED AUTHENTIC' : 'COUNTERFEIT WARNING'}
          </h3>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300">Trust Score: {scanResult.trustScore}%</span>
          </div>

          {!scanResult.isAuthentic && scanResult.anomalies.length > 0 && (
            <div className="bg-cyber-red/10 border border-cyber-red/30 p-4 rounded text-left mb-6">
              <p className="text-cyber-red font-semibold mb-2">AI Flags Detected:</p>
              <ul className="list-disc pl-5 text-sm text-red-300 space-y-1">
                {scanResult.anomalies.map((anom, i) => (
                  <li key={i}>{anom}</li>
                ))}
              </ul>
            </div>
          )}

          <button 
            onClick={() => setScanResult(null)}
            className="w-full border border-white/20 text-white font-bold py-3 rounded-lg hover:bg-white/10 transition mt-6"
          >
            Scan Another Item
          </button>

          {scanResult.isAuthentic && <ProductTimeline productId={scanData.productId} />}
        </motion.div>
      )}
    </div>
  );
}
