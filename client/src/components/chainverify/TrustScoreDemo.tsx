import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const checks = [
  { name: "Geospatial Check", result: "PASS", penalty: 0, pass: true },
  { name: "Scan Frequency", result: "ANOMALY DETECTED", penalty: 40, pass: false },
  { name: "Supply Chain Order", result: "PASS", penalty: 0, pass: true },
];
const FINAL = 60;

function Gauge({ value, color }: { value: number; color: string }) {
  const r = 80;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 200 200" className="w-56 h-56">
      <circle cx="100" cy="100" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="14" fill="none" />
      <circle
        cx="100"
        cy="100"
        r={r}
        stroke={color}
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`}
        transform="rotate(-90 100 100)"
        style={{ filter: `drop-shadow(0 0 12px ${color})`, transition: "stroke-dasharray 1s ease" }}
      />
      <text x="100" y="98" textAnchor="middle" fontSize="56" fill="#fff" fontFamily="Exo 2" fontWeight="800">
        {Math.round(value)}
      </text>
      <text x="100" y="125" textAnchor="middle" fontSize="14" fill="#8693AB" fontFamily="Share Tech Mono">
        / 100
      </text>
    </svg>
  );
}

export function TrustScoreDemo() {
  const [step, setStep] = useState(-1);
  const [score, setScore] = useState(100);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (step >= checks.length) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => {
      const next = step + 1;
      if (next < checks.length) {
        setScore((s) => s - checks[next].penalty);
      }
      setStep(next);
    }, 900);
    return () => clearTimeout(t);
  }, [step, running]);

  const start = () => {
    setStep(-1);
    setScore(100);
    setRunning(true);
    setTimeout(() => setStep(0), 50);
  };

  const verdict =
    score >= 80 ? { label: "AUTHENTIC", color: "#00FF88" } : score >= 50 ? { label: "SUSPICIOUS", color: "#FFA63D" } : { label: "COUNTERFEIT", color: "#FF4455" };

  return (
    <section className="section-pad relative">
      <SectionHeading
        eyebrow="// TRUST SCORE ENGINE"
        title={<>Calculated in <span className="text-gradient-cyan">Real-Time</span></>}
        subtitle="Watch the AI engine deconstruct a single scan, check by check."
      />

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div className="glass rounded-2xl p-8 flex flex-col items-center">
          <Gauge value={step < 0 ? 100 : score} color={step < checks.length - 1 && running ? "#00D4FF" : verdict.color} />
          <div className="mt-4 text-center">
            <p className="font-mono text-xs tracking-[0.3em] text-[var(--cv-muted)]">VERDICT</p>
            <p className="font-display font-bold text-2xl mt-1" style={{ color: verdict.color }}>
              {step >= checks.length - 1 || !running ? (step < 0 ? "AWAITING SCAN" : verdict.label) : "ANALYZING..."}
            </p>
          </div>
          <button
            onClick={start}
            disabled={running}
            className="btn-primary mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {running ? "ANALYZING..." : step < 0 ? "▶ SIMULATE SCAN" : "↻ RUN AGAIN"}
          </button>
        </div>

        <div className="space-y-3">
          {checks.map((c, i) => (
            <AnimatePresence key={c.name} mode="wait">
              {step >= i && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass rounded-lg p-4 flex items-center gap-4"
                  style={{
                    borderColor: c.pass ? "rgba(0,255,136,0.3)" : "rgba(255,68,85,0.4)",
                    boxShadow: c.pass ? "0 0 16px rgba(0,255,136,0.15)" : "0 0 16px rgba(255,68,85,0.2)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: c.pass ? "rgba(0,255,136,0.15)" : "rgba(255,68,85,0.15)",
                      border: `1px solid ${c.pass ? "#00FF88" : "#FF4455"}`,
                    }}
                  >
                    {c.pass ? <Check className="w-5 h-5 text-[var(--cv-green)]" /> : <X className="w-5 h-5 text-[var(--cv-red)]" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{c.name}</p>
                    <p className="font-mono text-xs tracking-wider" style={{ color: c.pass ? "#00FF88" : "#FF4455" }}>
                      {c.result}
                    </p>
                  </div>
                  <span className="font-mono text-sm" style={{ color: c.pass ? "#8693AB" : "#FF4455" }}>
                    {c.penalty === 0 ? "+0" : `-${c.penalty}`} pts
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
          {step < 0 && (
            <div className="glass rounded-lg p-6 text-center text-[var(--cv-muted)] font-mono text-sm">
              Press SIMULATE SCAN to begin analysis
            </div>
          )}
        </div>
      </div>
    </section>
  );
}