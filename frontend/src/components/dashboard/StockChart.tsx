import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import type { Product, UrgencyStatus } from '../../types';

// Bar fill based on urgency status
const STATUS_COLOR: Record<UrgencyStatus, string> = {
  Emergency: '#ef4444',
  Urgent:    '#f59e0b',
  Watch:     '#38bdf8',
  Safe:      '#10b981',
};

interface ChartRow {
  name: string;
  sku: string;
  stock: number;
  sales: number;
  score: number;
  status: UrgencyStatus;
}

function buildData(products: Product[]): ChartRow[] {
  return products
    .filter(p => p.latestAnalysis !== null)
    .sort((a, b) => b.latestAnalysis!.urgencyScore - a.latestAnalysis!.urgencyScore)
    .slice(0, 5)
    .map(p => ({
      name:   p.name.length > 13 ? p.name.slice(0, 13) + '…' : p.name,
      sku:    p.sku,
      stock:  p.currentStock,
      sales:  Math.round(p.dailySalesAvg * 10) / 10,
      score:  Math.round(p.latestAnalysis!.urgencyScore * 10) / 10,
      status: p.latestAnalysis!.urgencyStatus as UrgencyStatus,
    }));
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as ChartRow | undefined;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-xs">
      <p className="mb-1.5 font-bold text-slate-800">{label}</p>
      <p className="text-slate-500 mb-2">SKU: {row?.sku}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-6">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
      {row && (
        <div className="mt-2 border-t border-slate-100 pt-2 flex justify-between gap-6">
          <span className="text-slate-500">Urgency</span>
          <span className="font-bold" style={{ color: STATUS_COLOR[row.status] }}>
            {row.score} — {row.status}
          </span>
        </div>
      )}
    </div>
  );
};

export default function StockChart({ products }: { products: Product[] }) {
  const data = buildData(products);

  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-400">
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
        </svg>
        <p className="text-sm">Analisis produk terlebih dahulu untuk melihat chart</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: -8, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
          formatter={(v) => <span className="text-slate-600">{v}</span>}
        />

        {/* Stock bars — color-coded by urgency status */}
        <Bar dataKey="stock" name="Stok Saat Ini" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((d, i) => (
            <Cell key={i} fill={STATUS_COLOR[d.status]} fillOpacity={0.85} />
          ))}
        </Bar>

        {/* Sales velocity bars — constant indigo */}
        <Bar dataKey="sales" name="Jual / Hari" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
