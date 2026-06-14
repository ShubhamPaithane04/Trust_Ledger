import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import { Factory, QrCode, Database, Brain, ScanLine, ShieldCheck, X } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const steps = [
  { icon: Factory, label: "Product Manufactured", color: "#00D4FF", detail: "Manufacturer registers the product in the system. A unique digital identity is created." },
  { icon: QrCode, label: "QR Code Minted", color: "#7C3AED", detail: "A cryptographic QR code is generated and physically applied to the product." },
  { icon: Database, label: "Blockchain Recorded", color: "#00FF88", detail: "Product genesis block is written to the immutable ledger with SHA-256 hash." },
  { icon: Brain, label: "AI Monitoring", color: "#00D4FF", detail: "Three AI algorithms continuously analyze every scan event in real time." },
  { icon: ScanLine, label: "Scan Detected", color: "#7C3AED", detail: "A consumer or partner scans the product. Geolocation and timestamp captured." },
  { icon: ShieldCheck, label: "Verified or Flagged", color: "#00FF88", detail: "AI returns a Trust Score. Anomalies trigger instant counterfeit alerts." },
];

export function Pipeline() {
  const [open, setOpen] = useState<number | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [-20, 0, 20]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="section-pad relative" style={{ perspective: 1500 }}>
      <motion.div style={{ scale, rotateX, opacity }}>
        <SectionHeading
          eyebrow="// HOW IT WORKS"
          title={<>The <span className="text-gradient-cyan">3D Verification</span> Pipeline</>}
          subtitle="From factory floor to consumer hand — every step cryptographically sealed."
        />

        <div className="max-w-7xl mx-auto mt-12">
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--cv-cyan)] to-transparent opacity-40 hidden md:block" />
            <div className="grid md:grid-cols-6 gap-6 relative perspective-[1000px]">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const cardY = useTransform(scrollYProgress, [0, 0.5, 1], [100 * (i%2 ? 1 : -1), 0, -100 * (i%2 ? 1 : -1)]);
                const cardZ = useTransform(scrollYProgress, [0, 0.5, 1], [-200 + (i*50), 0, 200 - (i*50)]);

                return (
                  <motion.button
                    key={s.label}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    style={{ y: cardY, z: cardZ }}
                    whileHover={{ scale: 1.05, z: 50 }}
                    onClick={() => setOpen(i)}
                    className="glass rounded-xl p-5 flex flex-col items-center text-center group cursor-pointer hover:border-[var(--cv-cyan)] transition-colors shadow-lg hover:shadow-2xl bg-white/40"
                  >
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${s.color}33, transparent 70%)`,
                        boxShadow: `0 0 30px -5px ${s.color}88`,
                      }}
                    >
                      <Icon className="w-8 h-8" style={{ color: s.color }} />
                    </div>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--cv-cyan)] mb-1 font-bold">
                      STEP 0{i + 1}
                    </p>
                    <p className="text-sm font-semibold leading-tight text-[var(--cv-text)]">{s.label}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1814]/40 backdrop-blur-sm"
            onClick={() => setOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass bg-white/90 rounded-2xl p-8 max-w-md w-full relative"
              style={{ boxShadow: `0 0 60px -10px ${steps[open].color}` }}
            >
              <button
                onClick={() => setOpen(null)}
                className="absolute top-4 right-4 text-[var(--cv-muted)] hover:text-[var(--cv-text)]"
              >
                <X className="w-5 h-5" />
              </button>
              <p className="font-mono text-xs tracking-[0.3em] mb-2 font-bold" style={{ color: steps[open].color }}>
                STEP 0{open + 1}
              </p>
              <h3 className="text-2xl font-bold mb-3 font-display tracking-tight text-[var(--cv-text)]">{steps[open].label}</h3>
              <p className="text-[var(--cv-muted)] leading-relaxed font-medium">{steps[open].detail}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}