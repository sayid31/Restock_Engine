const Toggle = ({ label, desc, defaultOn = false }: { label: string; desc: string; defaultOn?: boolean }) => (
  <div className="flex items-start justify-between py-4">
    <div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
    </div>
    <button
      className={`relative h-5 w-9 rounded-full transition-colors focus:outline-none ${defaultOn ? 'bg-indigo-600' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${defaultOn ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  </div>
);

const Field = ({ label, value, readOnly = true }: { label: string; value: string; readOnly?: boolean }) => (
  <div>
    <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
    <input
      defaultValue={value}
      readOnly={readOnly}
      className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none ${
        readOnly
          ? 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'
          : 'border-slate-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
      }`}
    />
  </div>
);

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">

      {/* Company Profile */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-800">Profil Perusahaan</h2>
          <p className="text-xs text-slate-400">Informasi tenant dan organisasi</p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <Field label="Nama Perusahaan"  value="PT Bina Nusantara" />
          <Field label="Tenant ID"        value="tenant_bina_nusantara_01" />
          <Field label="Plan"             value="Enterprise (Active)" />
          <Field label="Berlaku Hingga"   value="31 Desember 2026" />
          <Field label="Nama Kontak"      value="Ahmad Fauzi" />
          <Field label="Email Kontak"     value="ahmad.fauzi@bina-nusantara.co.id" />
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-800">Preferensi Notifikasi</h2>
          <p className="text-xs text-slate-400">Atur kapan sistem mengirimkan peringatan</p>
        </div>
        <div className="divide-y divide-slate-100 px-6">
          <Toggle label="Alert Restock Darurat"  desc="Kirim notifikasi saat urgency score ≥ 75"      defaultOn />
          <Toggle label="Laporan Harian"          desc="Ringkasan kondisi stok setiap pukul 07.00"     defaultOn />
          <Toggle label="Alert Stok Minimum"      desc="Peringatan saat stok di bawah safety stock"   defaultOn />
          <Toggle label="Digest Mingguan"         desc="Laporan performa analisis setiap Senin pagi"  />
        </div>
      </div>

      {/* API / Webhook */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-800">Integrasi & API</h2>
          <p className="text-xs text-slate-400">Hubungkan dengan sistem ERP atau WMS Anda</p>
        </div>
        <div className="space-y-4 p-6">
          <Field label="API Key"      value="re_live_••••••••••••••••••••Zx9K" />
          <Field label="Webhook URL"  value="https://erp.bina-nusantara.co.id/webhooks/restock" readOnly={false} />
          <div className="flex gap-3">
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors">
              Simpan Webhook
            </button>
            <button className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Generate API Key Baru
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-red-50 shadow-sm">
        <div className="border-b border-red-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-red-700">Danger Zone</h2>
          <p className="text-xs text-red-400">Tindakan ini tidak dapat dibatalkan</p>
        </div>
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-slate-700">Reset Semua Data Analisis</p>
            <p className="text-xs text-slate-400">Hapus seluruh histori RestockAnalysis dari database</p>
          </div>
          <button className="rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors">
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
}
