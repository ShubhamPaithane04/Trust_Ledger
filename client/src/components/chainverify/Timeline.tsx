import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SectionHeading } from "./SectionHeading";

const steps = [
  { icon: "🏭", title: "Manufactured", loc: "Mumbai Factory", date: "Jan 15, 2025", status: "Verified", ok: true },
  { icon: "📦", title: "Warehoused", loc: "Dubai Hub", date: "Jan 22, 2025", status: "Verified", ok: true },
  { icon: "🚢", title: "Shipped", loc: "Rotterdam Port", date: "Feb 3, 2025", status: "Verified", ok: true },
  { icon: "🏪", title: "Retailer", loc: "London Store", date: "Feb 14, 2025", status: "Verified", ok: true },
  { icon: "📱", title: "Consumer Scan", loc: "New York", date: "Feb 14, 2025", status: "ANOMALY", ok: false, anomaly: "Scanned in London and NY within 4 minutes — physically impossible." },
];

export function Timeline() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const sectionRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const sectionScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  return (
    <section ref={containerRef} className="section-pad relative" style={{ perspective: "1500px" }}>
      <motion.div style={{ rotateX: sectionRotateX, scale: sectionScale }}>
        <SectionHeading
          eyebrow="// PRODUCT JOURNEY"
          title={<>One Product. <span className="text-gradient-cyan">Five Checkpoints.</span></>}
          subtitle="Nike Air Max · Serial NKE-AM-001 · Tracked end-to-end."
        />

        <div className="max-w-3xl mx-auto relative mt-16" style={{ perspective: "1000px" }}>
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--cv-cyan)] via-[var(--cv-purple)] to-[var(--cv-red)] opacity-40" />

          {steps.map((s, i) => {
            const cardX = useTransform(scrollYProgress, [0, 0.5, 1], [100 * (i % 2 === 0 ? 1 : -1), 0, -100 * (i % 2 === 0 ? 1 : -1)]);
            const cardZ = useTransform(scrollYProgress, [0, 0.5, 1], [-200 + (i * 40), 0, 200 - (i * 40)]);

            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{ x: cardX, z: cardZ }}
                className={`relative mb-10 md:flex md:items-center ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                <div className="md:w-1/2 md:px-8">
                  <div
                    className={`glass rounded-xl p-5 ml-16 md:ml-0 transition-transform hover:-translate-y-2 hover:shadow-2xl ${!s.ok ? "glow-red" : ""}`}
                    style={{
                      borderColor: s.ok ? undefined : "#FF4455",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-mono text-xs tracking-[0.2em] text-[var(--cv-muted)]">
                        STAGE 0{i + 1}
                      </p>
                      <span
                        className="font-mono text-xs px-2 py-0.5 rounded"
                        style={{
                          background: s.ok ? "rgba(0,255,136,0.12)" : "rgba(255,68,85,0.18)",
                          color: s.ok ? "#00FF88" : "#FF4455",
                          border: `1px solid ${s.ok ? "#00FF88" : "#FF4455"}`,
                        }}
                      >
                        {s.ok ? "✓ " : "⚠ "}{s.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">{s.title}</h3>
                    <p className="text-sm text-[var(--cv-muted)] mt-1">
                      {s.loc} · <span className="font-mono">{s.date}</span>
                    </p>
                    {s.anomaly && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="mt-3 text-sm text-[var(--cv-red)] font-mono"
                      >
                        {s.anomaly}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div
                  className="absolute left-6 md:left-1/2 top-6 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{
                    background: "var(--cv-bg)",
                    border: `2px solid ${s.ok ? "#00D4FF" : "#FF4455"}`,
                    boxShadow: `0 0 20px ${s.ok ? "#00D4FF" : "#FF4455"}88`,
                  }}
                >
                  {s.icon}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}