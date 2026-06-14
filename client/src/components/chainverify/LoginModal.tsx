import { motion, AnimatePresence } from 'framer-motion';
import { X, Factory, User, ArrowRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1C1814]/40 backdrop-blur-sm z-50 flex justify-center items-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass bg-white/90 w-full max-w-2xl rounded-3xl p-8 relative shadow-2xl border border-[var(--cv-border)] overflow-hidden"
            >
              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--cv-cyan)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--cv-purple)]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-[var(--cv-muted)] hover:text-[var(--cv-text)] transition-colors p-2 rounded-full hover:bg-black/5 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-10 relative z-10">
                <h2 className="text-3xl font-display font-black text-[var(--cv-text)] mb-3 tracking-tight">
                  Access Platform
                </h2>
                <p className="text-[var(--cv-muted)] font-mono text-sm tracking-widest font-bold">
                  SELECT YOUR DESIGNATED PORTAL
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 relative z-10">
                {/* Manufacturer Login Card */}
                <Link 
                  to="/dashboard"
                  className="group relative overflow-hidden rounded-2xl border-2 border-[var(--cv-border)] bg-white/50 p-6 transition-all hover:border-[var(--cv-cyan)] hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--cv-cyan)]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  
                  <div className="w-12 h-12 rounded-full bg-[var(--cv-cyan)]/10 flex items-center justify-center mb-6 text-[var(--cv-cyan)] group-hover:scale-110 transition-transform">
                    <Factory className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-xl font-display font-bold text-[var(--cv-text)] mb-2 tracking-wide">
                    Manufacturer
                  </h3>
                  <p className="text-sm text-[var(--cv-muted)] font-medium mb-6 leading-relaxed">
                    Access the command center to mint assets, monitor global supply chains, and view live AI anomaly alerts.
                  </p>
                  
                  <div className="flex items-center text-[var(--cv-cyan)] font-mono text-xs tracking-widest font-bold">
                    ENTER PORTAL <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* Consumer Login Card */}
                <Link 
                  to="/scanner"
                  className="group relative overflow-hidden rounded-2xl border-2 border-[var(--cv-border)] bg-white/50 p-6 transition-all hover:border-[var(--cv-purple)] hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--cv-purple)]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  
                  <div className="w-12 h-12 rounded-full bg-[var(--cv-purple)]/10 flex items-center justify-center mb-6 text-[var(--cv-purple)] group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-xl font-display font-bold text-[var(--cv-text)] mb-2 tracking-wide">
                    Consumer
                  </h3>
                  <p className="text-sm text-[var(--cv-muted)] font-medium mb-6 leading-relaxed">
                    Verify product authenticity instantly. Scan QR codes to check blockchain ledger history and AI trust scores.
                  </p>
                  
                  <div className="flex items-center text-[var(--cv-purple)] font-mono text-xs tracking-widest font-bold">
                    ENTER PORTAL <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
              
              <div className="mt-8 text-center border-t border-[var(--cv-border)] pt-6 relative z-10">
                <span className="inline-block bg-[var(--cv-green)]/10 text-[var(--cv-green)] border border-[var(--cv-green)]/20 px-3 py-1 rounded-full font-mono text-[10px] tracking-[0.2em] font-bold">
                  SECURE CONNECTION ESTABLISHED
                </span>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
