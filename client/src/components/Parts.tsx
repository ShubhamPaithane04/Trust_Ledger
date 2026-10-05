import React from 'react';
import type { Block } from '@/lib/chainverify';

export function PanelHeader({ title, meta, children }: { title: string; meta?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 border-b border-rule px-4 py-2.5">
      <div className="flex items-baseline gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        {meta && <span className="text-xs text-faint">{meta}</span>}
      </div>
      {children}
    </div>
  );
}

export function Stat({ label, value, note, tone }: { label: string; value: React.ReactNode; note?: string; tone?: 'bad' | 'ok' }) {
  const color = tone === 'bad' ? 'text-bad' : tone === 'ok' ? 'text-ok' : 'text-ink';
  return (
    <div className="panel px-4 py-3.5">
      <p className="text-xs font-medium text-sub">{label}</p>
      <p className={`tabular mt-1 text-[26px] font-semibold leading-tight tracking-tight ${color}`}>{value}</p>
      {note && <p className="mt-0.5 text-xs text-faint">{note}</p>}
    </div>
  );
}

export function BlockTag({ block, invalid }: { block: Block; invalid?: boolean }) {
  if (invalid) return <span className="tag bg-bad-soft text-bad">TAMPERED</span>;
  if (block.index === 0) return <span className="tag bg-sunken text-sub">GENESIS</span>;
  if (block.data.type === 'MINT') return <span className="tag bg-brand-soft text-brand">MINT</span>;
  const flagged = (block.data.aiResult?.anomalies.length ?? 0) > 0;
  return flagged ? <span className="tag bg-bad-soft text-bad">SCAN · FLAGGED</span> : <span className="tag bg-ok-soft text-ok">SCAN</span>;
}

export function ScoreBar({ score }: { score: number }) {
  const tone = score >= 70 ? 'bg-ok' : score >= 40 ? 'bg-warn' : 'bg-bad';
  const text = score >= 70 ? 'text-ok' : score >= 40 ? 'text-warn' : 'text-bad';
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-16 overflow-hidden rounded-[2px] bg-sunken">
        <span className={`block h-full ${tone}`} style={{ width: `${score}%` }} />
      </span>
      <span className={`tabular text-xs font-semibold ${text}`}>{score}</span>
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-12 text-center text-sm text-faint">{children}</div>;
}
