import type { Product } from '../../types';

function Card({ label, value, sub, icon, ring, bg, text }: {
  label: string; value: number; sub: string;
  icon: string; ring: string; bg: string; text: string;
}) {
  return (
    <div className={`rounded-xl border ${ring} ${bg} p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className={`mt-1 text-3xl font-bold ${text}`}>{value}</p>
          <p className="mt-1 text-xs text-slate-400">{sub}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

export default function StatsRow({ products }: { products: Product[] }) {
  const analyzed  = products.filter(p => p.latestAnalysis).length;
  const emergency = products.filter(p => p.latestAnalysis?.urgencyStatus === 'Emergency').length;
  const urgent    = products.filter(p => p.latestAnalysis?.urgencyStatus === 'Urgent').length;
  const safe      = products.filter(p => p.latestAnalysis?.urgencyStatus === 'Safe').length;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card label="Total Produk"    value={products.length} sub={`${analyzed} telah dianalisis`}   icon="📦" ring="border-slate-200"   bg="bg-white"       text="text-slate-800"   />
      <Card label="Restock Darurat" value={emergency}       sub="Tindakan segera"                  icon="🔴" ring="border-red-200"     bg="bg-red-50"      text="text-red-600"     />
      <Card label="Perlu Perhatian" value={urgent}          sub="Siapkan Purchase Order"            icon="🟡" ring="border-amber-200"   bg="bg-amber-50"    text="text-amber-600"   />
      <Card label="Stok Aman"       value={safe}            sub="Tidak ada tindakan"               icon="🟢" ring="border-emerald-200" bg="bg-emerald-50"  text="text-emerald-600" />
    </div>
  );
}
