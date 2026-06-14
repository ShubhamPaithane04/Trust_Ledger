import { motion } from "framer-motion";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative section-pad pt-24 border-t border-[var(--cv-border)]">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display font-black text-4xl md:text-6xl tracking-tight"
        >
          <span className="text-gradient-multi">ChainVerify</span>
        </motion.h2>
        <p className="mt-4 text-lg text-[var(--cv-muted)]">
          Protecting Supply Chains with AI + Blockchain
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://github.com/ShubhamPaithane04"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost inline-flex items-center gap-2 hover:text-[var(--cv-cyan)] hover:border-[var(--cv-cyan)] transition-colors"
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {["Built with React", "SHA-256 Secured", "3 AI Algorithms"].map((b) => (
            <span
              key={b}
              className="glass px-4 py-1.5 rounded-full font-mono text-xs tracking-wider text-[var(--cv-cyan)]"
            >
              {b}
            </span>
          ))}
        </div>

        <p className="mt-12 font-mono text-xs tracking-[0.3em] text-[var(--cv-muted)]">
          © 2025 CHAINVERIFY // PORTFOLIO PROJECT // ALL SYSTEMS NOMINAL
        </p>
      </div>
    </footer>
  );
}