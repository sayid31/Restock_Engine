function barColor(score: number): string {
  if (score >= 75) return 'bg-red-500';
  if (score >= 55) return 'bg-amber-500';
  if (score >= 30) return 'bg-yellow-400';
  return 'bg-emerald-500';
}

function trackColor(score: number): string {
  if (score >= 75) return 'bg-red-100';
  if (score >= 55) return 'bg-amber-100';
  if (score >= 30) return 'bg-yellow-100';
  return 'bg-emerald-100';
}

export default function UrgencyBar({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score));
  return (
    <div className="flex items-center gap-2 min-w-[130px]">
      <div className={`relative h-2 flex-1 overflow-hidden rounded-full ${trackColor(clamped)}`}>
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${barColor(clamped)}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-semibold tabular-nums text-slate-600">
        {clamped.toFixed(1)}
      </span>
    </div>
  );
}
