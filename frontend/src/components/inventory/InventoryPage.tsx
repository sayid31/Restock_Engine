import { useInventoryProducts } from '../../hooks/useInventoryProducts';
import TableControls from './TableControls';
import ProductTable  from './ProductTable';
import Pagination    from './Pagination';

export default function InventoryPage() {
  const {
    products, meta, loading, error,
    analyzingIds, analyze,
    search, setSearch,
    statusFilter, setStatusFilter,
    page, setPage,
    refresh,
  } = useInventoryProducts();

  return (
    <div className="space-y-0 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Manajemen Produk</h2>
          <p className="text-xs text-slate-400">Cari, filter, analisis, dan ekspor data stok</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
        >
          <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {/* ── Controls (search + filter + export) ── */}
      <TableControls
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        total={meta.total}
      />

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 px-6 py-4 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
          </svg>
          {error}
          <button onClick={refresh} className="ml-auto text-xs font-medium underline">Coba lagi</button>
        </div>
      )}

      {/* ── Table ── */}
      <ProductTable
        products={products}
        analyzingIds={analyzingIds}
        onAnalyze={analyze}
        loading={loading}
      />

      {/* ── Pagination ── */}
      <Pagination meta={meta} onPageChange={setPage} />

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-4 border-t border-slate-100 bg-slate-50/60 px-6 py-3 text-[11px] text-slate-500">
        <span className="font-medium text-slate-600">Keterangan:</span>
        {[
          ['bg-emerald-500', 'Abaikan — Stok aman'],
          ['bg-sky-500',     'Pantau — Perhatikan stok'],
          ['bg-amber-500',   'Siapkan PO — Buat Purchase Order'],
          ['bg-red-500',     'Restock Darurat! — Tindakan segera'],
        ].map(([dot, label]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
