import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, MapPin } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const NODES = {
  'New York': { x: 20, y: 40 },
  'London': { x: 45, y: 30 },
  'Dubai': { x: 60, y: 45 },
  'Mumbai': { x: 70, y: 50 },
  'Tokyo': { x: 90, y: 35 }
};

export default function LiveNetworkMap() {
  const [chain, setChain] = useState([]);
  const [activeScan, setActiveScan] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`\${API_URL}/chain`);
      const blocks = (res.data.chain || []).filter(b => b.index > 0);
      setChain(blocks);
      if (blocks.length > 0) {
        setActiveScan(blocks[blocks.length - 1].data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <Globe className="w-8 h-8 text-cyber-blue" />
          Global Supply Chain Network
        </h2>
      </header>

      <div className="flex-1 glass-panel relative overflow-hidden flex items-center justify-center bg-black/60">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        {/* Simulated Map Area */}
        <div className="relative w-full max-w-5xl h-[500px]">
          
          {/* Edges / Paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {chain.map((block, i) => {
              if (i === 0) return null;
              const prev = chain[i - 1].data;
              const curr = block.data;
              if (prev.productId === curr.productId && NODES[prev.location] && NODES[curr.location]) {
                const n1 = NODES[prev.location];
                const n2 = NODES[curr.location];
                return (
                  <line 
                    key={i}
                    x1={`\${n1.x}%`} y1={`\${n1.y}%`}
                    x2={`\${n2.x}%`} y2={`\${n2.y}%`}
                    stroke="rgba(0, 240, 255, 0.3)" 
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                );
              }
              return null;
            })}
          </svg>

          {/* Nodes */}
          {Object.entries(NODES).map(([city, coords]) => {
            const isActive = activeScan && activeScan.location === city;
            
            return (
              <div 
                key={city}
                className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `\${coords.x}%`, top: `\${coords.y}%` }}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 \${isActive ? 'bg-cyber-neon animate-pulse neon-border-green' : 'bg-cyber-blue border border-white/50'}`}>
                  <MapPin className={`w-3 h-3 \${isActive ? 'text-black' : 'text-white'}`} />
                </div>
                <div className="mt-2 text-sm font-bold text-gray-300 bg-black/50 px-2 rounded">
                  {city}
                </div>
              </div>
            )
          })}
        </div>

        {/* Status Overlay */}
        {activeScan && (
          <div className="absolute bottom-8 left-8 glass-panel p-4 max-w-sm">
            <h4 className="text-cyber-neon font-bold mb-1">Latest Network Activity</h4>
            <div className="text-sm text-gray-300">
              Product: <span className="text-white">{activeScan.productId}</span><br />
              Location: <span className="text-white">{activeScan.location}</span><br />
              Stage: <span className="text-white">{activeScan.stage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
