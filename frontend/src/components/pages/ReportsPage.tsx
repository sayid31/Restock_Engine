import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { useAllProducts } from '../../hooks/useAllProducts';
import StatusBadge from '../StatusBadge';
import UrgencyBar  from '../UrgencyBar';
import type { UrgencyStatus } from '../../types';

const STATUS_COLOR: Record<UrgencyStatus, string> = {
  Emergency: '#ef4444',
  Urgent:    '#f59e0b',
  Watch:     '#0ea5e9',
  Safe:      '#10b981',
};

const STATUS_LABEL: Record<UrgencyStatus, string> = {
  Emergency: 'Darurat',
  Urgent:    'Mendesak',
  Watch:     'Pantau',
  Safe:      'Aman',
};

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

function SkeletonCard({ h = 'h-72' }: { h?: string }) {
  return (
    <div className={`animate-pulse rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${h}`} />
  );
}

export default function ReportsPage() {
  const { products, loading } = useAllProducts();

  const analyzed = products.filter(p => p.latestAnalysis);

  // ── Chart data ────────────────────────────────────────────────────────────

  const stockData = [...analyzed]
    .sort((a, b) => a.currentStock - b.currentStock)
    .map(p => ({
      label:  p.sku,
      stock:  p.currentStock,
      status: p.latestAnalysis!.urgencyStatus as UrgencyStatus,
    }));

  const salesData = [...analyzed]
    .sort((a, b) => b.dailySalesAvg - a.dailySalesAvg)
    .map(p => ({
      label: p.sku,
      sales: p.dailySalesAvg,
      status: p.latestAnalysis!.urgencyStatus as UrgencyStatus,
    }));

  const statusCounts = { Emergency: 0, Urgent: 0, Watch: 0, Safe: 0 } as Record<UrgencyStatus, number>;
  analyzed.forEach(p => { statusCounts[p.latestAnalysis!.urgencyStatus as UrgencyStatus]++; });
  const pieData = (Object.entries(statusCounts) as [UrgencyStatus, number][])
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, label: STATUS_LABEL[name], value }));

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard h="h-80" />
        <SkeletonCard h="h-80" />
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonCard h="h-72" />
          <SkeletonCard h="h-72" />
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────

  if (analyzed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
        <svg className="mb-4 h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        <p className="text-sm font-medium text-slate-600">Belum Ada Data Untuk Ditampilkan</p>
        <p className="mt-1 text-xs text-slate-400">Klik "Muat Data Demo" di Dashboard untuk mengisi data.</p>
      </div>
    );
  }

  // ── Charts ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Chart 1: Stock Distribution ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          title="Distribusi Level Stok"
          subtitle="Jumlah stok per produk, diurutkan dari terendah — warna menunjukkan status urgency"
        />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stockData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#64748b' }}
              angle={-30}
              textAnchor="end"
              height={65}
            />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} width={40} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(val: number) => [val, 'Jumlah Stok']}
            />
            <Bar dataKey="stock" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {stockData.map((d, i) => (
                <Cell key={i} fill={STATUS_COLOR[d.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {(Object.entries(STATUS_COLOR) as [UrgencyStatus, string][]).map(([s, color]) => (
            <span key={s} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
              {STATUS_LABEL[s]}
            </span>
          ))}
        </div>
      </div>

      {/* ── Chart 2: Sales Velocity ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          title="Kecepatan Jual (Unit / Hari)"
          subtitle="Rata-rata penjualan harian per produk, diurutkan dari tercepat"
        />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#64748b' }}
              angle={-30}
              textAnchor="end"
              height={65}
            />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} width={40} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(val: number) => [`${val.toFixed(1)} unit`, 'Kecepatan Jual']}
            />
            <Bar dataKey="sales" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {salesData.map((d, i) => (
                <Cell key={i} fill={STATUS_COLOR[d.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Row 3: Pie Chart + Analysis Table ── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Urgency Pie */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            title="Distribusi Status Urgency"
            subtitle="Proporsi produk per kategori berdasarkan analisis terakhir"
          />
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={95}
                paddingAngle={3}
                label={({ label, value }) => `${label} (${value})`}
                labelLine={false}
              >
                {pieData.map((d, i) => (
                  <Cell key={i} fill={STATUS_COLOR[d.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={(val: number, name: string) => [val + ' produk', name]}
              />
              <Legend
                formatter={(value) => <span style={{ fontSize: 12, color: '#475569' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Analysis Summary Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-800">Ringkasan Analisis</h2>
            <p className="text-xs text-slate-400">Semua produk, diurutkan dari urgency tertinggi</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Produk</th>
                  <th className="px-4 py-3 text-left">Stok</th>
                  <th className="px-4 py-3 text-left">Score</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...analyzed]
                  .sort((a, b) => b.latestAnalysis!.urgencyScore - a.latestAnalysis!.urgencyScore)
                  .map(p => (
                    <tr key={p.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 leading-tight">{p.name}</p>
                        <p className="font-mono text-[11px] text-slate-400">{p.sku}</p>
                      </td>
                      <td className="px-4 py-3 tabular-nums font-semibold text-slate-700">{p.currentStock}</td>
                      <td className="px-4 py-3 w-28">
                        <UrgencyBar score={p.latestAnalysis!.urgencyScore} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.latestAnalysis!.urgencyStatus} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
