import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Search, ArrowDown } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { BlockTag, Empty, PanelHeader, ScoreBar } from '../components/Parts';
import { anomalyDetail, formatTime, shortHash, timeAgo, type Block } from '@/lib/chainverify';
import { useChain, useProducts } from '@/lib/queries';

export const Route = createFileRoute('/explorer')({
  component: Explorer,
  head: () => ({ meta: [{ title: 'Ledger | ChainVerify' }] }),
});

function Explorer() {
  const { data: chainRes } = useChain();
  const { data: products } = useProducts();
  const [selected, setSelected] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const chain = chainRes?.chain ?? [];
  const invalid = chainRes?.invalidBlock ?? -1;
  const q = query.trim().toLowerCase();
  const rows = chain
    .filter(
      (b) =>
        !q ||
        b.hash.toLowerCase().includes(q) ||
        b.data.productId?.toLowerCase().includes(q) ||
        b.data.location?.toLowerCase().includes(q),
    )
    .reverse();
  const active = chain[selected ?? chain.length - 1];

  return (
    <DashboardLayout
      title="Ledger"
      description="Every block in the chain. Each block stores the hash of the one before it, so changing any block breaks every link after it."
      actions={
        chainRes &&
        (chainRes.isValid ? (
          <span className="tag h-7 bg-ok-soft px-2.5 text-ok">ALL {chain.length} HASHES VALID</span>
        ) : (
          <span className="tag h-7 bg-bad-soft px-2.5 text-bad">BROKEN AT BLOCK #{invalid}</span>
        ))
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="panel flex flex-col overflow-hidden lg:col-span-5 lg:h-[calc(100vh-190px)]">
          <div className="border-b border-rule p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input
                className="field pl-9"
                placeholder="Search by hash, product ID or city"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-[420px] flex-1 overflow-y-auto lg:max-h-none">
            {!chainRes ? (
              <Empty>Loading blocks…</Empty>
            ) : rows.length === 0 ? (
              <Empty>No blocks match “{query}”.</Empty>
            ) : (
              rows.map((b) => (
                <button
                  key={b.index}
                  onClick={() => setSelected(b.index)}
                  className={`flex w-full items-center gap-3 border-b border-rule px-4 py-3 text-left last:border-0 ${
                    active?.index === b.index ? 'bg-brand-soft' : 'hover:bg-paper'
                  }`}
                >
                  <span className="tabular w-9 font-mono text-xs text-sub">#{b.index}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <BlockTag block={b} invalid={b.index === invalid} />
                      {b.data.productId && <span className="font-mono text-xs">{b.data.productId}</span>}
                    </div>
                    <p className="hash mt-1 truncate text-faint">{shortHash(b.hash, 12)}</p>
                  </div>
                  <span className="shrink-0 text-xs text-faint">{timeAgo(b.timestamp)}</span>
                </button>
              ))
            )}
          </div>
        </section>

        <div className="lg:col-span-7">
          {active ? (
            <BlockDetail
              block={active}
              prev={chain[active.index - 1]}
              invalid={active.index === invalid}
              productName={active.data.productId ? products?.[active.data.productId]?.name : undefined}
            />
          ) : (
            <div className="panel">
              <Empty>Select a block to inspect it.</Empty>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function BlockDetail({ block, prev, invalid, productName }: { block: Block; prev?: Block; invalid: boolean; productName?: string }) {
  const d = block.data;
  const fields: [string, React.ReactNode][] = [
    ['Recorded', formatTime(block.timestamp)],
    ['Product', d.productId ? `${d.productId}${productName ? `, ${productName}` : ''}` : '–'],
    ['Location', d.location ?? '–'],
    ['Stage', d.stage ?? '–'],
  ];
  const payload = JSON.stringify(
    d,
    (key, value) => (key === 'image' && typeof value === 'string' ? `<image, ${Math.round(value.length / 1024)} KB>` : value),
    2,
  );

  return (
    <div className="space-y-6">
      <section className="panel">
        <PanelHeader title={`Block #${block.index}`}>
          <BlockTag block={block} invalid={invalid} />
        </PanelHeader>

        {invalid && (
          <p className="border-b border-rule bg-bad-soft px-4 py-3 text-sm text-bad">
            The data in this block was changed after it was written. Recomputing its hash no longer gives the stored value.
          </p>
        )}

        <dl className="grid grid-cols-2 gap-px bg-rule sm:grid-cols-4">
          {fields.map(([k, v]) => (
            <div key={k} className="bg-panel px-4 py-3">
              <dt className="text-xs text-faint">{k}</dt>
              <dd className="mt-0.5 text-sm">{v}</dd>
            </div>
          ))}
        </dl>

        {d.aiResult && (
          <div className="border-t border-rule px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-faint">AI trust score</span>
              <ScoreBar score={d.aiResult.trustScore} />
            </div>
            {d.aiResult.anomalies.map((a, i) => (
              <p key={i} className="mt-2 text-sm text-bad">
                {anomalyDetail(a)}
              </p>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <PanelHeader title="Hash link" />
        <div className="space-y-2 p-4">
          <HashRow label={prev ? `Block #${prev.index} hash` : 'Previous hash'} value={block.previousHash} />
          <div className="flex justify-center text-faint">
            <ArrowDown className="h-4 w-4" />
          </div>
          <HashRow label={`Block #${block.index} hash`} value={block.hash} strong bad={invalid} />
        </div>
      </section>

      <section className="panel overflow-hidden">
        <PanelHeader title="Raw data" meta="hashed together with index, timestamp and previous hash" />
        <pre className="max-h-80 overflow-auto bg-[#16181d] p-4 font-mono text-[12.5px] leading-relaxed text-[#d7dae0]">{payload}</pre>
      </section>
    </div>
  );
}

function HashRow({ label, value, strong, bad }: { label: string; value: string; strong?: boolean; bad?: boolean }) {
  return (
    <div className={`rounded-[4px] border px-3 py-2 ${bad ? 'border-[#e5b4b4] bg-bad-soft' : 'border-rule bg-paper'}`}>
      <p className="text-xs text-faint">{label}</p>
      <p className={`hash mt-0.5 break-all ${bad ? 'text-bad' : strong ? 'text-ink' : 'text-sub'}`}>{value}</p>
    </div>
  );
}
