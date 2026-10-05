import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Check, CircleAlert, X } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PanelHeader } from '../components/Parts';
import {
  LOCATIONS,
  RULES,
  STAGES,
  anomalyDetail,
  formatTime,
  readJson,
  ruleFor,
  shortHash,
  type AIResult,
  type ProductHistory,
} from '@/lib/chainverify';
import { useProducts, useRefreshLedger } from '@/lib/queries';

export const Route = createFileRoute('/scanner')({
  component: VerifyProduct,
  head: () => ({ meta: [{ title: 'Verify product | ChainVerify' }] }),
});

type Outcome =
  | { kind: 'scanned'; result: AIResult; block: { index: number; hash: string }; history: ProductHistory | null }
  | { kind: 'missing'; productId: string }
  | { kind: 'error'; message: string };

function VerifyProduct() {
  const { data: products } = useProducts();
  const refresh = useRefreshLedger();
  const [form, setForm] = useState({ productId: 'PRD-101', location: 'Tokyo', stage: 'Consumer' });
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const scan = async (e: React.FormEvent) => {
    e.preventDefault();
    const productId = form.productId.trim().toUpperCase();
    if (!productId) return;
    setBusy(true);
    setOutcome(null);
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, productId }),
      });
      if (response.status === 404) {
        setOutcome({ kind: 'missing', productId });
        return;
      }
      const res = await readJson<{ result: AIResult; block: { index: number; hash: string } }>(response);
      const history = await fetch(`/api/products/${encodeURIComponent(productId)}/history`)
        .then((r) => readJson<ProductHistory>(r))
        .catch(() => null);
      setOutcome({ kind: 'scanned', result: res.result, block: res.block, history });
      refresh();
    } catch (err) {
      setOutcome({ kind: 'error', message: err instanceof Error ? err.message : 'Scan failed' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout
      title="Verify a product"
      description="Record a scan the way a customer or retailer would. The scan is written to the ledger and checked against the product's full history."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="panel self-start lg:col-span-4">
          <PanelHeader title="Scan details" />
          <form onSubmit={scan} className="space-y-4 p-4">
            <div>
              <label className="label" htmlFor="sid">
                Product ID
              </label>
              <input
                id="sid"
                list="product-ids"
                className="field font-mono"
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                disabled={busy}
              />
              <datalist id="product-ids">
                {Object.entries(products ?? {}).map(([id, p]) => (
                  <option key={id} value={id}>
                    {p.name}
                  </option>
                ))}
              </datalist>
              {products?.[form.productId.trim().toUpperCase()] && (
                <p className="mt-1.5 text-xs text-sub">{products[form.productId.trim().toUpperCase()].name}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="sloc">
                  Location
                </label>
                <select
                  id="sloc"
                  className="field"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  disabled={busy}
                >
                  {LOCATIONS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="sstage">
                  Stage
                </label>
                <select
                  id="sstage"
                  className="field"
                  value={form.stage}
                  onChange={(e) => setForm({ ...form, stage: e.target.value })}
                  disabled={busy}
                >
                  {STAGES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" disabled={busy || !form.productId.trim()} className="btn btn-solid w-full">
              {busy ? 'Checking…' : 'Scan and verify'}
            </button>
            <p className="text-xs leading-relaxed text-faint">
              Tip: scan PRD-101 in Sydney right after scanning it in London to trigger the impossible travel check.
            </p>
          </form>
        </section>

        <div className="lg:col-span-8">
          {!outcome && !busy && <Placeholder />}
          {busy && <div className="panel px-4 py-16 text-center text-sm text-sub">Writing scan and running checks…</div>}
          {outcome?.kind === 'error' && (
            <div className="panel border-l-[3px] border-l-bad p-4 text-sm text-bad">{outcome.message}</div>
          )}
          {outcome?.kind === 'missing' && <Missing productId={outcome.productId} />}
          {outcome?.kind === 'scanned' && <Result outcome={outcome} />}
        </div>
      </div>
    </DashboardLayout>
  );
}

function Placeholder() {
  return (
    <section className="panel">
      <PanelHeader title="What gets checked" />
      <ul className="divide-y divide-rule">
        <li className="flex gap-4 px-4 py-3.5">
          <span className="w-12 shrink-0 text-xs font-semibold text-faint">LEDGER</span>
          <div>
            <p className="text-sm font-medium">Registered product</p>
            <p className="text-sm text-sub">The ID must have been minted by a manufacturer. Unknown IDs are rejected.</p>
          </div>
        </li>
        {RULES.map((r) => (
          <li key={r.key} className="flex gap-4 px-4 py-3.5">
            <span className="tabular w-12 shrink-0 text-xs font-semibold text-faint">−{r.penalty}</span>
            <div>
              <p className="text-sm font-medium">{r.name}</p>
              <p className="text-sm text-sub">{r.detail}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="border-t border-rule px-4 py-3 text-xs text-sub">
        Every scan starts at 100. A product scoring 70 or more is reported as authentic.
      </p>
    </section>
  );
}

function Missing({ productId }: { productId: string }) {
  return (
    <section className="panel overflow-hidden">
      <div className="flex items-start gap-3 border-b border-rule bg-bad-soft px-5 py-4">
        <X className="mt-0.5 h-5 w-5 text-bad" />
        <div>
          <p className="font-semibold text-bad">Not found on the ledger</p>
          <p className="text-sm text-sub">
            <span className="font-mono">{productId}</span> was never registered by a manufacturer. Treat it as counterfeit.
          </p>
        </div>
      </div>
      <p className="px-5 py-4 text-sm text-sub">No block was written for this scan.</p>
    </section>
  );
}

function Result({ outcome }: { outcome: Extract<Outcome, { kind: 'scanned' }> }) {
  const { result, block, history } = outcome;
  const ok = result.isAuthentic;
  const failed = new Set(result.anomalies.map((a) => ruleFor(a)?.key));

  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden">
        <div className={`flex flex-wrap items-center justify-between gap-4 px-5 py-4 ${ok ? 'bg-ok-soft' : 'bg-bad-soft'}`}>
          <div className="flex items-start gap-3">
            {ok ? <Check className="mt-0.5 h-5 w-5 text-ok" /> : <CircleAlert className="mt-0.5 h-5 w-5 text-bad" />}
            <div>
              <p className={`font-semibold ${ok ? 'text-ok' : 'text-bad'}`}>
                {ok ? 'Authentic' : 'Do not trust this product'}
              </p>
              <p className="text-sm text-sub">
                {history?.name ?? history?.productId}, recorded in block #{block.index}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-sub">Trust score</p>
            <p className={`tabular text-[28px] font-semibold leading-none ${ok ? 'text-ok' : 'text-bad'}`}>
              {result.trustScore}
              <span className="text-sm font-normal text-faint"> / 100</span>
            </p>
          </div>
        </div>

        <ul className="divide-y divide-rule">
          {RULES.map((r) => {
            const hit = result.anomalies.filter((a) => a.startsWith(r.key));
            return (
              <li key={r.key} className="flex gap-3 px-5 py-3">
                {failed.has(r.key) ? (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
                ) : (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{r.name}</p>
                  {hit.length > 0 ? (
                    hit.map((a, i) => (
                      <p key={i} className="text-sm text-bad">
                        {anomalyDetail(a)}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-faint">Passed</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between gap-3 border-t border-rule px-5 py-2.5 text-xs text-faint">
          <span>Block hash</span>
          <span className="hash truncate">{shortHash(block.hash, 16)}</span>
        </div>
      </section>

      {history && (
        <section className="panel">
          <PanelHeader title="Chain of custody" meta={`${history.events.length} events`} />
          <ol className="px-5 py-4">
            {history.events.map((ev, i) => {
              const flagged = (ev.aiResult?.anomalies.length ?? 0) > 0;
              const last = i === history.events.length - 1;
              return (
                <li key={ev.index} className="relative flex gap-4 pb-5 last:pb-0">
                  {!last && <span className="absolute left-[5px] top-4 h-full w-px bg-rule" />}
                  <span
                    className={`relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 bg-panel ${
                      flagged ? 'border-bad' : ev.type === 'MINT' ? 'border-brand' : 'border-ok'
                    }`}
                  />
                  <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4">
                    <p className="text-sm">
                      <span className="font-medium">{ev.stage}</span>
                      <span className="text-sub"> in {ev.location}</span>
                      {flagged && <span className="tag ml-2 bg-bad-soft text-bad">FLAGGED</span>}
                    </p>
                    <p className="text-xs text-faint">
                      {formatTime(ev.timestamp)} · block #{ev.index}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}
