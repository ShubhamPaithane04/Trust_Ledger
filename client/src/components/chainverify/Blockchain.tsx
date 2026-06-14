import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useRef, useState } from "react";
import { AlertOctagon } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const blocks = [
  { n: 1, pid: "NKE-AM-001", hash: "a3f9e2c1...", ts: "2025-01-15 09:24:11", prev: "0000000000" },
  { n: 2, pid: "NKE-AM-001", hash: "b8d7c4f2...", ts: "2025-01-22 14:08:33", prev: "a3f9e2c1" },
  { n: 3, pid: "NKE-AM-001", hash: "c2e5a9b7...", ts: "2025-02-03 11:42:07", prev: "b8d7c4f2" },
  { n: 4, pid: "NKE-AM-001", hash: "d6f1c8a3...", ts: "2025-02-14 18:31:55", prev: "c2e5a9b7" },
  { n: 5, pid: "NKE-AM-001", hash: "e9b4d7f5...", ts: "2025-02-14 19:02:18", prev: "d6f1c8a3" },
];

function BlockCard({
  block,
  index,
  isCompromised,
  isBroken,
  scrollYProgress,
}: {
  block: (typeof blocks)[number];
  index: number;
  isCompromised: boolean;
  isBroken: boolean;
  scrollYProgress: MotionValue<number>;
}) {
  const cardY = useTransform(scrollYProgress, [0, 0.5, 1], [50 * (index % 2 === 0 ? 1 : -1), 0, -50 * (index % 2 === 0 ? 1 : -1)]);
  const cardZ = useTransform(scrollYProgress, [0, 0.5, 1], [-200 + index * 40, 0, 200 - index * 40]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateY: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{
        y: cardY,
        z: cardZ,
        borderColor: isCompromised ? "#FF4455" : isBroken ? "rgba(255,68,85,0.3)" : undefined,
        boxShadow: isCompromised ? "0 0 40px rgba(255,68,85,0.7)" : undefined,
        transformStyle: "preserve-3d",
      }}
      animate={
        isCompromised
          ? { rotateZ: [-1, 1, -1, 1, 0], scale: 1.05 }
          : isBroken
          ? { opacity: 0.45, rotateZ: 4, y: 12 }
          : {}
      }
      className="glass rounded-xl p-5 w-[200px] relative transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs tracking-[0.2em]" style={{ color: isCompromised ? "#FF4455" : "#00D4FF" }}>
          BLOCK #{block.n}
        </span>
        <span
          className="w-2 h-2 rounded-full"
          style={{
            background: isCompromised ? "#FF4455" : "#00FF88",
            boxShadow: `0 0 8px ${isCompromised ? "#FF4455" : "#00FF88"}`,
          }}
        />
      </div>
      <div className="space-y-2 font-mono text-[11px]">
        <div>
          <p className="text-[var(--cv-muted)]">PRODUCT</p>
          <p className="text-[var(--cv-text)]">{block.pid}</p>
        </div>
        <div>
          <p className="text-[var(--cv-muted)]">SHA-256</p>
          <p className={isCompromised ? "text-[var(--cv-red)]" : "text-[var(--cv-cyan)]"}>{block.hash}</p>
        </div>
        <div>
          <p className="text-[var(--cv-muted)]">TIMESTAMP</p>
          <p className="text-[var(--cv-text)] text-[10px]">{block.ts}</p>
        </div>
        <div>
          <p className="text-[var(--cv-muted)]">PREV HASH</p>
          <p className="text-[var(--cv-muted)]">{block.prev}</p>
        </div>
      </div>
      {index < blocks.length - 1 && (
        <div
          className="hidden md:block absolute top-1/2 -right-4 w-4 h-px"
          style={{
            background: isBroken || isCompromised ? "#FF4455" : "#00D4FF",
            boxShadow: `0 0 8px ${isBroken || isCompromised ? "#FF4455" : "#00D4FF"}`,
          }}
        />
      )}
    </motion.div>
  );
}

export function Blockchain() {
  const [tampered, setTampered] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const sectionScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.85]);
  const sectionRotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-15, 0, 15]);

  return (
    <section ref={containerRef} className="section-pad relative" style={{ perspective: "2000px" }}>
      <motion.div style={{ scale: sectionScale, rotateY: sectionRotateY }}>
        <SectionHeading
          eyebrow="// BLOCKCHAIN CORE"
          title={<>Immutable. Cryptographic. <span className="text-gradient-cyan">Tamper-Proof.</span></>}
          subtitle="Every product movement creates a new block. Alter one byte - the entire chain collapses."
        />

        <div className="max-w-7xl mx-auto mt-12">
          <div className="flex flex-wrap items-stretch justify-center gap-4 mb-10" style={{ perspective: "1200px" }}>
            {blocks.map((block, index) => {
              const isCompromised = tampered && index === 2;
              const isBroken = tampered && index > 2;

              return (
                <BlockCard
                  key={block.n}
                  block={block}
                  index={index}
                  isCompromised={isCompromised}
                  isBroken={isBroken}
                  scrollYProgress={scrollYProgress}
                />
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setTampered((t) => !t)}
              className="font-mono text-sm tracking-[0.2em] px-6 py-3 rounded-lg transition-all"
              style={{
                background: tampered ? "rgba(255,68,85,0.15)" : "rgba(255,68,85,0.08)",
                border: "1px solid #FF4455",
                color: "#FF4455",
                boxShadow: tampered ? "0 0 30px rgba(255,68,85,0.5)" : "0 0 15px rgba(255,68,85,0.25)",
              }}
            >
              {tampered ? "RESET CHAIN" : "SIMULATE TAMPER"}
            </button>

            <AnimatePresence>
              {tampered && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass px-5 py-3 rounded-lg flex items-center gap-3"
                  style={{ borderColor: "#FF4455", boxShadow: "0 0 24px rgba(255,68,85,0.4)" }}
                >
                  <AlertOctagon className="w-5 h-5 text-[var(--cv-red)]" />
                  <span className="font-mono text-sm text-[var(--cv-red)] tracking-wider">
                    CHAIN INTEGRITY VIOLATED - BLOCK #3 COMPROMISED
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
