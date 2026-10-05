import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { ImagePlus, RotateCcw, ShieldX, X } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { BlockTag, Empty, PanelHeader, ScoreBar, Stat } from '../components/Parts';
import { LOCATIONS, readJson, shortHash, timeAgo, type Block } from '@/lib/chainverify';
import { useAlerts, useChain, useProducts, useRefreshLedger } from '@/lib/queries';

export const Route = createFileRoute('/dashboard')({
  component: Overview,
  head: () => ({ meta: [{ title: 'Overview | ChainVerify' }] }),
});

const EMPTY_FORM = { productId: '', name: '', location: 'Tokyo', stage: 'Factory', image: '' };

function Overview() {
  const { data: chainRes } = useChain();
  const { data: products } = useProducts();
  const { data: alerts } = useAlerts();
  const refresh = useRefreshLedger();

  const chain = chainRes?.chain ?? [];
  const isValid = chainRes?.isValid ?? true;
  const scans = chain.filter((b) => b.data?.type === 'SCAN').length;

  // Latest known position and flag state of every product, rebuilt from the chain
  const inventory = useMemo(() => {
    const rows: Record<string, { last: Block; scans: number; flagged: number }> = {};
    for (const block of chain) {
      const id = block.data?.productId;
      if (!id) continue;
      const row = (rows[id] ??= { last: block, scans: 0, flagged: 0 });
      row.last = block;
      if (block.data.type === 'SCAN') row.scans += 1;
      if ((block.data.aiResult?.anomalies.length ?? 0) > 0) row.flagged += 1;
    }
    return Object.entries(rows).sort((a, b) => b[1].last.index - a[1].last.index);
  }, [chain]);

  const post = async (url: string) => {
    await fetch(url, { method: 'POST' }).catch(console.error);
    refresh();
  };

  return (
    <DashboardLayout
      title="Overview"
      description="Register new products, watch scans land on the ledger, and test that tampering is caught."
      actions={
        <Link to="/scanner" className="btn btn-line">
          Verify a product
        </Link>
      }
    >
      {!isValid && (
        <div className="mb-6 flex flex-col gap-3 rounded-[6px] border border-[#e5b4b4] bg-bad-soft p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <ShieldX className="mt-0.5 h-5 w-5 shrink-0 text-bad" />
            <div>
              <p className="text-sm font-semibold text-bad">Ledger integrity check failed</p>
              <p className="text-sm text-sub">
                Block #{chainRes?.invalidBlock} no longer matches its stored hash, so every block after it is untrusted.
              </p>
            </div>
          </div>
          <button onClick={() => post('/api/restore')} className="btn btn-solid shrink-0">
            <RotateCcw className="h-4 w-4" /> Restore block
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Products registered" value={products ? Object.keys(products).length : '–'} />
        <Stat label="Blocks on chain" value={chainRes ? chain.length : '–'} note="Including genesis" />
        <Stat label="Scans recorded" value={chainRes ? scans : '–'} />
        <Stat label="Alerts raised" value={alerts ? alerts.length : '–'} tone={alerts?.length ? 'bad' : undefined} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-4">
          <RegisterForm onDone={refresh} />

          <section className="panel">
            <PanelHeader title="Integrity test" />
            <div className="space-y-3 p-4">
              <p className="text-sm leading-relaxed text-sub">
                Overwrites the data in block #1 without recomputing its hash, the way an attacker editing the database
                directly would. The hash check should flag it immediately.
              </p>
              {isValid ? (
                <button onClick={() => post('/api/tamper')} className="btn btn-danger w-full">
                  Tamper with block #1
                </button>
              ) : (
                <button onClick={() => post('/api/restore')} className="btn btn-line w-full">
                  <RotateCcw className="h-4 w-4" /> Restore original data
                </button>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6 xl:col-span-8">
          <section className="panel overflow-hidden">
            <PanelHeader title="Recent activity" meta="refreshes every 3s">
              <Link to="/explorer" className="text-xs font-medium text-brand hover:underline">
                Open ledger
              </Link>
            </PanelHeader>
            {chain.length === 0 ? (
              <Empty>Waiting for the ledger…</Empty>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-rule text-left text-xs text-faint">
                      <th className="px-4 py-2 font-medium">Block</th>
                      <th className="px-4 py-2 font-medium">Type</th>
                      <th className="px-4 py-2 font-medium">Product</th>
                      <th className="px-4 py-2 font-medium">Where</th>
                      <th className="px-4 py-2 font-medium">Trust</th>
                      <th className="px-4 py-2 text-right font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...chain]
                      .reverse()
                      .slice(0, 10)
                      .map((b) => (
                        <tr key={b.index} className="border-b border-rule last:border-0 hover:bg-paper">
                          <td className="tabular px-4 py-2.5 font-mono text-xs">#{b.index}</td>
                          <td className="px-4 py-2.5">
                            <BlockTag block={b} invalid={b.index === chainRes?.invalidBlock} />
                          </td>
                          <td className="px-4 py-2.5">
                            {b.data.productId ? (
                              <>
                                <span className="font-mono text-xs">{b.data.productId}</span>
                                <span className="ml-2 text-sub">{products?.[b.data.productId]?.name}</span>
                              </>
                            ) : (
                              <span className="text-faint">–</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-sub">
                            {b.data.location ? `${b.data.location}, ${b.data.stage}` : '–'}
                          </td>
                          <td className="px-4 py-2.5">
                            {b.data.aiResult ? <ScoreBar score={b.data.aiResult.trustScore} /> : <span className="text-faint">–</span>}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-right text-xs text-faint">{timeAgo(b.timestamp)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="panel overflow-hidden">
            <PanelHeader title="Products" meta={`${inventory.length} tracked`} />
            {inventory.length === 0 ? (
              <Empty>No products registered yet.</Empty>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-rule text-left text-xs text-faint">
                      <th className="px-4 py-2 font-medium">Product</th>
                      <th className="px-4 py-2 font-medium">Last seen</th>
                      <th className="px-4 py-2 font-medium">Scans</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 text-right font-medium">Last hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(([id, row]) => (
                      <tr key={id} className="border-b border-rule last:border-0 hover:bg-paper">
                        <td className="px-4 py-2.5">
                          <span className="font-mono text-xs">{id}</span>
                          <span className="ml-2">{products?.[id]?.name}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-sub">
                          {row.last.data.location}, {row.last.data.stage}
                        </td>
                        <td className="tabular px-4 py-2.5 text-sub">{row.scans}</td>
                        <td className="px-4 py-2.5">
                          {row.flagged > 0 ? (
                            <span className="tag bg-bad-soft text-bad">
                              {row.flagged} FLAGGED SCAN{row.flagged > 1 ? 'S' : ''}
                            </span>
                          ) : (
                            <span className="tag bg-ok-soft text-ok">CLEAN</span>
                          )}
                        </td>
                        <td className="hash px-4 py-2.5 text-right text-faint">{shortHash(row.last.hash, 6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function RegisterForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await readJson<{ productId: string; block: { index: number } }>(
        await fetch('/api/mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }),
      );
      setStatus({ ok: true, message: `${res.productId} written to block #${res.block.index}.` });
      setForm(EMPTY_FORM);
      onDone();
    } catch (err) {
      setStatus({ ok: false, message: err instanceof Error ? err.message : 'Registration failed' });
    } finally {
      setBusy(false);
    }
  };

  const pickImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  return (
    <section className="panel">
      <PanelHeader title="Register a product" />
      <form onSubmit={submit} className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="pid">
              Product ID
            </label>
            <input
              id="pid"
              required
              className="field font-mono"
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              placeholder="PRD-110"
            />
          </div>
          <div>
            <label className="label" htmlFor="loc">
              Factory location
            </label>
            <select
              id="loc"
              className="field"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            >
              {LOCATIONS.map((loc) => (
                <option key={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="pname">
            Product name
          </label>
          <input
            id="pname"
            required
            className="field"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Running shoes, size 9"
          />
        </div>

        <div>
          <span className="label">Photo (optional)</span>
          {form.image ? (
            <div className="flex items-center gap-3 rounded-[4px] border border-rule p-2">
              <img src={form.image} alt="" className="h-12 w-12 rounded-[3px] object-cover" />
              <span className="flex-1 text-sm text-sub">Photo attached</span>
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => setForm({ ...form, image: '' })}
                className="p-1.5 text-faint hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-dashed border-rule-strong text-sm text-sub hover:bg-paper">
              <ImagePlus className="h-4 w-4" /> Choose an image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(e.target.files?.[0])} />
            </label>
          )}
        </div>

        {status && (
          <p role="status" className={`text-sm ${status.ok ? 'text-ok' : 'text-bad'}`}>
            {status.message}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn btn-solid w-full">
          {busy ? 'Writing block…' : 'Register at factory'}
        </button>
      </form>
    </section>
  );
}
