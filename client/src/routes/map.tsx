import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Empty, PanelHeader } from '../components/Parts';
import { CITY_COORDS, timeAgo } from '@/lib/chainverify';
import { WORLD_LAND_PATH } from '@/lib/world-land';
import { useChain, useProducts } from '@/lib/queries';

export const Route = createFileRoute('/map')({
  component: NetworkMap,
  head: () => ({ meta: [{ title: 'Network | ChainVerify' }] }),
});

// Equirectangular projection matching world-land.ts
const project = (city: string) => {
  const c = CITY_COORDS[city];
  return c ? { x: c.lon + 180, y: 90 - c.lat } : null;
};

// Crop to the latitudes that matter for the supported cities
const VIEW = { x: 20, y: 18, w: 340, h: 118 };

interface Leg {
  index: number;
  productId: string;
  from: string;
  to: string;
  stage: string;
  timestamp: string;
  flagged: boolean;
}

function NetworkMap() {
  const { data: chainRes } = useChain();
  const { data: products } = useProducts();
  const [focus, setFocus] = useState<string>('all');

  const { legs, cityCounts } = useMemo(() => {
    const lastStop: Record<string, string> = {};
    const legs: Leg[] = [];
    const cityCounts: Record<string, number> = {};
    for (const b of chainRes?.chain ?? []) {
      const { productId, location, stage, aiResult } = b.data ?? {};
      if (!productId || !location) continue;
      cityCounts[location] = (cityCounts[location] ?? 0) + 1;
      const prev = lastStop[productId];
      if (prev && prev !== location) {
        legs.push({
          index: b.index,
          productId,
          from: prev,
          to: location,
          stage: stage ?? '',
          timestamp: b.timestamp,
          flagged: (aiResult?.anomalies.length ?? 0) > 0,
        });
      }
      lastStop[productId] = location;
    }
    return { legs, cityCounts };
  }, [chainRes]);

  const shown = focus === 'all' ? legs : legs.filter((l) => l.productId === focus);
  const productIds = Object.keys(products ?? {});

  return (
    <DashboardLayout
      title="Network"
      description="Where each product has been scanned. Lines join consecutive scans of the same product; red lines are moves the AI flagged."
      actions={
        <select className="field w-56" value={focus} onChange={(e) => setFocus(e.target.value)} aria-label="Product">
          <option value="all">All products</option>
          {productIds.map((id) => (
            <option key={id} value={id}>
              {id}, {products?.[id]?.name}
            </option>
          ))}
        </select>
      }
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="panel self-start overflow-hidden xl:col-span-8">
          <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} className="block w-full bg-[#f8f8f5]" role="img" aria-label="World map of scan locations">
            <path d={WORLD_LAND_PATH} fill="#e3e3dc" stroke="#d2d2ca" strokeWidth="0.25" />

            {shown.map((l) => {
              const a = project(l.from);
              const b = project(l.to);
              if (!a || !b) return null;
              const dist = Math.hypot(b.x - a.x, b.y - a.y);
              const cx = (a.x + b.x) / 2;
              const cy = (a.y + b.y) / 2 - Math.min(dist * 0.25, 22);
              return (
                <path
                  key={l.index}
                  d={`M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`}
                  fill="none"
                  stroke={l.flagged ? 'var(--tl-bad)' : 'var(--tl-brand)'}
                  strokeWidth={l.flagged ? 1.6 : 1.1}
                  strokeOpacity={l.flagged ? 0.9 : 0.55}
                  strokeDasharray={l.flagged ? '3 2' : undefined}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}

            {Object.keys(CITY_COORDS).map((city) => {
              const p = project(city)!;
              const n = cityCounts[city] ?? 0;
              return (
                <g key={city}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={n ? 1.3 + Math.min(n, 8) * 0.18 : 0.9}
                    fill={n ? 'var(--tl-ink)' : '#b4b4ab'}
                    stroke="#fff"
                    strokeWidth="0.4"
                  >
                    <title>{`${city}: ${n} block${n === 1 ? '' : 's'}`}</title>
                  </circle>
                  {n > 0 && (
                    <text x={p.x + 2.6} y={p.y + 1.4} fontSize="4" fill="var(--tl-sub)" fontFamily="IBM Plex Sans, sans-serif">
                      {city}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-rule px-4 py-2.5 text-xs text-sub">
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-5 bg-brand opacity-60" /> Normal move
            </span>
            <span className="flex items-center gap-2">
              <span className="w-5 border-t-2 border-dashed border-bad" /> Flagged move
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-ink" /> City with scans (size = block count)
            </span>
          </div>
        </section>

        <section className="panel flex flex-col overflow-hidden xl:col-span-4 xl:max-h-[calc(100vh-190px)]">
          <PanelHeader title="Movements" meta={`${shown.length} total`} />
          <div className="flex-1 overflow-y-auto">
            {shown.length === 0 ? (
              <Empty>No movements recorded{focus === 'all' ? '' : ` for ${focus}`}.</Empty>
            ) : (
              [...shown].reverse().map((l) => (
                <div key={l.index} className="border-b border-rule px-4 py-3 last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <button onClick={() => setFocus(l.productId)} className="font-mono text-xs hover:text-brand hover:underline">
                      {l.productId}
                    </button>
                    <span className="text-xs text-faint">{timeAgo(l.timestamp)}</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm">
                    {l.from} <ArrowRight className="h-3.5 w-3.5 text-faint" /> {l.to}
                    <span className="text-sub">· {l.stage}</span>
                  </p>
                  {l.flagged && <span className="tag mt-1.5 bg-bad-soft text-bad">FLAGGED</span>}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
