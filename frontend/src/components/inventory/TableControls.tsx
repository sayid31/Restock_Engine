import type { UrgencyStatus } from '../../types';
import { triggerCsvExport } from '../../api/client';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: UrgencyStatus | '';
  onStatusFilter: (v: UrgencyStatus | '') => void;
  total: number;
}

const STATUS_OPTIONS: { value: UrgencyStatus | ''; label: string }[] = [
  { value: '',          label: 'Semua Status'      },
  { value: 'Emergency', label: '🔴 Restock Darurat' },
  { value: 'Urgent',    label: '🟡 Siapkan PO'      },
  { value: 'Watch',     label: '🔵 Pantau'          },
  { value: 'Safe',      label: '🟢 Abaikan'         },
];

export default function TableControls({ search, onSearch, statusFilter, onStatusFilter, total }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4">

      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama atau SKU…"
            value={search}
            onChange={e => onSearch(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 w-56"
          />
          {search && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => onStatusFilter(e.target.value as UrgencyStatus | '')}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <span className="text-xs text-slate-400">{total} produk ditemukan</span>
      </div>

      {/* Export */}
      <button
        onClick={triggerCsvExport}
        className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 active:scale-95"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Export CSV
      </button>
    </div>
  );
}
