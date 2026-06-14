import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, QrCode, Activity, Map } from 'lucide-react';

import ManufacturerDashboard from './components/ManufacturerDashboard';
import ConsumerScanner from './components/ConsumerScanner';
import AITrustCenter from './components/AITrustCenter';
import LiveNetworkMap from './components/LiveNetworkMap';

function App() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Manufacturer', icon: LayoutDashboard },
    { path: '/map', label: 'Network Map', icon: Map },
    { path: '/ai-center', label: 'AI Trust Center', icon: Activity },
    { path: '/scanner', label: 'Consumer Scanner', icon: QrCode },
  ];

  return (
    <div className="flex h-screen bg-cyber-black overflow-hidden">
      {/* Sidebar - Demo Controller */}
      <aside className="w-64 border-r border-white/10 bg-cyber-dark p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-10 text-cyber-neon">
            <Shield className="w-8 h-8" />
            <h1 className="text-xl font-bold tracking-wider">ChainVerify</h1>
          </div>
          
          <nav className="space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 \${
                  location.pathname === item.path 
                    ? 'bg-cyber-blue/50 text-cyber-neon border border-cyber-neon/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Prototype Mode Active
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <Routes>
          <Route path="/" element={<ManufacturerDashboard />} />
          <Route path="/map" element={<LiveNetworkMap />} />
          <Route path="/ai-center" element={<AITrustCenter />} />
          <Route path="/scanner" element={<ConsumerScanner />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
