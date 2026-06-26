interface Props {
  title: string;
  value: number;
  icon: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export default function StatsCard({ title, value, icon, colorClass, bgClass, borderClass }: Props) {
  return (
    <div className={`rounded-xl border ${borderClass} ${bgClass} p-4`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`mt-2 text-3xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}
