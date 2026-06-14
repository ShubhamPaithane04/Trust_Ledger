import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

function Counter({ target, prefix = "$", suffix = "T" }: { target: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const duration = 2200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {val.toFixed(1)}
      {suffix}
    </span>
  );
}

const pains = [
  { title: "Fake medicines kill 1M+ people annually", tag: "PHARMA" },
  { title: "1 in 5 electronics are counterfeit", tag: "ELECTRONICS" },
  { title: "Luxury brands lose $30B yearly", tag: "LUXURY" },
];

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // 3D parallax values
  const y = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="section-pad relative" style={{ perspective: 1200 }}>
      <motion.div 
        style={{ y, rotateX, scale, opacity }}
        className="max-w-7xl mx-auto"
      >
        <SectionHeading
          eyebrow="// THE PROBLEM"
          title={<>A <span className="text-gradient-cyan">Global Crisis</span> in Trust</>}
        />
        <div className="grid lg:grid-cols-2 gap-12 items-center mt-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-left"
          >
            <p className="font-mono text-xs tracking-[0.3em] text-[var(--cv-red)] mb-4">
              ANNUAL LOSS TO COUNTERFEITS
            </p>
            <div className="font-display font-black text-7xl md:text-8xl lg:text-9xl leading-none">
              <span className="text-gradient-multi">
                <Counter target={4.5} />
              </span>
            </div>
            <p className="mt-4 text-2xl text-[var(--cv-text)] font-light">
              Trillion dollars
            </p>
            <p className="mt-2 text-[var(--cv-muted)] max-w-md mx-auto lg:mx-0">
              Counterfeit products bleed the global economy every single year — and the human cost is even greater.
            </p>
          </motion.div>

          <div className="space-y-4 perspective-[1000px]">
            {pains.map((p, i) => {
              const cardZ = useTransform(scrollYProgress, [0, 0.5, 1], [-100 * (i+1), 0, 100 * (i+1)]);
              
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  style={{ z: cardZ }}
                  className="glass rounded-xl p-6 flex items-start gap-4 hover:border-[var(--cv-red)] transition-all hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center glow-red bg-[rgba(255,68,85,0.1)]">
                    <AlertTriangle className="w-6 h-6 text-[var(--cv-red)]" />
                  </div>
                  <div>
                    <p className="font-mono text-xs tracking-[0.2em] text-[var(--cv-red)] mb-1">
                      {p.tag}
                    </p>
                    <p className="text-lg font-medium text-[var(--cv-text)]">{p.title}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}