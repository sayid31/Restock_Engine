import type { Product } from '../../types';
import StatusBadge from '../StatusBadge';
import UrgencyBar  from '../UrgencyBar';

function fmt(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
    {children}
  </th>
);

interface Props {
  products: Product[];
  analyzingIds: Set<string>;
  onAnalyze: (id: string) => void;
  loading?: boolean;
}

export default function ProductTable({ products, analyzingIds, onAnalyze, loading }: Props) {
  if (!loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-slate-400">
        <svg className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        <p className="text-sm">Tidak ada produk yang cocok</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <TH>Produk</TH>
            <TH>Stok</TH>
            <TH>Jual/Hari</TH>
            <TH>Urgency Score</TH>
            <TH>Status</TH>
            <TH>Dianalisis</TH>
            <TH>Aksi</TH>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-3 rounded bg-slate-200" style={{ width: `${60 + (j * 7) % 30}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            : products.map((p, i) => {
                const a          = p.latestAnalysis;
                const isAnalyzing = analyzingIds.has(p.id);
                return (
                  <tr
                    key={p.id}
                    className={`transition-colors hover:bg-indigo-50/30 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{p.name}</p>
                      <p className="font-mono text-xs text-slate-400">{p.sku}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`font-bold tabular-nums ${
                        p.currentStock <= 20 ? 'text-red-600' : p.currentStock <= 50 ? 'text-amber-600' : 'text-slate-700'
                      }`}>
                        {p.currentStock}
                      </span>
                      <span className="ml-1 text-xs text-slate-400">unit</span>
                    </td>
                    <td className="px-5 py-3.5 tabular-nums text-slate-600">
                      {p.dailySalesAvg.toFixed(1)}
                      <span className="ml-1 text-xs text-slate-400">/hari</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {a
                        ? <UrgencyBar score={a.urgencyScore} />
                        : <span className="text-xs italic text-slate-400">—</span>
                      }
                    </td>
                    <td className="px-5 py-3.5">
                      {a
                        ? <StatusBadge status={a.urgencyStatus} />
                        : <span className="text-xs italic text-slate-400">—</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {a ? fmt(a.analyzedAt) : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => onAnalyze(p.id)}
                        disabled={isAnalyzing}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isAnalyzing ? (
                          <><svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Analyzing…</>
                        ) : (
                          <>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.864 1.849a3.75 3.75 0 01-5.323-.349l-1.285-1.5a3.75 3.75 0 00-5.323-.349L5 14.5m14.8.5-1.864-1.849" />
                            </svg>
                            Analisis AI
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
          }
        </tbody>
      </table>
    </div>
  );
}
