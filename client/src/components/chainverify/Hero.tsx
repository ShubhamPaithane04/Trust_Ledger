import { useState } from "react";
import { motion } from "framer-motion";
import { HeroScene } from "./HeroScene";
import { LoginModal } from "./LoginModal";

const stats = [
  "256-bit SHA Encryption",
  "3 AI Algorithms",
  "Real-time Detection",
];

export function Hero() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <section className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0">
        <HeroScene />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--cv-bg)] pointer-events-none" />
      <div className="scanline" />

      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--cv-green)] animate-pulse" />
          <span className="font-mono text-xs tracking-[0.2em] text-[var(--cv-muted)] font-bold">
            CHAINVERIFY // v1.0 // ONLINE
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight"
        >
          The Future of <br />
          <span className="text-gradient-multi">Product Authentication</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-6 text-lg md:text-2xl text-[var(--cv-muted)] font-medium max-w-3xl mx-auto"
        >
          AI-Powered Anomaly Detection meets <span className="text-[var(--cv-cyan)] font-bold">Cryptographic Blockchain</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <button onClick={() => setIsLoginModalOpen(true)} className="btn-primary">Access Platform</button>
          <button className="btn-ghost" onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}>Explore Architecture</button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-3 md:gap-6"
        >
          {stats.map((s, i) => (
            <div
              key={s}
              className="glass px-4 py-2 rounded-lg font-mono text-xs md:text-sm text-[var(--cv-cyan)] tracking-wider"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {s}
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[var(--cv-muted)] font-mono text-xs tracking-widest"
      >
        SCROLL TO EXPLORE
      </motion.div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </section>
  );
}
