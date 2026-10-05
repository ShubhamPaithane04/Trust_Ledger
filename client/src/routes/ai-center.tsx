import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Empty, PanelHeader, ScoreBar } from '../components/Parts';
import { RULES, anomalyDetail, formatTime, ruleFor } from '@/lib/chainverify';
import { useAlerts, useProducts } from '@/lib/queries';

export const Route = createFileRoute('/ai-center')({
  component: Alerts,
  head: () => ({ meta: [{ title: 'Alerts | ChainVerify' }] }),
});

function Alerts() {
  const { data: alerts } = useAlerts();
  const { data: products } = useProducts();
  const [rule, setRule] = useState<string>('all');

  const list = alerts ?? [];
  const countFor = (key: string) => list.filter((a) => a.anomalies.some((x) => x.startsWith(key))).length;
  const shown = rule === 'all' ? list : list.filter((a) => a.anomalies.some((x) => x.startsWith(rule)));

  return (
    <DashboardLayout
      title="Alerts"
      description="Scans the anomaly checks scored below 100. Anything under 70 is treated as a likely counterfeit."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="space-y-6 lg:col-span-4">
          <section className="panel">
            <PanelHeader title="Detection rules" />
            <div className="p-2">
              <RuleButton active={rule === 'all'} onClick={() => setRule('all')} name="All alerts" count={list.length} />
              {RULES.map((r) => (
                <RuleButton
                  key={r.key}
                  active={rule === r.key}
                  onClick={() => setRule(r.key)}
                  name={r.name}
                  detail={`${r.detail} Costs ${r.penalty} points.`}
                  count={countFor(r.key)}
                />
              ))}
            </div>
          </section>
        </aside>

        <section className="panel overflow-hidden lg:col-span-8">
          <PanelHeader title={rule === 'all' ? 'All alerts' : RULES.find((r) => r.key === rule)?.name ?? ''} meta={`${shown.length} shown`} />
          {!alerts ? (
            <Empty>Loading alerts…</Empty>
          ) : shown.length === 0 ? (
            <Empty>No alerts for this rule. Every matching scan passed.</Empty>
          ) : (
            <ul className="divide-y divide-rule">
              {shown.map((a) => (
                <li key={a.id} className="px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm">
                        <span className="font-mono text-xs">{a.productId}</span>
                        <span className="ml-2 font-medium">{products?.[a.productId]?.name}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-faint">
                        Scanned in {a.location} · {formatTime(a.timestamp)}
                      </p>
                    </div>
                    <ScoreBar score={a.trustScore} />
                  </div>
                  <ul className="mt-3 space-y-2">
                    {a.anomalies.map((x, i) => (
                      <li key={i} className="rounded-[4px] border-l-[3px] border-l-bad bg-bad-soft px-3 py-2">
                        <p className="text-xs font-semibold text-bad">{ruleFor(x)?.name ?? 'Anomaly'}</p>
                        <p className="mt-0.5 text-sm text-ink">{anomalyDetail(x)}</p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

function RuleButton({
  active,
  onClick,
  name,
  detail,
  count,
}: {
  active: boolean;
  onClick: () => void;
  name: string;
  detail?: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-[4px] px-3 py-2.5 text-left ${active ? 'bg-brand-soft' : 'hover:bg-paper'}`}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${active ? 'text-brand' : ''}`}>{name}</p>
        {detail && <p className="mt-0.5 text-xs leading-relaxed text-sub">{detail}</p>}
      </div>
      <span className={`tabular text-sm font-semibold ${count ? 'text-bad' : 'text-faint'}`}>{count}</span>
    </button>
  );
}
