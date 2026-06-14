import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useRef } from "react";
import { Activity, Globe, Link2Off } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

function TiltCard({ children, accent }: { children: React.ReactNode; accent: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-50, 50], [8, -8]), { stiffness: 200, damping: 20 });
  const rotY = useSpring(useTransform(x, [-50, 50], [-8, 8]), { stiffness: 200, damping: 20 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={(event) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set(event.clientX - rect.left - rect.width / 2);
        y.set(event.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
      className="glass rounded-2xl p-7 relative overflow-hidden group"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${accent}22, transparent 70%)` }}
      />
      {children}
    </motion.div>
  );
}

function WorldMapViz() {
  return (
    <svg viewBox="0 0 200 100" className="w-full h-32">
      <defs>
        <radialGradient id="dotR">
          <stop offset="0%" stopColor="#FF4455" />
          <stop offset="100%" stopColor="#FF4455" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="55" rx="85" ry="35" fill="none" stroke="rgba(0,212,255,0.2)" />
      <path d="M 20 40 Q 60 20, 100 45 T 180 35" stroke="rgba(0,212,255,0.3)" fill="none" strokeDasharray="2 2" />
      <line x1="60" y1="50" x2="150" y2="35" stroke="#FF4455" strokeWidth="0.8" strokeDasharray="4 2">
        <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1.5s" repeatCount="indefinite" />
      </line>
      <circle cx="60" cy="50" r="6" fill="url(#dotR)" />
      <circle cx="60" cy="50" r="2.5" fill="#FF4455">
        <animate attributeName="r" values="2.5;4;2.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="150" cy="35" r="6" fill="url(#dotR)" />
      <circle cx="150" cy="35" r="2.5" fill="#FF4455">
        <animate attributeName="r" values="2.5;4;2.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <text x="60" y="65" fontSize="6" fill="#8693AB" textAnchor="middle">MUMBAI 09:00</text>
      <text x="150" y="28" fontSize="6" fill="#8693AB" textAnchor="middle">LONDON 09:05</text>
    </svg>
  );
}

function BarSpike() {
  const bars = [3, 5, 4, 6, 8, 12, 18, 28, 42, 48];

  return (
    <div className="flex items-end gap-1.5 h-32 px-2">
      {bars.map((bar, index) => (
        <motion.div
          key={index}
          initial={{ height: 0 }}
          whileInView={{ height: `${(bar / 50) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.07 }}
          className="flex-1 rounded-t"
          style={{
            background:
              bar > 30
                ? "linear-gradient(180deg, #FF4455, #7C3AED)"
                : "linear-gradient(180deg, #00D4FF, #7C3AED)",
            boxShadow: bar > 30 ? "0 0 12px rgba(255,68,85,0.6)" : "none",
          }}
        />
      ))}
    </div>
  );
}

function ChainBreak() {
  return (
    <div className="flex items-center justify-between gap-2 h-32 px-2">
      {["WH", "TR", "??", "RT", "CN"].map((stage, index) => (
        <div key={index} className="flex flex-col items-center gap-1 flex-1">
          <div
            className={`w-full h-12 rounded flex items-center justify-center font-mono text-xs ${
              index === 2 ? "text-[var(--cv-red)]" : "text-[var(--cv-cyan)]"
            }`}
            style={{
              background: index === 2 ? "rgba(255,68,85,0.15)" : "rgba(0,212,255,0.1)",
              border: `1px solid ${index === 2 ? "#FF4455" : "rgba(0,212,255,0.3)"}`,
              boxShadow: index === 2 ? "0 0 16px rgba(255,68,85,0.5)" : "none",
            }}
          >
            {stage}
          </div>
          {index < 4 && (
            <span className="text-[10px] font-mono" style={{ color: index === 1 || index === 2 ? "#FF4455" : "#8693AB" }}>
              {index === 1 || index === 2 ? "x" : "->"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

const cards = [
  {
    icon: Globe,
    title: "Geospatial Velocity Detection",
    desc: "If a product is scanned in Mumbai at 9:00 AM and London at 9:05 AM, that is physically impossible. Flagged as a counterfeit clone instantly.",
    accent: "#00D4FF",
    viz: <WorldMapViz />,
  },
  {
    icon: Activity,
    title: "Scan Frequency Anomaly",
    desc: "A genuine product is scanned a handful of times. 50 scans in 60 minutes means a clone farm is operating.",
    accent: "#7C3AED",
    viz: <BarSpike />,
  },
  {
    icon: Link2Off,
    title: "Supply Chain Order Violation",
    desc: "A product cannot reach a retailer before leaving the warehouse. Impossible sequences mean the supply chain was tampered with.",
    accent: "#00FF88",
    viz: <ChainBreak />,
  },
];

function AlgorithmCard({
  card,
  index,
  scrollYProgress,
}: {
  card: (typeof cards)[number];
  index: number;
  scrollYProgress: MotionValue<number>;
}) {
  const Icon = card.icon;
  const cardY = useTransform(scrollYProgress, [0, 0.5, 1], [150 * (index + 1), 0, -150 * (index + 1)]);
  const cardZ = useTransform(scrollYProgress, [0, 0.5, 1], [-100 * (index + 1), 0, 100 * (index + 1)]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      style={{ y: cardY, z: cardZ }}
    >
      <TiltCard accent={card.accent}>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: `${card.accent}22`,
              border: `1px solid ${card.accent}55`,
              boxShadow: `0 0 24px -4px ${card.accent}88`,
            }}
          >
            <Icon className="w-6 h-6" style={{ color: card.accent }} />
          </div>
          <span className="font-mono text-[10px] tracking-[0.25em] text-[var(--cv-muted)]">ALGO 0{index + 1}</span>
        </div>
        <h3 className="text-xl font-bold mb-3 leading-tight">{card.title}</h3>
        <p className="text-sm text-[var(--cv-muted)] leading-relaxed mb-5">{card.desc}</p>
        <div className="glass rounded-lg p-3 -mx-1">{card.viz}</div>
      </TiltCard>
    </motion.div>
  );
}

export function AIEngine() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const sectionScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);
  const sectionRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);

  return (
    <section ref={containerRef} className="section-pad relative" style={{ perspective: "2000px" }}>
      <motion.div style={{ scale: sectionScale, rotateX: sectionRotateX }}>
        <SectionHeading
          eyebrow="// AI ENGINE"
          title={<>3 Algorithms. <span className="text-gradient-cyan">Zero Fakes.</span></>}
          subtitle="Multi-layered intelligence that catches what others miss."
        />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6 mt-12" style={{ perspective: "1200px" }}>
          {cards.map((card, index) => (
            <AlgorithmCard key={card.title} card={card} index={index} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
