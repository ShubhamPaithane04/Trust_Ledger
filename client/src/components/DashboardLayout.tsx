import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { Boxes, LayoutGrid, ScanLine, Network, TriangleAlert, Menu, X, ShieldCheck, ShieldX } from 'lucide-react';
import { useAlerts, useChain } from '@/lib/queries';
import { anomalyDetail, ruleFor, type Alert } from '@/lib/chainverify';

const NAV = [
  { path: '/dashboard', label: 'Overview', icon: LayoutGrid },
  { path: '/scanner', label: 'Verify product', icon: ScanLine },
  { path: '/explorer', label: 'Ledger', icon: Boxes },
  { path: '/map', label: 'Network', icon: Network },
  { path: '/ai-center', label: 'Alerts', icon: TriangleAlert },
] as const;

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`grid h-7 w-7 place-items-center rounded-[5px] ${dark ? 'bg-side-ink text-side' : 'bg-ink text-white'}`}
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="1.5" y="5" width="5" height="6" rx="1" />
          <rect x="9.5" y="5" width="5" height="6" rx="1" />
          <path d="M6.5 8h3" />
        </svg>
      </span>
      <span className={`text-[15px] font-semibold tracking-tight ${dark ? 'text-side-ink' : 'text-ink'}`}>ChainVerify</span>
    </span>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({ children, title, description, actions }: LayoutProps) {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const { data: chain } = useChain();
  const { data: alerts } = useAlerts();
  const toasts = useNewAlertToasts(alerts);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-5">
        <Link to="/" onClick={() => setNavOpen(false)}>
          <Logo dark />
        </Link>
      </div>

      <nav className="mt-2 flex-1 space-y-0.5 px-3">
        {NAV.map((item) => {
          const active = location.pathname === item.path;
          const count = item.path === '/ai-center' ? alerts?.length ?? 0 : 0;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setNavOpen(false)}
              className={`flex h-9 items-center gap-3 rounded-[4px] px-3 text-sm ${
                active ? 'bg-white/10 text-side-ink' : 'text-side-sub hover:bg-white/5 hover:text-side-ink'
              }`}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.75} />
              <span className="flex-1">{item.label}</span>
              {count > 0 && <span className="tabular text-xs text-[#f3a3a3]">{count}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-side-rule p-4">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-side-sub">Ledger status</p>
        {!chain ? (
          <p className="text-sm text-side-sub">Connecting…</p>
        ) : chain.isValid ? (
          <p className="flex items-center gap-2 text-sm text-side-ink">
            <ShieldCheck className="h-4 w-4 text-[#6fcf97]" /> {chain.chain.length} blocks, all hashes valid
          </p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-[#f3a3a3]">
            <ShieldX className="h-4 w-4" /> Hash mismatch at block #{chain.invalidBlock}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-paper text-ink">
      <aside className="hidden w-60 shrink-0 bg-side lg:block">{sidebar}</aside>

      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close navigation" className="absolute inset-0 bg-black/40" onClick={() => setNavOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-side">
            <button
              aria-label="Close navigation"
              onClick={() => setNavOpen(false)}
              className="absolute right-3 top-3.5 p-1.5 text-side-sub hover:text-side-ink"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-rule bg-panel px-4 lg:hidden">
          <button aria-label="Open navigation" onClick={() => setNavOpen(true)} className="p-1.5 text-sub hover:text-ink">
            <Menu className="h-5 w-5" />
          </button>
          <Logo />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8 md:py-8">
            {title && (
              <header className="mb-6 flex flex-col gap-4 border-b border-rule pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
                  {description && <p className="mt-1 max-w-2xl text-sm text-sub">{description}</p>}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
              </header>
            )}
            {children}
          </div>
        </main>
      </div>

      <div className="fixed bottom-4 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] space-y-2">
        {toasts.items.map((alert) => (
          <div key={alert.id} role="alert" className="panel border-l-[3px] border-l-bad p-3.5 pr-9 shadow-lg relative">
            <button
              aria-label="Dismiss"
              onClick={() => toasts.dismiss(alert.id)}
              className="absolute right-2 top-2 p-1 text-faint hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="text-sm font-semibold text-bad">
              {ruleFor(alert.anomalies[0] ?? '')?.name ?? 'Anomaly'} on {alert.productId}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-sub">{anomalyDetail(alert.anomalies[0] ?? '')}</p>
            <Link to="/ai-center" className="mt-2 inline-block text-xs font-medium text-brand hover:underline">
              View alert
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// Shows a toast only for alerts that arrive after the page first loaded
function useNewAlertToasts(alerts: Alert[] | undefined) {
  const seen = useRef<Set<number> | null>(null);
  const [items, setItems] = useState<Alert[]>([]);

  useEffect(() => {
    if (!alerts) return;
    if (!seen.current) {
      seen.current = new Set(alerts.map((a) => a.id));
      return;
    }
    const fresh = alerts.filter((a) => !seen.current!.has(a.id));
    if (fresh.length === 0) return;
    fresh.forEach((a) => seen.current!.add(a.id));
    setItems((prev) => [...fresh, ...prev].slice(0, 3));
    const ids = fresh.map((a) => a.id);
    setTimeout(() => setItems((prev) => prev.filter((a) => !ids.includes(a.id))), 7000);
  }, [alerts]);

  return { items, dismiss: (id: number) => setItems((prev) => prev.filter((a) => a.id !== id)) };
}
