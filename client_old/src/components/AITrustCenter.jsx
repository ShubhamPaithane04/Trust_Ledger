import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:3001/api';

export default function AITrustCenter() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`\${API_URL}/alerts`);
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Cpu className="w-8 h-8 text-cyber-neon" />
            AI Trust & Security Center
          </h2>
          <p className="text-gray-400 mt-2">Live anomaly detection and supply chain monitoring</p>
        </div>
        
        <div className="glass-panel px-6 py-3 flex items-center gap-4">
          <Activity className="w-6 h-6 text-cyber-green animate-pulse" />
          <div>
            <div className="text-xs text-gray-500">System Status</div>
            <div className="text-cyber-green font-bold">ACTIVE & MONITORING</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-xl font-semibold text-gray-300 border-b border-white/10 pb-2">Recent AI Flags</h3>
        
        {alerts.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No anomalies detected in the network.
          </div>
        )}

        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-cyber-red/10 border border-cyber-red neon-border-red rounded-lg p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-cyber-red"></div>
              
              <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 bg-black/40 rounded-lg">
                <ShieldAlert className="w-10 h-10 text-cyber-red mb-2 animate-bounce" />
                <span className="text-2xl font-bold text-cyber-red">{alert.trustScore}%</span>
                <span className="text-xs text-gray-400">Trust Score</span>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">Counterfeit Activity Suspected</h4>
                    <p className="text-gray-400 text-sm">Product ID: <span className="text-white font-mono">{alert.productId}</span> @ {alert.location}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="space-y-2">
                  {alert.anomalies.map((anom, i) => (
                    <div key={i} className="flex items-start gap-2 bg-black/30 p-3 rounded text-sm text-red-200 border border-cyber-red/20">
                      <span className="text-cyber-red font-bold">❯</span> {anom}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
