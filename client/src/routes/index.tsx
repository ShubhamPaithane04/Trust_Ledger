import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/DashboardLayout';
import { BlockTag } from '@/components/Parts';
import { RULES, shortHash, timeAgo } from '@/lib/chainverify';
import { useChain, useProducts } from '@/lib/queries';

export const Route = createFileRoute('/')({
  component: Landing,
  head: () => ({
    meta: [
      { title: 'ChainVerify | Supply chain authentication on a hash chain' },
      {
        name: 'description',
        content:
          'ChainVerify records every supply chain scan in a SHA-256 hash chain and flags counterfeit products using travel, frequency and stage-order checks.',
      },
    ],
  }),
});

const STEPS = [
  {
    title: 'Register at the factory',
    body: 'The manufacturer mints a product ID. That creates the first block for the product, with its origin city and an optional photo.',
  },
  {
    title: 'Scan at every handoff',
    body: 'Warehouses, distributors and retailers scan the item as it moves. Each scan becomes a new block linked to the previous one.',
  },
  {
    title: 'Verify before buying',
    body: 'A customer scans the code. The scan is scored against the full history and the result comes back with the chain of custody.',
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-rule bg-panel">
        <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-4 md:px-6">
          <Logo />
          <nav className="flex items-center gap-1 text-sm">
            <a href="#how" className="hidden px-3 py-2 text-sub hover:text-ink md:block">
              How it works
            </a>
            <a href="#checks" className="hidden px-3 py-2 text-sub hover:text-ink md:block">
              Checks
            </a>
            <a href="#integrity" className="hidden px-3 py-2 text-sub hover:text-ink md:block">
              Integrity
            </a>
            <Link to="/dashboard" className="btn btn-solid ml-2 h-9">
              Open console
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-rule">
        <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-medium text-brand">Product authentication for supply chains</p>
            <h1 className="mt-3 text-[34px] font-semibold leading-[1.15] tracking-tight md:text-[44px]">
              Know where a product has been, and catch the ones that could not have been there.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-sub">
              ChainVerify writes every factory, warehouse and retail scan into a SHA-256 hash chain. Each new scan is
              checked against the product's history for impossible travel, scan flooding and out-of-order stages.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/dashboard" className="btn btn-solid h-11 px-5">
                Open console <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/scanner" className="btn btn-line h-11 px-5">
                Verify a product
              </Link>
            </div>
          </div>
          <LivePanel />
        </div>
      </section>

      <section id="how" className="border-b border-rule">
        <div className="mx-auto max-w-[1120px] px-4 py-16 md:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-[6px] border border-rule bg-rule md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="bg-panel p-6">
                <p className="tabular font-mono text-sm text-faint">0{i + 1}</p>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sub">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="checks" className="border-b border-rule">
        <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-16 md:px-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">What the anomaly checks look for</h2>
            <p className="mt-3 leading-relaxed text-sub">
              Every scan starts with a trust score of 100. Each rule that fires takes points off. A product that ends at
              70 or above is reported authentic; below that, the scan is flagged and an alert is raised.
            </p>
          </div>
          <div className="panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-rule text-left text-xs text-faint">
                  <th className="px-4 py-2.5 font-medium">Rule</th>
                  <th className="px-4 py-2.5 font-medium">Fires when</th>
                  <th className="px-4 py-2.5 text-right font-medium">Penalty</th>
                </tr>
              </thead>
              <tbody>
                {RULES.map((r) => (
                  <tr key={r.key} className="border-b border-rule align-top last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-sub">{r.detail}</td>
                    <td className="tabular px-4 py-3 text-right font-mono text-bad">−{r.penalty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="integrity" className="border-b border-rule">
        <div className="mx-auto max-w-[1120px] px-4 py-16 md:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight">Why editing the history does not work</h2>
            <p className="mt-3 leading-relaxed text-sub">
              Each block's hash covers its own data and the hash of the block before it. Change one field in an old block
              and its hash changes, which breaks the link to every block after it. The console lets you try this on the
              live ledger and watch the check fail.
            </p>
          </div>
          <HashChain />
          <Link to="/dashboard" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
            Try the tamper test in the console <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer>
        <div className="mx-auto flex max-w-[1120px] flex-col gap-2 px-4 py-8 text-sm text-sub md:flex-row md:justify-between md:px-6">
          <p>ChainVerify, built by Shubham Paithane.</p>
          <p>
            React, TanStack Start, Tailwind CSS, Express, Node crypto ·{' '}
            <a href="https://github.com/ShubhamPaithane04/Trust_Ledger" className="text-ink underline-offset-2 hover:underline">
              Source on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function LivePanel() {
  const { data: chainRes, isError } = useChain();
  const { data: products } = useProducts();
  const latest = [...(chainRes?.chain ?? [])].reverse().slice(0, 6);

  return (
    <div className="panel overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between border-b border-rule px-4 py-3">
        <p className="text-sm font-semibold">Latest blocks on this ledger</p>
        {chainRes && (
          <span className={`text-xs font-medium ${chainRes.isValid ? 'text-ok' : 'text-bad'}`}>
            {chainRes.isValid ? 'Chain valid' : `Broken at #${chainRes.invalidBlock}`}
          </span>
        )}
      </div>
      {isError ? (
        <p className="px-4 py-10 text-center text-sm text-sub">
          The API is not reachable. Start the server on port 3001 to see live data.
        </p>
      ) : !chainRes ? (
        <p className="px-4 py-10 text-center text-sm text-faint">Loading…</p>
      ) : (
        <ul className="divide-y divide-rule">
          {latest.map((b) => (
            <li key={b.index} className="flex items-center gap-3 px-4 py-2.5">
              <span className="tabular w-8 font-mono text-xs text-faint">#{b.index}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">
                  {b.data.productId ? (
                    <>
                      {products?.[b.data.productId]?.name ?? b.data.productId}
                      <span className="text-sub">
                        {' '}
                        · {b.data.location}, {b.data.stage}
                      </span>
                    </>
                  ) : (
                    <span className="text-sub">Genesis block</span>
                  )}
                </p>
                <p className="hash truncate text-faint">{shortHash(b.hash, 10)}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <BlockTag block={b} invalid={b.index === chainRes.invalidBlock} />
                <span className="text-[11px] text-faint">{timeAgo(b.timestamp)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HashChain() {
  const { data: chainRes } = useChain();
  const blocks = (chainRes?.chain ?? []).slice(0, 3);
  if (blocks.length < 3) return null;

  return (
    <div className="mt-8 grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
      {blocks.map((b, i) => (
        <div key={b.index} className="contents">
          <div className={`panel p-4 ${b.index === chainRes?.invalidBlock ? 'border-[#e5b4b4] bg-bad-soft' : ''}`}>
            <p className="text-sm font-semibold">Block #{b.index}</p>
            <p className="mt-0.5 text-xs text-sub">
              {b.data.productId ? `${b.data.type} ${b.data.productId}, ${b.data.location}` : b.data.tampered ? 'Data overwritten' : 'Genesis'}
            </p>
            <dl className="mt-3 space-y-2">
              <div>
                <dt className="text-[11px] text-faint">previous</dt>
                <dd className="hash truncate text-sub">{shortHash(b.previousHash, 8)}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-faint">hash</dt>
                <dd className="hash truncate">{shortHash(b.hash, 8)}</dd>
              </div>
            </dl>
          </div>
          {i < 2 && (
            <div className="hidden items-center text-faint md:flex">
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
