import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Package, Server, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:3001/api';

export default function ManufacturerDashboard() {
  const [products, setProducts] = useState({});
  const [chain, setChain] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [formData, setFormData] = useState({ productId: '', name: '', location: 'Tokyo', stage: 'Factory' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const prodRes = await axios.get(`\${API_URL}/products`);
      setProducts(prodRes.data);
      
      const chainRes = await axios.get(`\${API_URL}/chain`);
      setChain(chainRes.data.chain);
      setIsValid(chainRes.data.isValid);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`\${API_URL}/mint`, formData);
      setFormData({ productId: '', name: '', location: 'Tokyo', stage: 'Factory' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const tamperChain = async () => {
    try {
      await axios.post(`\${API_URL}/tamper`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Manufacturer Hub</h2>
        {!isValid && (
          <div className="bg-cyber-red/20 text-cyber-red px-4 py-2 rounded flex items-center gap-2 border border-cyber-red neon-border-red">
            <AlertTriangle /> Blockchain Integrity Compromised
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Minting Form */}
        <div className="glass-panel p-6 col-span-1">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-cyber-neon">
            <Plus className="w-5 h-5" /> Register Product
          </h3>
          <form onSubmit={handleMint} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Product ID</label>
              <input 
                required 
                className="w-full bg-cyber-black border border-white/20 rounded p-2 text-white focus:border-cyber-neon outline-none transition" 
                value={formData.productId} 
                onChange={e => setFormData({...formData, productId: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Product Name</label>
              <input 
                required 
                className="w-full bg-cyber-black border border-white/20 rounded p-2 text-white focus:border-cyber-neon outline-none transition" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Location</label>
                <select 
                  className="w-full bg-cyber-black border border-white/20 rounded p-2 text-white focus:border-cyber-neon outline-none"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                >
                  <option>Tokyo</option>
                  <option>London</option>
                  <option>New York</option>
                  <option>Mumbai</option>
                  <option>Dubai</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Stage</label>
                <input 
                  disabled
                  value="Factory"
                  className="w-full bg-cyber-black/50 border border-white/10 rounded p-2 text-gray-500 cursor-not-allowed" 
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-cyber-blue hover:bg-cyber-neon hover:text-black text-white font-bold py-2 rounded transition-all duration-300">
              Mint to Blockchain
            </button>
          </form>

          <div className="mt-8 border-t border-white/10 pt-6">
            <h4 className="text-sm text-gray-400 mb-2">Demo Controls</h4>
            <button onClick={tamperChain} className="w-full border border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-white py-2 rounded transition-all">
              Simulate Hack (Tamper Data)
            </button>
          </div>
        </div>

        {/* Blockchain Explorer */}
        <div className="glass-panel p-6 col-span-2 flex flex-col h-[600px]">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-cyber-purple">
            <Server className="w-5 h-5" /> Live Ledger
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {(chain || []).slice().reverse().map((block, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={idx} 
                className="bg-black/40 border border-white/5 p-4 rounded-lg relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyber-neon to-cyber-purple"></div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500">Block #{block.index}</span>
                  <span className="text-xs text-gray-400">{new Date(block.timestamp).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <span className="text-xs text-gray-500 block">Previous Hash</span>
                    <span className="text-xs font-mono text-gray-300 truncate block w-48" title={block.previousHash}>{block.previousHash}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Block Hash</span>
                    <span className="text-xs font-mono text-cyber-neon truncate block w-48" title={block.hash}>{block.hash}</span>
                  </div>
                </div>
                <div className="bg-white/5 p-2 rounded text-xs font-mono text-green-400">
                  {JSON.stringify(block.data)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
