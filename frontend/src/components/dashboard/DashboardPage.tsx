import { useState } from 'react';
import { useAllProducts } from '../../hooks/useAllProducts';
import { seedDemoData } from '../../api/client';
import StatsRow   from './StatsRow';
import StockChart from './StockChart';
import StatusBadge from '../StatusBadge';
import UrgencyBar  from '../UrgencyBar';

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <svg className="h-8 w-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>
  );
}

function EmptyState({ seeding, onSeed }: { seeding: boolean; onSeed: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
        <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-base font-semibold text-slate-800">Database Masih Kosong</h2>
      <p className="mb-8 max-w-xs text-sm text-slate-500">
        Belum ada produk di sistem. Muat 10 skenario produk demo untuk melihat dashboard dan analisis fuzzy logic secara langsung.
      </p>
      <button
        onClick={onSeed}
        disabled={seeding}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
      >
        {seeding ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Memuat data demo…
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Muat Data Demo
          </>
        )}
      </button>
      <p className="mt-4 text-xs text-slate-400">
        Akan memuat 10 produk dengan 4 level urgency berbeda — Emergency, Urgent, Watch, dan Safe
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { products, loading, analyzingIds, refresh, analyze } = useAllProducts();
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDemoData();
      await refresh();
    } catch (err) {
      console.error('[seed]', err);
    } finally {
      setSeeding(false);
    }
  };

  if (!loading && products.length === 0) {
    return <EmptyState seeding={seeding} onSeed={handleSeed} />;
  }

  const top5 = [...products]
    .filter(p => p.latestAnalysis)
    .sort((a, b) => b.latestAnalysis!.urgencyScore - a.latestAnalysis!.urgencyScore)
    .slice(0, 5);

  return (
    <div className="space-y-6">

      {/* ── Stats ── */}
      <StatsRow products={products} />

      {/* ── Chart + Alert Panel ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Stok vs Kecepatan Jual</h2>
              <p className="text-xs text-slate-400">5 produk dengan urgency score tertinggi</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSeed}
                disabled={seeding || loading}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                {seeding ? 'Memuat…' : 'Reload Demo'}
              </button>
              <button
                onClick={refresh}
                disabled={loading}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
              >
                <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>
          </div>
          {loading ? <Spinner /> : <StockChart products={products} />}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-800">Produk Prioritas</h2>
            <p className="text-xs text-slate-400">Memerlukan perhatian segera</p>
          </div>
          <ul className="divide-y divide-slate-100">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="animate-pulse px-5 py-4">
                    <div className="mb-2 h-3 w-3/4 rounded bg-slate-200" />
                    <div className="h-2 w-1/2 rounded bg-slate-100" />
                  </li>
                ))
              : top5.length === 0
              ? <li className="px-5 py-8 text-center text-xs text-slate-400">Belum ada data analisis</li>
              : top5.map(p => (
                  <li key={p.id} className="px-5 py-3">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-700">{p.name}</p>
                        <p className="font-mono text-[11px] text-slate-400">{p.sku}</p>
                      </div>
                      <StatusBadge status={p.latestAnalysis!.urgencyStatus} />
                    </div>
                    <UrgencyBar score={p.latestAnalysis!.urgencyScore} />
                  </li>
                ))
            }
          </ul>
        </div>
      </div>

      {/* ── Recent Analyses Table ── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-800">Analisis Terbaru</h2>
          <p className="text-xs text-slate-400">5 produk yang paling baru dianalisis</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                {['Produk', 'Stok', 'Jual/Hari', 'Score', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3 animate-pulse rounded bg-slate-200" />
                        </td>
                      ))}
                    </tr>
                  ))
                : [...products]
                    .filter(p => p.latestAnalysis)
                    .sort((a, b) =>
                      new Date(b.latestAnalysis!.analyzedAt).getTime() -
                      new Date(a.latestAnalysis!.analyzedAt).getTime()
                    )
                    .slice(0, 5)
                    .map(p => (
                      <tr key={p.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-800">{p.name}</p>
                          <p className="font-mono text-xs text-slate-400">{p.sku}</p>
                        </td>
                        <td className="px-5 py-3 font-semibold tabular-nums text-slate-700">{p.currentStock}</td>
                        <td className="px-5 py-3 tabular-nums text-slate-500">{p.dailySalesAvg.toFixed(1)}</td>
                        <td className="px-5 py-3">
                          <UrgencyBar score={p.latestAnalysis!.urgencyScore} />
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={p.latestAnalysis!.urgencyStatus} />
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => analyze(p.id)}
                            disabled={analyzingIds.has(p.id)}
                            className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50"
                          >
                            {analyzingIds.has(p.id) ? 'Analyzing…' : 'Re-analyze'}
                          </button>
                        </td>
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
