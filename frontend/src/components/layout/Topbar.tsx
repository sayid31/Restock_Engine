import { useState, useRef, useEffect } from 'react';
import type { PageView } from '../../types';

const PAGE_LABELS: Record<PageView, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard',  subtitle: 'Ringkasan kondisi stok dan analisis terkini'   },
  inventory: { title: 'Inventory',  subtitle: 'Kelola dan analisis seluruh produk'             },
  reports:   { title: 'Reports',    subtitle: 'Laporan performa dan histori stok'              },
  settings:  { title: 'Settings',   subtitle: 'Konfigurasi sistem dan preferensi pengguna'    },
};

type NotifType = 'emergency' | 'urgent' | 'system';

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
}

const NOTIFICATIONS: Notif[] = [
  { id: '1', type: 'emergency', title: 'Restock Darurat!',  body: 'Masker N95 Premium — stok tinggal 8 unit, kecepatan jual 22/hari',       time: '5 mnt lalu'  },
  { id: '2', type: 'emergency', title: 'Restock Darurat!',  body: 'Sarung Tangan Nitrile L — stok kritis (5 unit), segera buat PO',          time: '12 mnt lalu' },
  { id: '3', type: 'urgent',    title: 'Segera Siapkan PO', body: 'Hand Sanitizer 500ml — diperkirakan habis dalam < 1 hari',                 time: '1 jam lalu'  },
  { id: '4', type: 'system',    title: 'Analisis Selesai',  body: '10 produk berhasil dianalisis oleh mesin fuzzy logic',                    time: '2 jam lalu'  },
];

const NOTIF_STYLE: Record<NotifType, { dot: string; badge: string }> = {
  emergency: { dot: 'bg-red-500',    badge: 'bg-red-50 text-red-700 ring-red-200'   },
  urgent:    { dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 ring-amber-200' },
  system:    { dot: 'bg-indigo-400', badge: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
};

const NOTIF_LABEL: Record<NotifType, string> = {
  emergency: 'Darurat',
  urgent:    'Mendesak',
  system:    'Sistem',
};

interface Props {
  currentPage: PageView;
}

export default function Topbar({ currentPage }: Props) {
  const { title, subtitle } = PAGE_LABELS[currentPage];
  const [open,    setOpen]    = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const unread = NOTIFICATIONS.filter(n => !readIds.has(n.id)).length;

  const markRead = (id: string) => setReadIds(prev => new Set(prev).add(id));
  const markAllRead = () => setReadIds(new Set(NOTIFICATIONS.map(n => n.id)));

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Breadcrumb */}
      <div>
        <h1 className="text-base font-semibold text-slate-800">{title}</h1>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">

        {/* Notification bell + dropdown */}
        <div ref={containerRef} className="relative">
          <button
            onClick={() => setOpen(prev => !prev)}
            className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">Notifikasi</span>
                  {unread > 0 && (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </div>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              {/* List */}
              <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                {NOTIFICATIONS.map(n => {
                  const isRead = readIds.has(n.id);
                  const style  = NOTIF_STYLE[n.type];
                  return (
                    <li
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`cursor-pointer px-4 py-3 transition-colors hover:bg-slate-50 ${isRead ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isRead ? 'bg-slate-300' : style.dot}`} />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${style.badge}`}>
                              {NOTIF_LABEL[n.type]}
                            </span>
                            <span className="text-[11px] text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700">{n.title}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{n.body}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Footer */}
              <div className="border-t border-slate-100 px-4 py-2.5 text-center">
                <button
                  onClick={() => setOpen(false)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200" />

        {/* User profile */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-slate-700">Ahmad Fauzi</p>
            <p className="text-[11px] text-slate-400">Admin Gudang · PT Bina Nusantara</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
            AF
          </div>
          <span className="hidden rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200 lg:inline-flex">
            PT Bina Nusantara
          </span>
        </div>
      </div>
    </header>
  );
}
