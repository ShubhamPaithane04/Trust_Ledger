import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '../components/DashboardLayout';

export const Route = createFileRoute('/ai-center')({
  component: AITrustCenter,
});

function AITrustCenter() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/alerts').then(r => r.json());
        setAlerts(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 font-display tracking-tight text-[var(--cv-text)]">
              <Cpu className="w-10 h-10 text-[var(--cv-purple)]" />
              AI Trust & Security Center
            </h2>
            <p className="text-[var(--cv-muted)] mt-2 font-mono tracking-widest text-sm">LIVE ANOMALY DETECTION AND SUPPLY CHAIN MONITORING</p>
          </div>
          
          <div className="glass bg-white/40 px-6 py-3 flex items-center gap-4 rounded-full border-[var(--cv-cyan)]/30 shadow-sm">
            <Activity className="w-6 h-6 text-[var(--cv-cyan)] animate-pulse glow-cyan" />
            <div>
              <div className="text-[10px] text-[var(--cv-muted)] tracking-widest font-bold">SYSTEM STATUS</div>
              <div className="text-[var(--cv-cyan)] font-bold font-mono tracking-wider">ACTIVE & MONITORING</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <h3 className="text-xl font-bold text-[var(--cv-text)] border-b border-[var(--cv-border)] pb-4 font-display tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--cv-purple)]"></span> RECENT AI FLAGS
          </h3>
          
          {alerts.length === 0 && (
            <div className="text-center py-20 glass bg-white/40 rounded-xl border-[var(--cv-border)] shadow-sm">
              <ShieldAlert className="w-12 h-12 text-[var(--cv-muted)] mx-auto mb-4 opacity-50" />
              <div className="text-[var(--cv-muted)] font-mono tracking-widest font-bold">NO ANOMALIES DETECTED IN THE NETWORK</div>
            </div>
          )}

          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/60 border border-[var(--cv-red)]/30 glow-red rounded-xl p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden backdrop-blur-md shadow-lg"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[var(--cv-red)] to-[var(--cv-orange)]"></div>
                
                <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 bg-[var(--cv-red)]/5 rounded-xl border border-[var(--cv-red)]/10 min-w-[140px]">
                  <ShieldAlert className="w-12 h-12 text-[var(--cv-red)] mb-3 animate-pulse drop-shadow-[0_0_15px_rgba(155,44,44,0.3)]" />
                  <span className="text-3xl font-black font-display text-[var(--cv-red)]">{alert.trustScore}%</span>
                  <span className="text-[10px] text-[var(--cv-muted)] tracking-widest mt-1 font-bold">TRUST SCORE</span>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-[var(--cv-text)] mb-2 font-display tracking-wider">Counterfeit Activity Suspected</h4>
                      <p className="text-[var(--cv-muted)] text-sm font-mono font-bold">
                        PRODUCT ID: <span className="text-[var(--cv-text)] bg-[var(--cv-surface)] px-2 py-0.5 rounded border border-[var(--cv-border)]">{alert.productId}</span> @ {alert.location.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-xs text-[var(--cv-muted)] font-mono tracking-widest bg-[var(--cv-surface)] px-3 py-1 rounded-full border border-[var(--cv-border)] font-bold">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="space-y-3 mt-2">
                    {alert.anomalies.map((anom: string, i: number) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="flex items-start gap-3 bg-[var(--cv-surface)] p-3 rounded-lg text-sm text-[var(--cv-orange)] border border-[var(--cv-red)]/20 font-mono shadow-sm font-bold"
                      >
                        <span className="text-[var(--cv-red)]">&gt;</span> {anom.toUpperCase()}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
