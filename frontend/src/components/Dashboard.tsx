import { useProducts } from '../hooks/useProducts';
import type { Product } from '../types';
import StatsCard from './StatsCard';
import ProductTable from './ProductTable';

function computeStats(products: Product[]) {
  return {
    total:     products.length,
    emergency: products.filter(p => p.latestAnalysis?.urgencyStatus === 'Emergency').length,
    urgent:    products.filter(p => p.latestAnalysis?.urgencyStatus === 'Urgent').length,
    safe:      products.filter(p => p.latestAnalysis?.urgencyStatus === 'Safe').length,
  };
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-3 px-6 py-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 rounded-lg bg-slate-200" />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { products, loading, error, analyzingIds, refresh, analyze } = useProducts();
  const stats = computeStats(products);

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 to-indigo-900 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Smart Supply Chain Restock Engine
              </h1>
              <p className="mt-0.5 text-sm text-indigo-300">Powered by Fuzzy Logic AI</p>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
            >
              <svg
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatsCard title="Total Produk"    value={stats.total}     icon="📦" colorClass="text-slate-700"   bgClass="bg-white"       borderClass="border-slate-200" />
          <StatsCard title="Restock Darurat" value={stats.emergency} icon="🔴" colorClass="text-red-600"     bgClass="bg-red-50"      borderClass="border-red-200"   />
          <StatsCard title="Perlu Perhatian" value={stats.urgent}    icon="🟡" colorClass="text-amber-600"   bgClass="bg-amber-50"    borderClass="border-amber-200" />
          <StatsCard title="Stok Aman"       value={stats.safe}      icon="🟢" colorClass="text-emerald-600" bgClass="bg-emerald-50"  borderClass="border-emerald-200" />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Daftar Produk</h2>
              <p className="text-xs text-slate-400">{products.length} produk terdaftar</p>
            </div>
          </div>

          {error ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-3xl">⚠️</p>
              <p className="mt-2 font-medium text-red-600">{error}</p>
              <button
                onClick={refresh}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Coba Lagi
              </button>
            </div>
          ) : loading ? (
            <LoadingSkeleton />
          ) : (
            <ProductTable products={products} analyzingIds={analyzingIds} onAnalyze={analyze} />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white px-6 py-4 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Keterangan Status:</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Abaikan — Stok aman</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500"     /> Pantau — Perhatikan stok</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"   /> Siapkan PO — Buat Purchase Order</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"     /> Restock Darurat! — Tindakan segera</span>
        </div>

      </main>
    </div>
  );
}
