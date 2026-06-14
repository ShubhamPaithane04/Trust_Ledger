import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Package, Store, Factory } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:3001/api';

const STAGE_ICONS = {
  'Factory': Factory,
  'Warehouse': Package,
  'Distributor': Truck,
  'Retailer': Store,
  'Consumer': Package
};

export default function ProductTimeline({ productId }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (productId) {
      axios.get(`\${API_URL}/chain`).then(res => {
        const blocks = (res.data.chain || [])
          .filter(b => b.index > 0 && b.data.productId === productId)
          .map(b => b.data);
        setHistory(blocks);
      });
    }
  }, [productId]);

  if (!history.length) return null;

  return (
    <div className="mt-8 text-left">
      <h4 className="text-xl font-bold mb-6 text-center">Verified Supply Chain Journey</h4>
      <div className="relative border-l-2 border-cyber-blue ml-4 space-y-8 pb-4">
        {history.map((step, idx) => {
          const Icon = STAGE_ICONS[step.stage] || Package;
          return (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.2 }}
              key={idx} 
              className="relative pl-8"
            >
              <div className="absolute -left-[17px] bg-cyber-dark border-2 border-cyber-neon w-8 h-8 rounded-full flex items-center justify-center">
                <Icon className="w-4 h-4 text-cyber-neon" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded p-4">
                <div className="flex justify-between items-center mb-1">
                  <h5 className="font-bold text-cyber-neon">{step.stage}</h5>
                  <span className="text-xs text-gray-500">{new Date().toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-300">Location: {step.location}</p>
                <p className="text-xs text-gray-500 mt-2 font-mono truncate">Hash: {step.hash || 'Verified on Blockchain'}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
