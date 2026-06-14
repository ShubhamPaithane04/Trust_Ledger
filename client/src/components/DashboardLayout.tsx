import React, { useState, useEffect } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { Shield, LayoutDashboard, QrCode, Activity, Map, Database, X, AlertTriangle, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [toast, setToast] = useState<any>(null);
  const [seenAlerts, setSeenAlerts] = useState<Set<number>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/alerts').then(r => r.json());
        if (res && res.length > 0) {
          const latest = res[0];
          if (!seenAlerts.has(latest.id)) {
            setSeenAlerts(prev => new Set(prev).add(latest.id));
            setToast(latest);
            setTimeout(() => setToast(null), 5000);
          }
        }
      } catch (e) {
        // ignore
      }
    };
    const interval = setInterval(fetchAlerts, 2000);
    return () => clearInterval(interval);
  }, [seenAlerts]);

  const navItems = [
    { path: '/dashboard', label: 'Manufacturer', icon: LayoutDashboard },
    { path: '/explorer', label: 'Block Explorer', icon: Database },
    { path: '/map', label: 'Network Map', icon: Map },
    { path: '/ai-center', label: 'AI Trust Center', icon: Activity },
    { path: '/scanner', label: 'Consumer Scanner', icon: QrCode },
  ];

  const SidebarContent = () => (
    <>
      <div>
        <Link to="/" className="flex items-center gap-3 mb-10 text-[var(--cv-cyan)] hover:opacity-80 transition-opacity">
          <Shield className="w-8 h-8" />
          <h1 className="text-xl font-bold tracking-wider font-display">ChainVerify</h1>
        </Link>
        
        <nav className="space-y-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? 'bg-[var(--cv-cyan)]/10 text-[var(--cv-cyan)] border border-[var(--cv-cyan)]/30 shadow-sm' 
                    : 'text-[var(--cv-muted)] hover:text-[var(--cv-text)] hover:bg-[var(--cv-cyan)]/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-6">
        <Link 
          to="/"
          onClick={() => setIsSidebarOpen(false)}
          className="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 text-[var(--cv-muted)] hover:text-[var(--cv-text)] hover:bg-[var(--cv-border)] border border-transparent hover:border-[var(--cv-border)]"
        >
          <Shield className="w-5 h-5" />
          Return Home
        </Link>
        <div className="text-xs text-[var(--cv-green)] text-center tracking-widest animate-pulse font-bold">
          SYSTEM ACTIVE
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-transparent overflow-hidden text-[var(--cv-text)] font-mono">
      <aside className="hidden lg:flex w-64 border-r border-[var(--cv-border)] glass p-6 flex-col justify-between z-40 bg-white/30">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.button
              aria-label="Close navigation"
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed inset-y-0 left-0 w-72 border-r border-[var(--cv-border)] glass p-6 flex flex-col justify-between z-50 bg-[var(--cv-bg)] lg:hidden"
            >
              <button
                aria-label="Close navigation"
                onClick={() => setIsSidebarOpen(false)}
                className="absolute right-4 top-4 rounded-lg border border-[var(--cv-border)] p-2 text-[var(--cv-muted)] hover:text-[var(--cv-text)]"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto p-4 pt-20 md:p-8 relative">
        <button
          aria-label="Open navigation"
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-4 top-4 z-30 rounded-xl border border-[var(--cv-border)] glass bg-white/70 p-3 text-[var(--cv-text)] shadow-sm lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative z-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Global Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-8 right-8 z-50 glass bg-white/80 border-[#FF4455] p-4 pr-12 rounded-xl shadow-xl max-w-sm"
          >
            <button onClick={() => setToast(null)} className="absolute top-2 right-2 text-gray-500 hover:text-black">
              <X className="w-4 h-4" />
            </button>
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-[#FF4455] flex-shrink-0 animate-pulse" />
              <div>
                <h4 className="text-[#FF4455] font-bold font-display text-sm tracking-wider">ANOMALY DETECTED</h4>
                <p className="text-xs text-[var(--cv-muted)] mt-1">Product: <span className="text-[var(--cv-text)] font-bold">{toast.productId}</span></p>
                <p className="text-[10px] text-[#D08A3E] mt-2 leading-tight font-bold">{toast.anomalies[0]?.toUpperCase()}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
