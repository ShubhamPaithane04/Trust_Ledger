import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import { SectionHeading } from "./SectionHeading";

const techs = [
  { name: "React", reason: "Component-driven UI for the dashboard and consumer-facing scanner.", color: "#00D4FF" },
  { name: "Node.js", reason: "Event-loop runtime powering the verification API and AI orchestration.", color: "#00FF88" },
  { name: "Express", reason: "Minimal HTTP layer for the REST verification endpoints.", color: "#7C3AED" },
  { name: "SHA-256", reason: "Cryptographic backbone for every block hash on the chain.", color: "#00D4FF" },
  { name: "JavaScript", reason: "Unified language across frontend, backend, and chain logic.", color: "#FFA63D" },
  { name: "Geospatial AI", reason: "Detects physically impossible scan trajectories in real time.", color: "#FF4455" },
  { name: "REST API", reason: "Open contract so any retailer or partner can integrate.", color: "#7C3AED" },
  { name: "Vite", reason: "Lightning-fast build pipeline for an enterprise-grade developer loop.", color: "#00FF88" },
];

export function TechStack() {
  const [active, setActive] = useState<number | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const sectionRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [20, 0, -20]);
  const sectionScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.85]);

  // Hex grid layout: positions in a honeycomb. Front row larger.
  const positions = [
    { x: 0, y: 1, s: 1.05 },
    { x: 1, y: 0, s: 0.9 },
    { x: 1, y: 2, s: 0.9 },
    { x: 2, y: 1, s: 1.1 },
    { x: 3, y: 0, s: 0.9 },
    { x: 3, y: 2, s: 0.9 },
    { x: 4, y: 1, s: 1.05 },
    { x: 5, y: 0, s: 0.85 },
  ];

  return (
    <section ref={containerRef} className="section-pad relative" style={{ perspective: "2000px" }}>
      <motion.div style={{ rotateX: sectionRotateX, scale: sectionScale }}>
        <SectionHeading
          eyebrow="// TECH STACK"
          title={<>Enterprise-Grade <span className="text-gradient-cyan">Technology</span></>}
          subtitle="Every layer chosen for performance, security, and scale."
        />

        <div className="max-w-6xl mx-auto mt-12">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6" style={{ perspective: "1500px", transformStyle: "preserve-3d" }}>
            {techs.map((t, i) => {
              const p = positions[i];
              const cardY = useTransform(scrollYProgress, [0, 0.5, 1], [100 * (i % 2 === 0 ? 1 : -1), 0, -100 * (i % 2 === 0 ? 1 : -1)]);
              const cardZ = useTransform(scrollYProgress, [0, 0.5, 1], [-300 + (p.s * 100), 0, 300 - (p.s * 100)]);

              return (
                <motion.button
                  key={t.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -6, scale: 1.1, z: 50 }}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  className="relative group"
                  style={{
                    width: `${110 * p.s}px`,
                    height: `${125 * p.s}px`,
                    marginTop: p.y === 1 ? `${p.x % 2 === 0 ? 0 : 30}px` : 0,
                    y: cardY,
                    z: cardZ,
                  }}
                >
                  <div
                    className="hex w-full h-full flex flex-col items-center justify-center transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${t.color}33, rgba(255,255,255,0.04))`,
                      border: `1px solid ${t.color}55`,
                      boxShadow: active === i ? `0 0 40px ${t.color}88` : `0 0 16px ${t.color}33`,
                    }}
                  >
                    <span
                      className="font-display font-bold text-sm md:text-base"
                      style={{ color: t.color }}
                    >
                      {t.name}
                    </span>
                    <span className="font-mono text-[9px] tracking-widest text-[var(--cv-muted)] mt-1">
                      LAYER {i + 1}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-5 mt-16 max-w-2xl mx-auto text-center min-h-[88px] flex items-center justify-center border-t border-[var(--cv-border)] bg-black/20 backdrop-blur-md"
          >
            {active !== null ? (
              <p className="text-[var(--cv-text)] font-medium">
                <span className="font-display font-bold text-lg" style={{ color: techs[active].color }}>
                  {techs[active].name}
                </span>
                <span className="text-[var(--cv-muted)] ml-2">— {techs[active].reason}</span>
              </p>
            ) : (
              <p className="text-[var(--cv-cyan)] font-mono text-sm tracking-[0.3em] font-bold animate-pulse">
                HOVER A HEX TO INSPECT
              </p>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}