import type { UrgencyStatus } from '../types';

const CONFIG: Record<UrgencyStatus, { label: string; badge: string; dot: string }> = {
  Safe:      { label: 'Abaikan',          badge: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
  Watch:     { label: 'Pantau',            badge: 'bg-sky-100 text-sky-800 ring-1 ring-sky-200',             dot: 'bg-sky-500'     },
  Urgent:    { label: 'Siapkan PO',        badge: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',       dot: 'bg-amber-500'   },
  Emergency: { label: 'Restock Darurat!',  badge: 'bg-red-100 text-red-800 ring-1 ring-red-200',             dot: 'bg-red-500'     },
};

export default function StatusBadge({ status }: { status: UrgencyStatus }) {
  const { label, badge, dot } = CONFIG[status] ?? CONFIG.Safe;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
