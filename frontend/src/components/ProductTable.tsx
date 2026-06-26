import type { Product } from '../types';
import StatusBadge from './StatusBadge';
import UrgencyBar from './UrgencyBar';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface Props {
  products: Product[];
  analyzingIds: Set<string>;
  onAnalyze: (productId: string) => void;
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
    {children}
  </th>
);

export default function ProductTable({ products, analyzingIds, onAnalyze }: Props) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-4xl">📦</p>
        <p className="mt-2 text-sm">Tidak ada produk ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <TH>Produk</TH>
            <TH>Stok Saat Ini</TH>
            <TH>Kecepatan Jual</TH>
            <TH>Urgency Score</TH>
            <TH>Status</TH>
            <TH>Dianalisis</TH>
            <TH>Aksi</TH>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product, i) => {
            const analysis = product.latestAnalysis;
            const isAnalyzing = analyzingIds.has(product.id);

            return (
              <tr
                key={product.id}
                className={`transition-colors hover:bg-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800">{product.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-slate-400">{product.sku}</p>
                </td>

                <td className="px-4 py-3">
                  <span className={`font-bold tabular-nums ${
                    product.currentStock <= 20 ? 'text-red-600'
                    : product.currentStock <= 50 ? 'text-amber-600'
                    : 'text-slate-700'
                  }`}>
                    {product.currentStock}
                  </span>
                  <span className="ml-1 text-xs text-slate-400">unit</span>
                </td>

                <td className="px-4 py-3 tabular-nums text-slate-600">
                  {product.dailySalesAvg.toFixed(1)}
                  <span className="ml-1 text-xs text-slate-400">/hari</span>
                </td>

                <td className="px-4 py-3">
                  {analysis
                    ? <UrgencyBar score={analysis.urgencyScore} />
                    : <span className="text-xs italic text-slate-400">Belum dianalisis</span>
                  }
                </td>

                <td className="px-4 py-3">
                  {analysis
                    ? <StatusBadge status={analysis.urgencyStatus} />
                    : <span className="text-xs italic text-slate-400">—</span>
                  }
                </td>

                <td className="px-4 py-3 text-xs text-slate-400">
                  {analysis ? formatDate(analysis.analyzedAt) : '—'}
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => onAnalyze(product.id)}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Menganalisis…
                      </>
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
          })}
        </tbody>
      </table>
    </div>
  );
}
