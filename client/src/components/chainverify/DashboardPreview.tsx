import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "./SectionHeading";

function MiniGauge({ value }: { value: number }) {
  const angle = (value / 100) * 180 - 90;
  return (
    <svg viewBox="0 0 100 60" className="w-32">
      <path d="M 10 50 A 40 40 0 0 1 90 50" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
      <path
        d="M 10 50 A 40 40 0 0 1 90 50"
        stroke="url(#gg)"
        strokeWidth="6"
        fill="none"
        strokeDasharray={`${(value / 100) * 125} 200`}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="gg" x1="0" x2="1">
          <stop offset="0" stopColor="#00D4FF" />
          <stop offset="1" stopColor="#00FF88" />
        </linearGradient>
      </defs>
      <line
        x1="50"
        y1="50"
        x2={50 + 32 * Math.sin((angle * Math.PI) / 180)}
        y2={50 - 32 * Math.cos((angle * Math.PI) / 180)}
        stroke="#fff"
        strokeWidth="1.5"
      />
      <circle cx="50" cy="50" r="3" fill="#00D4FF" />
      <text x="50" y="48" fontSize="14" fill="#fff" textAnchor="middle" fontFamily="Share Tech Mono">
        {value}
      </text>
    </svg>
  );
}

export function DashboardPreview() {
  const [data, setData] = useState({
    products: 12847,
    scans: 3291,
    anomalies: 17,
    blocks: 84221,
    alerts: [
      { t: "Velocity violation · NKE-AM-001", c: "#FF4455" },
      { t: "Scan burst · APL-PR-883", c: "#FFA63D" },
      { t: "Order break · LVL-WT-244", c: "#FF4455" },
    ]
  });
  const [trustScore, setTrustScore] = useState(87);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chainRes, productsRes, alertsRes] = await Promise.all([
          fetch('/api/chain').then(res => res.json()),
          fetch('/api/products').then(res => res.json()),
          fetch('/api/alerts').then(res => res.json())
        ]);
        
        if (chainRes && productsRes && alertsRes) {
          const chain = chainRes.chain || [];
          const productsCount = Object.keys(productsRes).length;
          const scansCount = chain.filter((b: any) => b.data && b.data.type === 'SCAN').length;
          
          let sumTrust = 0;
          let count = 0;
          const mappedAlerts = alertsRes.slice(0, 3).map((a: any) => ({
             t: `${a.anomalies[0]} · ${a.productId}`,
             c: a.trustScore < 50 ? "#FF4455" : "#FFA63D"
          }));

          setData({
            products: productsCount,
            scans: scansCount,
            anomalies: alertsRes.length,
            blocks: chain.length,
            alerts: mappedAlerts.length > 0 ? mappedAlerts : [
              { t: "No recent anomalies", c: "#00FF88" }
            ]
          });
          
          // Basic trust score calculation
          setTrustScore(Math.max(0, 100 - (alertsRes.length * 5)));
        }
      } catch (err) {
        console.error("Failed to fetch dashboard preview data", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section-pad relative">
      <SectionHeading
        eyebrow="// LIVE DASHBOARD"
        title={<>Command Your <span className="text-gradient-cyan">Supply Chain</span></>}
        subtitle="Real-time visibility into every product, every scan, every anomaly."
      />

      <div className="max-w-6xl mx-auto" style={{ perspective: "2000px" }}>
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 15 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 8 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1 }}
          style={{ transformStyle: "preserve-3d" }}
          className="glass rounded-2xl overflow-hidden glow-cyan"
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--cv-border)] bg-black/40">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF4455]" />
              <span className="w-3 h-3 rounded-full bg-[#FFA63D]" />
              <span className="w-3 h-3 rounded-full bg-[#00FF88]" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-black/40 rounded px-3 py-1 font-mono text-xs text-[var(--cv-muted)] text-center">
                chainverify.io/dashboard
              </div>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-12 gap-4 bg-gradient-to-br from-[#1C1814] to-[#2A2018]">
            <div className="md:col-span-4 glass rounded-xl p-5 flex flex-col items-center">
              <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--cv-muted)]">TRUST SCORE</p>
              <MiniGauge value={trustScore} />
              <p className="text-xs font-mono" style={{ color: trustScore > 75 ? "var(--cv-green)" : trustScore > 50 ? "#FFA63D" : "#FF4455" }}>
                {trustScore > 75 ? "AUTHENTIC" : trustScore > 50 ? "WARNING" : "CRITICAL"}
              </p>
            </div>
            <div className="md:col-span-8 grid grid-cols-2 gap-3">
              {[
                { l: "Products", v: data.products, c: "#00D4FF" },
                { l: "Scans Today", v: data.scans, c: "#7C3AED" },
                { l: "Anomalies", v: data.anomalies, c: "#FF4455" },
                { l: "Blocks", v: data.blocks, c: "#00FF88" },
              ].map((m) => (
                <div key={m.l} className="glass rounded-lg p-3">
                  <p className="font-mono text-[10px] text-[var(--cv-muted)] tracking-widest">{m.l.toUpperCase()}</p>
                  <p className="font-mono text-2xl mt-1" style={{ color: m.c }}>{m.v}</p>
                </div>
              ))}
            </div>

            <div className="md:col-span-7 glass rounded-xl p-4">
              <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--cv-muted)] mb-3">PRODUCT TIMELINE</p>
              <div className="flex items-center gap-2">
                {["MFG", "WH", "SHIP", "STORE", "SCAN"].map((s, i) => (
                  <div key={s} className="flex-1 flex items-center gap-2">
                    <div
                      className="flex-1 h-1 rounded"
                      style={{
                        background: i < 4 ? "linear-gradient(90deg, #00D4FF, #7C3AED)" : "rgba(255,68,85,0.6)",
                      }}
                    />
                    <span className="font-mono text-[10px]" style={{ color: i === 4 ? "#FF4455" : "#00D4FF" }}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-end gap-1 h-16">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${30 + Math.sin(i * 0.7) * 25 + Math.random() * 20}%`,
                      background: i === 24 ? "#FF4455" : "linear-gradient(180deg, #00D4FF, #7C3AED)",
                      opacity: i === 24 ? 1 : 0.6,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="md:col-span-5 glass rounded-xl p-4">
              <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--cv-muted)] mb-3">ANOMALY ALERTS</p>
              <div className="space-y-2">
                {data.alerts.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 font-mono text-xs">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: a.c, boxShadow: `0 0 6px ${a.c}` }} />
                    <span className="text-[var(--cv-text)]/80">{a.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <p className="text-center mt-6 font-mono text-xs tracking-[0.25em] text-[var(--cv-muted)]">
          BUILT WITH REACT · NODE.JS · EXPRESS
        </p>
      </div>
    </section>
  );
}