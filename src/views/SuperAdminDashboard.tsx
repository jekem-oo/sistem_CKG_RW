import React, { useState } from 'react';
import {
  Building2,
  Activity,
  AlertOctagon,
  ShieldCheck,
  Plus,
  Hospital,
  Flame,
  Search,
  BellPlus,
  Check,
  Users,
  Shield,
  UserPlus,
  Phone,
  QrCode
} from 'lucide-react';
import { User, Warga, PemeriksaanCKG, RekamMedis, Klinik, EarlyWarningAlert } from '../types';

interface SuperAdminDashboardProps {
  currentUser: User;
  users?: User[];
  wargaList: Warga[];
  pemeriksaanList: PemeriksaanCKG[];
  rekamMedisList: RekamMedis[];
  klinikList: Klinik[];
  alerts: EarlyWarningAlert[];
  onAddAlert: (alert: EarlyWarningAlert) => void;
  onAddKlinik: (klinik: Klinik) => void;
  onOpenRegister?: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  currentUser,
  users = [],
  wargaList,
  pemeriksaanList,
  rekamMedisList,
  klinikList,
  alerts,
  onAddAlert,
  onAddKlinik,
  onOpenRegister,
}) => {
  const [showAddKlinikModal, setShowAddKlinikModal] = useState(false);
  const [newKlinikNama, setNewKlinikNama] = useState('');
  const [newKlinikPj, setNewKlinikPj] = useState('');
  const [newKlinikAlamat, setNewKlinikAlamat] = useState('');
  const [newKlinikTelp, setNewKlinikTelp] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'kader' | 'ketua_rw' | 'klinik' | 'warga'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Disease aggregates
  const infectiousCases = rekamMedisList.filter((r) => r.kategoriPenyakit === 'Menular');
  const dbdCount = rekamMedisList.filter((r) => r.namaPenyakit.includes('DBD') || r.namaPenyakit.includes('Dengue')).length;
  const nonInfectiousCount = rekamMedisList.filter((r) => r.kategoriPenyakit === 'Tidak Menular').length;

  const totalSiagaRW = pemeriksaanList.filter((p) => p.status === 'SIAGA').length;

  const handleCreateKlinik = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Klinik = {
      id: `kln-${Date.now().toString().slice(-4)}`,
      kodeKlinik: `KLN-${Date.now().toString().slice(-3)}`,
      nama: newKlinikNama,
      alamat: newKlinikAlamat,
      pjDokter: newKlinikPj,
      telepon: newKlinikTelp,
      status: 'Aktif',
    };
    onAddKlinik(created);
    setShowAddKlinikModal(false);
    setNewKlinikNama('');
    setNewKlinikPj('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold text-purple-200">
              <Building2 className="h-3.5 w-3.5" />
              Puskesmas Kecamatan Sukamaju & Dinas Kesehatan
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
              Surveilans Seluruh RW & Manajemen Faskes Terintegrasi
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
              Pemantauan epidemiologi terpadu tingkat kelurahan, agregasi CKG Posyandu, dan integrasi rekam medis klinik pratama.
            </p>
          </div>

          <button
            onClick={() => setShowAddKlinikModal(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-purple-900 shadow-md hover:bg-purple-50 transition"
          >
            <Plus className="h-4 w-4 text-purple-700" />
            <span>Tambah Faskes / Klinik</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Total Warga Terdata</span>
          <div className="mt-2 text-2xl font-black text-slate-900">{wargaList.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Lintas RT/RW Kelurahan</div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Kasus Penyakit Menular</span>
          <div className="mt-2 text-2xl font-black text-red-600">{infectiousCases.length}</div>
          <div className="text-[11px] text-red-600 font-semibold mt-1">
            {dbdCount} Terkonfirmasi DBD (EWS Siaga)
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Warga CKG Status SIAGA</span>
          <div className="mt-2 text-2xl font-black text-amber-600">{totalSiagaRW}</div>
          <div className="text-[11px] text-slate-500 mt-1">Hipertensi & Gula Darah Tinggi</div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Klinik Mitra Terhubung</span>
          <div className="mt-2 text-2xl font-black text-purple-700">{klinikList.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Semua Status Aktif Melayani</div>
        </div>
      </div>

      {/* Surveillance Real-time Disease Spread */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-red-600" />
                Grafik & Sebaran Penyakit Menular Real-time
              </h3>
              <p className="text-xs text-slate-500">
                Data terhubung dari laporan diagnosa dokter klinik & pemeriksaan Posyandu CKG
              </p>
            </div>
            <span className="rounded-md bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 border border-red-200">
              Live EWS Alert
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {/* Disease 1: DBD */}
            <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" />
                  <span className="font-bold text-red-950">Demam Berdarah Dengue (DBD)</span>
                  <span className="text-[10px] text-red-700 font-mono">ICD-10: A90/A91</span>
                </div>
                <span className="font-extrabold text-red-700">{dbdCount} Kasus Terpantau</span>
              </div>
              <div className="w-full bg-red-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full rounded-full" style={{ width: '75%' }} />
              </div>
              <div className="text-[11px] text-red-800 flex justify-between">
                <span>Klaster Hotspot: <strong>RT 03 / RW 05</strong> (Perlu Fogging & PSN)</span>
                <span>Status: Darurat</span>
              </div>
            </div>

            {/* Disease 2: ISPA */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="font-bold text-amber-950">Infeksi Saluran Pernapasan Akut (ISPA)</span>
                  <span className="text-[10px] text-amber-700 font-mono">ICD-10: J06</span>
                </div>
                <span className="font-extrabold text-amber-800">3 Kasus Terpantau</span>
              </div>
              <div className="w-full bg-amber-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '35%' }} />
              </div>
              <div className="text-[11px] text-amber-800 flex justify-between">
                <span>Klaster: Tersebar merata di RW 02, RW 05</span>
                <span>Status: Terkendali</span>
              </div>
            </div>

            {/* Disease 3: Diare */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="font-bold text-blue-950">Gastroenteritis Akut (Diare)</span>
                  <span className="text-[10px] text-blue-700 font-mono">ICD-10: A09</span>
                </div>
                <span className="font-extrabold text-blue-800">1 Kasus Terpantau</span>
              </div>
              <div className="w-full bg-blue-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '15%' }} />
              </div>
              <div className="text-[11px] text-blue-800 flex justify-between">
                <span>Klaster: RW 05 RT 01</span>
                <span>Status: Normal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Klinik List Management */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Hospital className="h-4 w-4 text-purple-600" />
              Kelola Akun Klinik Mitra
            </h3>
            <span className="text-xs text-slate-400">{klinikList.length} Faskes</span>
          </div>

          <div className="space-y-3">
            {klinikList.map((k) => (
              <div key={k.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 transition text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{k.nama}</span>
                  <span className="text-[10px] rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 font-semibold">
                    {k.status}
                  </span>
                </div>
                <div className="text-slate-600">Dokter PJ: {k.pjDokter}</div>
                <div className="text-slate-500 text-[11px]">{k.alamat}</div>
                <div className="text-purple-700 font-mono text-[10px]">Kode: {k.kodeKlinik} • Telp: {k.telepon}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roster & Manajemen Akun Petugas Wilayah (RT, RW, Kader, Faskes) */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-700" />
              Manajemen Multi-Akun Lingkungan (RT, RW, Kader & Faskes)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola akun pengurus RT, RW, kader posyandu, dan tenaga medis klinik di wilayah binaan Puskesmas.
            </p>
          </div>

          {onOpenRegister && (
            <button
              type="button"
              onClick={onOpenRegister}
              className="flex items-center gap-1.5 rounded-xl bg-purple-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-800 transition"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Daftarkan Akun Petugas Baru</span>
            </button>
          )}
        </div>

        {/* Filter Role & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setUserRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                userRoleFilter === 'all'
                  ? 'bg-purple-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Akun ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setUserRoleFilter('kader')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                userRoleFilter === 'kader'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              RT & Kader ({users.filter((u) => u.role === 'kader').length})
            </button>
            <button
              type="button"
              onClick={() => setUserRoleFilter('ketua_rw')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                userRoleFilter === 'ketua_rw'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ketua RW ({users.filter((u) => u.role === 'ketua_rw').length})
            </button>
            <button
              type="button"
              onClick={() => setUserRoleFilter('klinik')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                userRoleFilter === 'klinik'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Klinik / Dokter ({users.filter((u) => u.role === 'klinik').length})
            </button>
            <button
              type="button"
              onClick={() => setUserRoleFilter('warga')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                userRoleFilter === 'warga'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Warga ({users.filter((u) => u.role === 'warga').length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Cari nama, RT, RW..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 pl-8 text-xs focus:bg-white focus:border-purple-600 focus:outline-hidden focus:ring-1 focus:ring-purple-600"
            />
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Nama Petugas / Pengguna</th>
                <th className="px-4 py-3">Peran & Jabatan</th>
                <th className="px-4 py-3">Wilayah Tugas</th>
                <th className="px-4 py-3">Unit / Posyandu / Faskes</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Kontak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users
                .filter((u) => {
                  if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
                  if (userSearchQuery.trim()) {
                    const q = userSearchQuery.toLowerCase();
                    const matchName = u.nama.toLowerCase().includes(q);
                    const matchUsername = u.username.toLowerCase().includes(q);
                    const matchRt = u.rt ? u.rt.includes(q) : false;
                    const matchRw = u.rw ? u.rw.includes(q) : false;
                    const matchPosyandu = u.posyandu ? u.posyandu.toLowerCase().includes(q) : false;
                    return matchName || matchUsername || matchRt || matchRw || matchPosyandu;
                  }
                  return true;
                })
                .map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>{u.nama}</div>
                      {u.nip && <div className="text-[10px] text-slate-400 font-mono">NIP: {u.nip}</div>}
                      {u.nik && <div className="text-[10px] text-slate-400 font-mono">NIK: {u.nik}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                          u.role === 'kader'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : u.role === 'ketua_rw'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : u.role === 'klinik'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : u.role === 'super_admin'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                        }`}
                      >
                        {u.role === 'kader'
                          ? 'RT / Kader'
                          : u.role === 'ketua_rw'
                          ? 'Ketua RW'
                          : u.role === 'klinik'
                          ? 'Dokter Klinik'
                          : u.role === 'super_admin'
                          ? 'Super Admin'
                          : 'Warga Mandiri'}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{u.jabatan || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      {u.rt && <span className="font-semibold text-slate-800">RT {u.rt} </span>}
                      {u.rw && <span className="text-slate-600">/ RW {u.rw}</span>}
                      {!u.rt && !u.rw && <span className="text-slate-400">Lintas Wilayah</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.posyandu || u.namaKlinik || (u.role === 'super_admin' ? 'Puskesmas Sukamaju' : '-')}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-700">
                      {u.username}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-600">
                      {u.telepon || '-'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Klinik */}
      {showAddKlinikModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Tambah Akun Klinik Mitra</h3>
            <p className="text-xs text-slate-500 mt-0.5">Integrasikan faskes untuk akses scan QR dan rekam medis CKG.</p>

            <form onSubmit={handleCreateKlinik} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Klinik *</label>
                <input
                  type="text"
                  required
                  value={newKlinikNama}
                  onChange={(e) => setNewKlinikNama(e.target.value)}
                  placeholder="Klinik Pratama Kasih Sehat"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dokter Penanggung Jawab *</label>
                <input
                  type="text"
                  required
                  value={newKlinikPj}
                  onChange={(e) => setNewKlinikPj(e.target.value)}
                  placeholder="dr. Ahmad Hidayat"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Faskes</label>
                <input
                  type="text"
                  value={newKlinikAlamat}
                  onChange={(e) => setNewKlinikAlamat(e.target.value)}
                  placeholder="Jl. Raya Sukamaju No. 10"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Telepon Klinik</label>
                <input
                  type="text"
                  value={newKlinikTelp}
                  onChange={(e) => setNewKlinikTelp(e.target.value)}
                  placeholder="021-987654"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddKlinikModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-700 text-white font-semibold hover:bg-purple-800"
                >
                  Simpan Klinik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
