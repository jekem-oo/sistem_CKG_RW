import React, { useState } from 'react';
import {
  Users,
  Shield,
  Activity,
  Building2,
  QrCode,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  Sparkles,
  Phone,
  Home,
  UserPlus
} from 'lucide-react';
import { User, UserRole, Warga, Klinik } from '../types';

interface RegisterFormProps {
  existingUsers: User[];
  klinikList?: Klinik[];
  onRegister: (newUser: User, initialWarga?: Partial<Warga>) => void;
  onSuccessNavigate?: (newUser: User) => void;
  onCancel?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  existingUsers,
  klinikList = [],
  onRegister,
  onSuccessNavigate,
  onCancel,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('kader');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<User | null>(null);

  // Common Fields
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telepon, setTelepon] = useState('');

  // Role: Kader / RT
  const [kaderRt, setKaderRt] = useState('03');
  const [kaderRw, setKaderRw] = useState('05');
  const [kaderJabatan, setKaderJabatan] = useState('Kader Posyandu & CKG');
  const [kaderPosyandu, setKaderPosyandu] = useState('Posyandu Melati');

  // Role: Ketua RW
  const [rwNomor, setRwNomor] = useState('06');
  const [rwJabatan, setRwJabatan] = useState('Ketua RW');
  const [rwKelurahan, setRwKelurahan] = useState('Sukamaju');

  // Role: Klinik / Dokter
  const [klinikNama, setKlinikNama] = useState('');
  const [isNewKlinik, setIsNewKlinik] = useState(false);
  const [klinikCustomNama, setKlinikCustomNama] = useState('');
  const [klinikAlamat, setKlinikAlamat] = useState('Jl. Raya Sukamaju No. 88');
  const [dokterJabatan, setDokterJabatan] = useState('Dokter Penanggung Jawab');

  // Role: Super Admin Puskesmas
  const [adminJabatan, setAdminJabatan] = useState('Staf Surveilans Puskesmas');
  const [adminNip, setAdminNip] = useState('');

  // Role: Warga Mandiri
  const [wargaNik, setWargaNik] = useState('');
  const [wargaNoKk, setWargaNoKk] = useState('');
  const [wargaTglLahir, setWargaTglLahir] = useState('1995-06-15');
  const [wargaGender, setWargaGender] = useState<'L' | 'P'>('L');
  const [wargaRt, setWargaRt] = useState('02');
  const [wargaRw, setWargaRw] = useState('05');
  const [wargaAlamat, setWargaAlamat] = useState('');
  const [wargaGolDarah, setWargaGolDarah] = useState<'A' | 'B' | 'AB' | 'O' | '-'>('O');

  // Auto-generate username suggestion helper
  const handleAutoSuggestUsername = () => {
    const cleanName = nama
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 10);
    if (!cleanName) return;

    if (selectedRole === 'kader') {
      setUsername(`kader.rt${kaderRt}.${cleanName}`);
    } else if (selectedRole === 'ketua_rw') {
      setUsername(`rw${rwNomor}.${cleanName}`);
    } else if (selectedRole === 'klinik') {
      setUsername(`dr.${cleanName}`);
    } else if (selectedRole === 'super_admin') {
      setUsername(`puskesmas.${cleanName}`);
    } else if (selectedRole === 'warga') {
      setUsername(`warga.${cleanName}`);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic Validation
    if (!nama.trim()) {
      setErrorMsg('Nama lengkap harus diisi.');
      return;
    }

    const finalUsername = username.trim().toLowerCase();
    if (!finalUsername) {
      setErrorMsg('Username harus diisi.');
      return;
    }

    // Check username uniqueness
    const usernameTaken = existingUsers.some(
      (u) => u.username.toLowerCase() === finalUsername
    );
    if (usernameTaken) {
      setErrorMsg(`Username "${finalUsername}" sudah digunakan akun lain. Silakan pilih username unik.`);
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg('Kata sandi minimal 4 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    // Role-specific validation & object construction
    let newUser: User;
    let initialWarga: Partial<Warga> | undefined = undefined;

    if (selectedRole === 'kader') {
      if (!kaderRt.trim()) {
        setErrorMsg('Nomor RT harus diisi untuk akun Kader/RT.');
        return;
      }
      newUser = {
        id: `usr-kader-${Date.now().toString().slice(-5)}`,
        username: finalUsername,
        password: password,
        nama: nama.trim(),
        role: 'kader',
        rt: kaderRt.padStart(2, '0'),
        rw: kaderRw.padStart(2, '0'),
        jabatan: kaderJabatan,
        posyandu: kaderPosyandu || `Posyandu RT ${kaderRt}`,
        telepon: telepon || '0812-0000-0000',
        createdAt: new Date().toISOString(),
      };
    } else if (selectedRole === 'ketua_rw') {
      if (!rwNomor.trim()) {
        setErrorMsg('Nomor RW harus diisi.');
        return;
      }
      newUser = {
        id: `usr-rw-${Date.now().toString().slice(-5)}`,
        username: finalUsername,
        password: password,
        nama: nama.trim(),
        role: 'ketua_rw',
        rw: rwNomor.padStart(2, '0'),
        jabatan: `${rwJabatan} ${rwNomor.padStart(2, '0')} ${rwKelurahan}`,
        telepon: telepon || '0811-0000-0000',
        createdAt: new Date().toISOString(),
      };
    } else if (selectedRole === 'klinik') {
      const selectedKlinikName = isNewKlinik
        ? klinikCustomNama.trim()
        : klinikNama || (klinikList[0]?.nama || 'Klinik Pratama');
      if (!selectedKlinikName) {
        setErrorMsg('Silakan tentukan nama Klinik / Faskes Mitra.');
        return;
      }
      const matchedExistingKlinik = klinikList.find((k) => k.nama === selectedKlinikName);
      const klinikId = matchedExistingKlinik ? matchedExistingKlinik.id : `kln-${Date.now().toString().slice(-4)}`;

      newUser = {
        id: `usr-kln-${Date.now().toString().slice(-5)}`,
        username: finalUsername,
        password: password,
        nama: nama.trim(),
        role: 'klinik',
        klinikId: klinikId,
        namaKlinik: selectedKlinikName,
        jabatan: dokterJabatan,
        telepon: telepon || '021-0000-0000',
        createdAt: new Date().toISOString(),
      };
    } else if (selectedRole === 'super_admin') {
      newUser = {
        id: `usr-adm-${Date.now().toString().slice(-5)}`,
        username: finalUsername,
        password: password,
        nama: nama.trim(),
        role: 'super_admin',
        jabatan: adminJabatan,
        nip: adminNip || undefined,
        telepon: telepon || '0812-0000-0000',
        createdAt: new Date().toISOString(),
      };
    } else {
      // Role: Warga Mandiri
      const cleanNik = wargaNik.replace(/\D/g, '');
      if (cleanNik.length !== 16) {
        setErrorMsg('NIK harus 16 digit angka.');
        return;
      }

      newUser = {
        id: `usr-wrg-${Date.now().toString().slice(-5)}`,
        username: finalUsername,
        password: password,
        nama: nama.trim(),
        role: 'warga',
        nik: cleanNik,
        rt: wargaRt.padStart(2, '0'),
        rw: wargaRw.padStart(2, '0'),
        jabatan: `Warga RT ${wargaRt} / RW ${wargaRw}`,
        telepon: telepon || '0878-0000-0000',
        createdAt: new Date().toISOString(),
      };

      initialWarga = {
        nik: cleanNik,
        noKk: wargaNoKk.replace(/\D/g, '') || cleanNik,
        nama: nama.trim(),
        tanggalLahir: wargaTglLahir,
        jenisKelamin: wargaGender,
        alamat: wargaAlamat.trim() || `Jl. Mawar RT ${wargaRt} / RW ${wargaRw}`,
        rt: wargaRt.padStart(2, '0'),
        rw: wargaRw.padStart(2, '0'),
        kelurahan: 'Sukajadi',
        telepon: telepon || '0878-0000-0000',
        golonganDarah: wargaGolDarah,
        pekerjaan: 'Warga',
      };
    }

    // Call onRegister
    onRegister(newUser, initialWarga);
    setRegisteredUser(newUser);
  };

  // If successfully registered, show friendly human confirmation card
  if (registeredUser) {
    return (
      <div className="text-center py-6 px-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-4 animate-in zoom-in-95">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          Akun Berhasil Didaftarkan!
        </h3>
        <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
          Selamat datang, <strong>{registeredUser.nama}</strong>. Akun Anda telah aktif dan tersimpan di sistem Satu Data Kesehatan RW.
        </p>

        {/* Credentials Summary Card */}
        <div className="mt-5 max-w-sm mx-auto rounded-xl bg-slate-50 p-4 border border-slate-200 text-left text-xs space-y-2">
          <div className="flex justify-between border-b border-slate-200 pb-1.5">
            <span className="text-slate-500">Peran Akun:</span>
            <span className="font-semibold text-emerald-700 capitalize">
              {registeredUser.role === 'kader'
                ? `Kader / RT (RT ${registeredUser.rt} / RW ${registeredUser.rw})`
                : registeredUser.role === 'ketua_rw'
                ? `Ketua RW (RW ${registeredUser.rw})`
                : registeredUser.role === 'klinik'
                ? `Dokter (${registeredUser.namaKlinik})`
                : registeredUser.role === 'super_admin'
                ? 'Super Admin Puskesmas'
                : `Warga Mandiri (NIK: ${registeredUser.nik})`}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-1.5">
            <span className="text-slate-500">Username Login:</span>
            <span className="font-mono font-bold text-slate-800">{registeredUser.username}</span>
          </div>
          {registeredUser.posyandu && (
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500">Posyandu / Unit:</span>
              <span className="font-medium text-slate-800">{registeredUser.posyandu}</span>
            </div>
          )}
          {registeredUser.telepon && (
            <div className="flex justify-between">
              <span className="text-slate-500">No. Kontak:</span>
              <span className="text-slate-800">{registeredUser.telepon}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onSuccessNavigate ? onSuccessNavigate(registeredUser) : window.location.reload()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95"
          >
            <span>Langsung Masuk ke Akun Ini</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Kembali ke Menu Utama
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header text */}
      <div>
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
          <UserPlus className="h-4 w-4" />
          Pendaftaran Multi-Akun Lingkungan
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Daftarkan Akun RT, RW, Kader, Faskes atau Warga
        </h3>
        <p className="text-xs text-slate-600 mt-0.5">
          Setiap RT, RW, dan Posyandu dapat memiliki akun mandiri untuk mengelola pemeriksaan CKG wilayah masing-masing.
        </p>
      </div>

      {/* Role Selection Grid */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Pilih Peran Akun yang Hendak Didaftarkan:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {/* Kader / RT */}
          <button
            type="button"
            onClick={() => handleRoleChange('kader')}
            className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
              selectedRole === 'kader'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/20 shadow-xs'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${selectedRole === 'kader' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-xs">RT / Kader Posyandu</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Untuk Ibu Kader Posyandu, Pengurus RT 01, RT 02, RT 03, dst
              </div>
            </div>
          </button>

          {/* Ketua RW */}
          <button
            type="button"
            onClick={() => handleRoleChange('ketua_rw')}
            className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
              selectedRole === 'ketua_rw'
                ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-600/20 shadow-xs'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${selectedRole === 'ketua_rw' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-xs">Ketua / Pengurus RW</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Dashboard agregat wilayah, Early Warning System (EWS) RW
              </div>
            </div>
          </button>

          {/* Klinik / Dokter */}
          <button
            type="button"
            onClick={() => handleRoleChange('klinik')}
            className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
              selectedRole === 'klinik'
                ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-600/20 shadow-xs'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${selectedRole === 'klinik' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-xs">Klinik / Dokter Mitra</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Dokter faskes mitra untuk scan rujukan & input rekam medis
              </div>
            </div>
          </button>

          {/* Super Admin Puskesmas */}
          <button
            type="button"
            onClick={() => handleRoleChange('super_admin')}
            className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
              selectedRole === 'super_admin'
                ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-600/20 shadow-xs'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${selectedRole === 'super_admin' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-xs">Puskesmas / Dinas</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Surveilans lintas RW, rilis alert EWS wabah penyakit
              </div>
            </div>
          </button>

          {/* Warga Mandiri */}
          <button
            type="button"
            onClick={() => handleRoleChange('warga')}
            className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 sm:col-span-2 ${
              selectedRole === 'warga'
                ? 'border-cyan-600 bg-cyan-50 text-cyan-950 ring-2 ring-cyan-600/20 shadow-xs'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${selectedRole === 'warga' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-xs">Warga Mandiri (Warga / Pasien)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Mendaftar menggunakan NIK untuk melihat kartu QR & riwayat CKG keluarga
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: General Info */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="h-4 w-4 text-emerald-600" />
            Identitas Pengguna
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nama Lengkap & Gelar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                onBlur={handleAutoSuggestUsername}
                placeholder={
                  selectedRole === 'kader'
                    ? 'misal: Ibu Marlina Kusumawati'
                    : selectedRole === 'ketua_rw'
                    ? 'misal: Bpk. H. Muhammad Yasin'
                    : selectedRole === 'klinik'
                    ? 'misal: dr. Anita Rahayu, Sp.A'
                    : selectedRole === 'super_admin'
                    ? 'misal: drg. Suryana'
                    : 'misal: Budi Santoso'
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nomor WhatsApp / HP
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs pl-8 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
                <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Role specific identity fields */}
          {selectedRole === 'kader' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nomor RT <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kaderRt}
                  onChange={(e) => setKaderRt(e.target.value)}
                  placeholder="03"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nomor RW <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kaderRw}
                  onChange={(e) => setKaderRw(e.target.value)}
                  placeholder="05"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Jabatan / Penugasan
                </label>
                <select
                  value={kaderJabatan}
                  onChange={(e) => setKaderJabatan(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="Kader Posyandu & CKG">Kader Posyandu & CKG</option>
                  <option value="Ketua RT">Ketua RT</option>
                  <option value="Sekretaris RT">Sekretaris RT</option>
                  <option value="Kader Posyandu Balita / KMS">Kader Posyandu Balita (KMS)</option>
                  <option value="Kader Posbindu Lansia">Kader Posbindu Lansia</option>
                  <option value="Kader Dasawisma">Kader Dasawisma</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Posyandu
                </label>
                <input
                  type="text"
                  value={kaderPosyandu}
                  onChange={(e) => setKaderPosyandu(e.target.value)}
                  placeholder="misal: Posyandu Anggrek"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          )}

          {selectedRole === 'ketua_rw' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nomor RW yang Dipimpin <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={rwNomor}
                  onChange={(e) => setRwNomor(e.target.value)}
                  placeholder="06"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Jabatan Pengurus RW
                </label>
                <select
                  value={rwJabatan}
                  onChange={(e) => setRwJabatan(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="Ketua RW">Ketua RW</option>
                  <option value="Sekretaris RW">Sekretaris RW</option>
                  <option value="Bendahara RW">Bendahara RW</option>
                  <option value="Seksi Kesehatan Masyarakat RW">Seksi Kesehatan Masyarakat RW</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Kelurahan / Desa
                </label>
                <input
                  type="text"
                  value={rwKelurahan}
                  onChange={(e) => setRwKelurahan(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          )}

          {selectedRole === 'klinik' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Klinik / Faskes Mitra <span className="text-red-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {!isNewKlinik ? (
                    <select
                      value={klinikNama}
                      onChange={(e) => {
                        if (e.target.value === '__new__') {
                          setIsNewKlinik(true);
                        } else {
                          setKlinikNama(e.target.value);
                        }
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="">-- Pilih Klinik yang Terdaftar --</option>
                      {klinikList.map((k) => (
                        <option key={k.id} value={k.nama}>
                          {k.nama} ({k.kodeKlinik})
                        </option>
                      ))}
                      <option value="__new__">+ Daftarkan Nama Klinik Baru</option>
                    </select>
                  ) : (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        required
                        value={klinikCustomNama}
                        onChange={(e) => setKlinikCustomNama(e.target.value)}
                        placeholder="Ketik Nama Klinik Baru..."
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={() => setIsNewKlinik(false)}
                        className="text-[11px] text-blue-600 hover:underline"
                      >
                        ← Pilih dari klinik yang sudah ada
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Jabatan Dokter / Tenaga Medis
                </label>
                <input
                  type="text"
                  value={dokterJabatan}
                  onChange={(e) => setDokterJabatan(e.target.value)}
                  placeholder="Dokter Penanggung Jawab / Dokter Umum"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          )}

          {selectedRole === 'super_admin' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Unit / Jabatan Puskesmas
                </label>
                <input
                  type="text"
                  value={adminJabatan}
                  onChange={(e) => setAdminJabatan(e.target.value)}
                  placeholder="Staf Surveilans / PJ Program CKG"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  NIP Pegawai (Opsional)
                </label>
                <input
                  type="text"
                  value={adminNip}
                  onChange={(e) => setAdminNip(e.target.value)}
                  placeholder="19820512..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          )}

          {/* Role: Warga */}
          {selectedRole === 'warga' && (
            <div className="space-y-3 pt-1 border-t border-slate-200 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    NIK 16 Digit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={wargaNik}
                    onChange={(e) => setWargaNik(e.target.value)}
                    placeholder="320101..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    No. Kartu Keluarga (KK)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={wargaNoKk}
                    onChange={(e) => setWargaNoKk(e.target.value)}
                    placeholder="320101..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tgl Lahir
                  </label>
                  <input
                    type="date"
                    value={wargaTglLahir}
                    onChange={(e) => setWargaTglLahir(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={wargaGender}
                    onChange={(e) => setWargaGender(e.target.value as 'L' | 'P')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    RT Domisili
                  </label>
                  <input
                    type="text"
                    value={wargaRt}
                    onChange={(e) => setWargaRt(e.target.value)}
                    placeholder="02"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    RW Domisili
                  </label>
                  <input
                    type="text"
                    value={wargaRw}
                    onChange={(e) => setWargaRw(e.target.value)}
                    placeholder="05"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Alamat Rumah Lengkap
                </label>
                <input
                  type="text"
                  value={wargaAlamat}
                  onChange={(e) => setWargaAlamat(e.target.value)}
                  placeholder="misal: Jl. Kenanga No. 14, RT 02 / RW 05"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Account Security (Username & Password) */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-emerald-600" />
              Kredensial Akun (Username & Kata Sandi)
            </div>
            <button
              type="button"
              onClick={handleAutoSuggestUsername}
              className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Saran Username Otomatis
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Username Akun <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                placeholder="misal: kader.rt03.siti"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              />
              <span className="text-[10px] text-slate-400">Gunakan huruf kecil tanpa spasi</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 4 karakter"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Ulangi Kata Sandi <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Batal
            </button>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition active:scale-98"
          >
            <UserPlus className="h-4 w-4" />
            <span>Daftarkan Akun Sekarang</span>
          </button>
        </div>
      </form>
    </div>
  );
};
