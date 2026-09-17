import React, { useState, useMemo } from 'react';
import {
  Camera,
  UserPlus,
  FileSpreadsheet,
  Printer,
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Scale,
  Activity,
  Droplets,
  Plus,
  Baby,
  Heart,
  ShieldCheck,
  Info,
  Users,
  Sparkles,
  ArrowRight,
  Smile
} from 'lucide-react';
import { User, Warga, PemeriksaanCKG } from '../types';
import {
  evaluateCKG,
  evaluateBalitaCKG,
  calculateAgeInMonths,
  formatAgeFriendly
} from '../utils/healthCalculator';
import { exportCKGToExcel } from '../utils/exportExcel';
import { QRScannerModal } from '../components/QRScannerModal';
import { ThermalReceiptModal } from '../components/ThermalReceiptModal';
import { WargaCardModal } from '../components/WargaCardModal';

interface KaderDashboardProps {
  currentUser: User;
  wargaList: Warga[];
  pemeriksaanList: PemeriksaanCKG[];
  onAddWarga: (warga: Warga) => void;
  onAddPemeriksaan: (pemeriksaan: PemeriksaanCKG) => void;
}

export const KaderDashboard: React.FC<KaderDashboardProps> = ({
  currentUser,
  wargaList,
  pemeriksaanList,
  onAddWarga,
  onAddPemeriksaan,
}) => {
  // Modal states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PemeriksaanCKG | null>(null);
  const [selectedWargaCard, setSelectedWargaCard] = useState<Warga | null>(null);
  const [activeTab, setActiveTab] = useState<'input_ckg' | 'daftar_warga' | 'riwayat_ckg'>('input_ckg');

  // Input CKG Form State
  const [selectedNik, setSelectedNik] = useState<string>('3201011205750003');

  // Dewasa / Lansia Parameters
  const [sistolik, setSistolik] = useState<number>(145);
  const [diastolik, setDiastolik] = useState<number>(92);
  const [gulaDarah, setGulaDarah] = useState<number>(215);
  const [kolesterol, setKolesterol] = useState<number>(210);
  const [asamUrat, setAsamUrat] = useState<number>(6.5);
  const [beratBadan, setBeratBadan] = useState<number>(72);
  const [tinggiBadan, setTinggiBadan] = useState<number>(168);
  const [lingkarPerut, setLingkarPerut] = useState<number>(86);

  // Balita & Anak Posyandu Parameters
  const [balitaBeratBadan, setBalitaBeratBadan] = useState<number>(10.8);
  const [balitaTinggiBadan, setBalitaTinggiBadan] = useState<number>(82);
  const [balitaLingkarKepala, setBalitaLingkarKepala] = useState<number>(47.0);
  const [balitaLingkarLengan, setBalitaLingkarLengan] = useState<number>(14.5);
  const [balitaImunisasi, setBalitaImunisasi] = useState<string>('DPT-HB-Hib 3 & Polio 4');
  const [balitaVitaminA, setBalitaVitaminA] = useState<boolean>(true);
  const [balitaObatCacing, setBalitaObatCacing] = useState<boolean>(false);
  const [balitaAsiEksklusif, setBalitaAsiEksklusif] = useState<boolean>(true);

  // Shared Notes / Heartfelt Advice from Kader
  const [pesanKasihKader, setPesanKasihKader] = useState<string>('');
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // New Warga Form State
  const [kategoriPendaftaran, setKategoriPendaftaran] = useState<'dewasa' | 'anak'>('dewasa');
  const [isAnakTanpaNik, setIsAnakTanpaNik] = useState<boolean>(true);
  const [newNik, setNewNik] = useState('');
  const [newNoKk, setNewNoKk] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newNamaPanggilan, setNewNamaPanggilan] = useState('');
  const [newNamaIbu, setNewNamaIbu] = useState('');
  const [newAnakKe, setNewAnakKe] = useState<number>(1);
  const [newPunyaKia, setNewPunyaKia] = useState<boolean>(true);
  const [newTanggalLahir, setNewTanggalLahir] = useState('1992-06-15');
  const [newGender, setNewGender] = useState<'L' | 'P'>('L');
  const [newAlamat, setNewAlamat] = useState('');
  const [newRt, setNewRt] = useState(currentUser.rt || '02');
  const [newRw, setNewRw] = useState(currentUser.rw || '05');
  const [newTelepon, setNewTelepon] = useState('');
  const [newGoldar, setNewGoldar] = useState<'A' | 'B' | 'AB' | 'O' | '-'>('O');
  const [newPekerjaan, setNewPekerjaan] = useState('');

  // Search & Filter
  const [searchWargaQuery, setSearchWargaQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState<'semua' | 'dewasa' | 'anak'>('semua');

  // Find active warga from selectedNik
  const activeWarga = useMemo(() => {
    return wargaList.find((w) => w.nik === selectedNik) || wargaList[0];
  }, [wargaList, selectedNik]);

  // Check if current active warga is a child / balita
  const isWargaAnak = useMemo(() => {
    if (!activeWarga) return false;
    return (
      activeWarga.isAnakTanpaNik ||
      activeWarga.kategoriUsia === 'balita' ||
      activeWarga.kategoriUsia === 'anak'
    );
  }, [activeWarga]);

  // Age in months for balita
  const activeBalitaAgeMonths = useMemo(() => {
    if (!activeWarga) return 18;
    return calculateAgeInMonths(activeWarga.tanggalLahir);
  }, [activeWarga]);

  // LIVE Adult Health Evaluation (Tensi >= 140/90 or GDS > 200 -> SIAGA)
  const adultHealthEvaluation = useMemo(() => {
    return evaluateCKG(sistolik, diastolik, gulaDarah, kolesterol, beratBadan, tinggiBadan);
  }, [sistolik, diastolik, gulaDarah, kolesterol, beratBadan, tinggiBadan]);

  // LIVE Balita KMS Evaluation
  const balitaEvaluation = useMemo(() => {
    return evaluateBalitaCKG(
      activeBalitaAgeMonths,
      balitaBeratBadan,
      balitaTinggiBadan,
      balitaLingkarLengan
    );
  }, [activeBalitaAgeMonths, balitaBeratBadan, balitaTinggiBadan, balitaLingkarLengan]);

  // Handle Scan Success from Camera
  const handleScanSuccess = (scannedNik: string) => {
    setIsScannerOpen(false);
    setSelectedNik(scannedNik);
    setActiveTab('input_ckg');
    const matched = wargaList.find((w) => w.nik === scannedNik);
    if (!matched) {
      alert(`Warga dengan NIK/ID ${scannedNik} belum terdaftar. Form registrasi telah disiapkan untuk Anda.`);
      setNewNik(scannedNik);
      setActiveTab('daftar_warga');
    }
  };

  // Submit CKG Check (supports both adult and balita)
  const handleSubmitCKG = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWarga) {
      alert('Silakan pilih atau scan warga terlebih dahulu!');
      return;
    }

    let newPemeriksaan: PemeriksaanCKG;

    if (isWargaAnak) {
      // Balita / Anak Posyandu
      newPemeriksaan = {
        id: `ckg-${Date.now().toString().slice(-6)}`,
        wargaId: activeWarga.id,
        nik: activeWarga.nik,
        namaWarga: activeWarga.nama,
        rt: activeWarga.rt,
        rw: activeWarga.rw,
        tanggal: new Date().toISOString(),
        kaderId: currentUser.id,
        namaKader: currentUser.nama,
        jenisPemeriksaan: 'balita_anak',
        beratBadan: balitaBeratBadan,
        tinggiBadan: balitaTinggiBadan,
        bmi: balitaTinggiBadan > 0 ? Number((balitaBeratBadan / Math.pow(balitaTinggiBadan / 100, 2)).toFixed(1)) : 0,
        lingkarKepala: balitaLingkarKepala,
        lingkarLenganAtas: balitaLingkarLengan,
        statusGiziKms: balitaEvaluation.statusGizi,
        imunisasiDiberikan: balitaImunisasi,
        vitaminA: balitaVitaminA,
        obatCacing: balitaObatCacing,
        asiEksklusif: balitaAsiEksklusif,
        status: balitaEvaluation.status,
        alasanSiaga: balitaEvaluation.reasons,
        catatanKader:
          pesanKasihKader ||
          (balitaEvaluation.status === 'SIAGA'
            ? 'Perlu pemantauan gizi dan PMT Posyandu'
            : 'Tumbuh kembang anak sehat dan lincah'),
        pesanKasihKader:
          pesanKasihKader ||
          'Terus pantau tumbuh kembang si kecil dengan makanan bergizi dan kasih sayang.',
        dirujukKeKlinik: balitaEvaluation.status === 'SIAGA',
      };
    } else {
      // Dewasa / Lansia
      newPemeriksaan = {
        id: `ckg-${Date.now().toString().slice(-6)}`,
        wargaId: activeWarga.id,
        nik: activeWarga.nik,
        namaWarga: activeWarga.nama,
        rt: activeWarga.rt,
        rw: activeWarga.rw,
        tanggal: new Date().toISOString(),
        kaderId: currentUser.id,
        namaKader: currentUser.nama,
        jenisPemeriksaan: 'dewasa',
        sistolik,
        diastolik,
        gulaDarah,
        kolesterol,
        asamUrat,
        beratBadan,
        tinggiBadan,
        lingkarPerut,
        bmi: adultHealthEvaluation.bmi,
        status: adultHealthEvaluation.status,
        alasanSiaga: adultHealthEvaluation.reasons,
        catatanKader:
          pesanKasihKader ||
          (adultHealthEvaluation.status === 'SIAGA'
            ? 'Perlu konsultasi klinik segera'
            : 'Pemeriksaan rutin sehat dan bugar'),
        pesanKasihKader:
          pesanKasihKader ||
          (adultHealthEvaluation.status === 'SIAGA'
            ? 'Jaga pola makan, kurangi garam dan gorengan, luangkan waktu istirahat cukup ya Pak/Bu.'
            : 'Alhamdulillah kondisi baik, pertahankan jalan santai pagi dan pola makan sehat.'),
        dirujukKeKlinik: adultHealthEvaluation.status === 'SIAGA',
      };
    }

    onAddPemeriksaan(newPemeriksaan);
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 4000);

    // Auto open thermal receipt for instant printing
    setSelectedReceipt(newPemeriksaan);
  };

  // Submit New Warga Registration
  const handleSubmitNewWarga = (e: React.FormEvent) => {
    e.preventDefault();

    let finalNik = newNik.trim();

    if (kategoriPendaftaran === 'anak') {
      // Child registration:
      if (!finalNik) {
        // Generate friendly KIA number from parent KK or timestamp
        const kkSuffix = newNoKk ? newNoKk.slice(-6) : Math.floor(100000 + Math.random() * 900000);
        finalNik = `KIA-${kkSuffix}-${String(newAnakKe).padStart(2, '0')}`;
      }
    } else {
      // Adult registration: requires valid 16 digit NIK
      if (!finalNik || finalNik.length < 16) {
        alert('Untuk warga dewasa, NIK KTP harus 16 digit angka valid.');
        return;
      }
    }

    if (wargaList.some((w) => w.nik === finalNik)) {
      alert(`Nomor identitas ${finalNik} sudah pernah didaftarkan sebelumnya!`);
      return;
    }

    const calculatedMonths = calculateAgeInMonths(newTanggalLahir);
    const categoryAge =
      kategoriPendaftaran === 'anak'
        ? calculatedMonths <= 60
          ? 'balita'
          : 'anak'
        : calculatedMonths >= 60 * 12
        ? 'lansia'
        : 'dewasa';

    const createdWarga: Warga = {
      id: `wrg-${Date.now().toString().slice(-6)}`,
      nik: finalNik,
      noKk: newNoKk || finalNik,
      nama: newNama,
      namaPanggilan: newNamaPanggilan || undefined,
      namaIbuOrangTua: kategoriPendaftaran === 'anak' ? newNamaIbu : undefined,
      anakKe: kategoriPendaftaran === 'anak' ? newAnakKe : undefined,
      punyaBukuKia: kategoriPendaftaran === 'anak' ? newPunyaKia : undefined,
      isAnakTanpaNik: kategoriPendaftaran === 'anak' && (!newNik || newNik.startsWith('KIA')),
      kategoriUsia: categoryAge,
      tanggalLahir: newTanggalLahir,
      jenisKelamin: newGender,
      alamat: newAlamat || `Jl. Kenanga RT ${newRt} / RW ${newRw}`,
      rt: newRt,
      rw: newRw,
      kelurahan: 'Sukajadi',
      telepon: newTelepon || (kategoriPendaftaran === 'anak' ? 'Kontak Ibu/Wali' : '0812-0000-0000'),
      golonganDarah: newGoldar,
      pekerjaan: kategoriPendaftaran === 'anak' ? 'Anak / Balita' : newPekerjaan || 'Warga',
      tanggalRegistrasi: new Date().toISOString().split('T')[0],
      registeredByKaderId: currentUser.id,
    };

    onAddWarga(createdWarga);
    setSelectedWargaCard(createdWarga);
    setSelectedNik(createdWarga.nik);

    // Reset Form
    setNewNik('');
    setNewNama('');
    setNewNamaPanggilan('');
    setNewNamaIbu('');
    setNewNoKk('');
    setNewAlamat('');
    setNewTelepon('');
  };

  // Filtered resident list with search and friendly category selector
  const filteredWarga = useMemo(() => {
    return wargaList.filter((w) => {
      // Category filter
      if (filterKategori === 'anak') {
        const isChild = w.isAnakTanpaNik || w.kategoriUsia === 'balita' || w.kategoriUsia === 'anak';
        if (!isChild) return false;
      }
      if (filterKategori === 'dewasa') {
        const isChild = w.isAnakTanpaNik || w.kategoriUsia === 'balita' || w.kategoriUsia === 'anak';
        if (isChild) return false;
      }

      // Text Search
      if (!searchWargaQuery.trim()) return true;
      const q = searchWargaQuery.toLowerCase();
      return (
        w.nama.toLowerCase().includes(q) ||
        (w.namaPanggilan && w.namaPanggilan.toLowerCase().includes(q)) ||
        (w.namaIbuOrangTua && w.namaIbuOrangTua.toLowerCase().includes(q)) ||
        w.nik.toLowerCase().includes(q) ||
        w.rt.includes(q)
      );
    });
  }, [wargaList, searchWargaQuery, filterKategori]);

  const kaderPemeriksaanHistory = useMemo(() => {
    return pemeriksaanList;
  }, [pemeriksaanList]);

  // Counts
  const balitaCount = useMemo(
    () =>
      wargaList.filter(
        (w) => w.isAnakTanpaNik || w.kategoriUsia === 'balita' || w.kategoriUsia === 'anak'
      ).length,
    [wargaList]
  );
  const dewasaCount = wargaList.length - balitaCount;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Warm, Neighborly & Helpful */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-5 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold text-emerald-100 backdrop-blur-xs">
                <Heart className="h-3.5 w-3.5 text-pink-300" />
                Posyandu & CKG Siklus Hidup RT {currentUser.rt || '02'} / RW {currentUser.rw || '05'}
              </span>
              <span className="text-xs text-emerald-200">
                Kader: <strong>{currentUser.nama}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Meja Pelayanan Sehat Warga & Posyandu
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Selamat bertugas, Ibu Kader! Layani warga dari bayi/balita hingga lansia dengan hangat.
              Bila warga lupa membawa KTP atau anak balita belum memiliki NIK, sistem dapat mencari lewat nama ibu atau menerbitkan <strong>Kartu KIA Posyandu</strong> secara otomatis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-900 shadow-md hover:bg-emerald-50 transition active:scale-95"
            >
              <Camera className="h-4 w-4 text-emerald-700" />
              <span>Scan QR Warga / Anak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Bar */}
      {showSuccessNotification && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-300 p-4 text-emerald-900 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <strong className="block text-sm font-semibold">Pemeriksaan Berhasil Dicatat!</strong>
              Data tersimpan rapi di sistem Satu Data RW dan struk kasir thermal siap dicetak.
            </div>
          </div>
          <button
            onClick={() => setShowSuccessNotification(false)}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Friendly Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-1 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('input_ckg')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 ${
              activeTab === 'input_ckg'
                ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>1. Meja Pemeriksaan (Dewasa & Balita)</span>
          </button>

          <button
            onClick={() => setActiveTab('daftar_warga')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 ${
              activeTab === 'daftar_warga'
                ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>2. Pendaftaran Warga & Bayi/Anak (KIA)</span>
          </button>

          <button
            onClick={() => setActiveTab('riwayat_ckg')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 ${
              activeTab === 'riwayat_ckg'
                ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Printer className="h-4 w-4" />
            <span>3. Riwayat & Cetak Struk ({kaderPemeriksaanHistory.length})</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: INPUT CKG FISIK (DEWASA ATAU BALITA) */}
      {activeTab === 'input_ckg' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Input Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {isWargaAnak ? (
                      <span className="flex items-center gap-1 rounded-full bg-pink-100 text-pink-800 px-2.5 py-0.5 text-xs font-bold">
                        <Baby className="h-3.5 w-3.5" /> Posyandu Balita (KMS)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold">
                        <HeartPulse className="h-3.5 w-3.5" /> CKG Dewasa & Lansia
                      </span>
                    )}
                    <h3 className="text-base font-bold text-slate-800">
                      {isWargaAnak
                        ? 'Pemeriksaan Tumbuh Kembang & Gizi Balita'
                        : 'Pemeriksaan Fisik CKG Warga'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {isWargaAnak
                      ? 'Catat hasil timbang badan, tinggi/panjang, lingkar kepala, dan imunisasi buku pink'
                      : 'Masukkan hasil tensimeter, glukometer, timbangan, dan rekam kondisi kesehatan'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Scan QR</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitCKG} className="mt-5 space-y-5">
                {/* Warga Selection Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Pilih Warga yang Sedang Diperiksa:
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Cari nama atau NIK di bawah
                    </span>
                  </div>

                  <select
                    value={selectedNik}
                    onChange={(e) => setSelectedNik(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-semibold text-slate-800 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  >
                    {wargaList.map((w) => {
                      const isChild = w.isAnakTanpaNik || w.kategoriUsia === 'balita' || w.kategoriUsia === 'anak';
                      return (
                        <option key={w.id} value={w.nik}>
                          {isChild ? '👶 [ANAK/BALITA] ' : '👤 [WARGA] '}
                          {w.nama} {w.namaPanggilan ? `(${w.namaPanggilan})` : ''} — {w.isAnakTanpaNik ? 'ID KIA:' : 'NIK:'} {w.nik} (RT {w.rt})
                        </option>
                      );
                    })}
                  </select>

                  {/* Active Warga Friendly Card */}
                  {activeWarga && (
                    <div className={`mt-3 rounded-2xl p-4 border transition ${
                      isWargaAnak
                        ? 'bg-gradient-to-r from-pink-50/70 via-rose-50/50 to-amber-50/50 border-pink-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${
                            isWargaAnak ? 'bg-pink-600 text-sm' : 'bg-emerald-700 text-sm'
                          }`}>
                            {isWargaAnak ? <Baby className="h-6 w-6" /> : activeWarga.nama.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {activeWarga.nama}
                              </span>
                              {activeWarga.namaPanggilan && (
                                <span className="text-xs font-medium text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                                  Panggilan: {activeWarga.namaPanggilan}
                                </span>
                              )}
                              <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                {formatAgeFriendly(activeWarga.tanggalLahir)}
                              </span>
                            </div>

                            <div className="text-xs text-slate-600 mt-0.5 space-x-2">
                              <span>
                                {activeWarga.isAnakTanpaNik ? 'No. KIA / KK:' : 'NIK:'}{' '}
                                <strong className="font-mono text-slate-800">{activeWarga.nik}</strong>
                              </span>
                              <span>• RT {activeWarga.rt} / RW {activeWarga.rw}</span>
                              {activeWarga.namaIbuOrangTua && (
                                <span className="text-pink-800 font-medium">
                                  • Ibu: {activeWarga.namaIbuOrangTua}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedWargaCard(activeWarga)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition ${
                            isWargaAnak
                              ? 'bg-pink-600 text-white hover:bg-pink-700'
                              : 'bg-emerald-700 text-white hover:bg-emerald-800'
                          }`}
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          <span>Lihat Kartu Digital</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* CONDITIONAL FORM: BALITA POSYANDU vs DEWASA */}
                {isWargaAnak ? (
                  /* ================= BALITA & ANAK SECTION ================= */
                  <div className="space-y-4">
                    <div className="rounded-xl bg-pink-50/50 p-4 border border-pink-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-pink-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Baby className="h-4 w-4 text-pink-600" />
                          Hasil Pengukuran Tumbuh Kembang (Usia: {activeBalitaAgeMonths} Bulan)
                        </span>
                        <span className="text-[11px] text-pink-700 font-medium">
                          Berdasarkan Standar KMS Kemenkes RI
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Berat Badan */}
                        <div className="rounded-xl bg-white p-3 border border-pink-200">
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Berat Badan (kg) *
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="1.5"
                            max="60"
                            required
                            value={balitaBeratBadan}
                            onChange={(e) => setBalitaBeratBadan(Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-300 p-2 text-base font-bold text-center text-slate-900 focus:border-pink-500"
                          />
                          <span className="text-[10px] text-slate-500 block text-center mt-1">
                            Ideal: ~{(activeBalitaAgeMonths * 0.4 + 4.5).toFixed(1)} kg
                          </span>
                        </div>

                        {/* Tinggi / Panjang Badan */}
                        <div className="rounded-xl bg-white p-3 border border-pink-200">
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Panjang/Tinggi (cm) *
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="40"
                            max="160"
                            required
                            value={balitaTinggiBadan}
                            onChange={(e) => setBalitaTinggiBadan(Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-300 p-2 text-base font-bold text-center text-slate-900 focus:border-pink-500"
                          />
                          <span className="text-[10px] text-slate-500 block text-center mt-1">
                            Tinggi berdiri/terlentang
                          </span>
                        </div>

                        {/* Lingkar Kepala */}
                        <div className="rounded-xl bg-white p-3 border border-pink-200">
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Lingkar Kepala (cm)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="30"
                            max="60"
                            value={balitaLingkarKepala}
                            onChange={(e) => setBalitaLingkarKepala(Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-300 p-2 text-base font-bold text-center text-slate-900 focus:border-pink-500"
                          />
                          <span className="text-[10px] text-slate-500 block text-center mt-1">
                            Pita ukur kepala
                          </span>
                        </div>

                        {/* Lingkar Lengan Atas (LiLA) */}
                        <div className="rounded-xl bg-white p-3 border border-pink-200">
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            LiLA (cm) *
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="8"
                            max="25"
                            required
                            value={balitaLingkarLengan}
                            onChange={(e) => setBalitaLingkarLengan(Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-300 p-2 text-base font-bold text-center text-slate-900 focus:border-pink-500"
                          />
                          <span className={`text-[10px] block text-center mt-1 ${balitaLingkarLengan < 12.5 ? 'text-amber-700 font-bold' : 'text-slate-500'}`}>
                            {balitaLingkarLengan < 12.5 ? '⚠️ <12.5 cm (Waspada Kurang)' : 'Normal: ≥ 12.5 cm'}
                          </span>
                        </div>
                      </div>

                      {/* Imunisasi & Vitamin */}
                      <div className="mt-4 pt-3 border-t border-pink-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Imunisasi / Vaksin Diberikan Hari Ini:
                          </label>
                          <select
                            value={balitaImunisasi}
                            onChange={(e) => setBalitaImunisasi(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs font-medium bg-white"
                          >
                            <option value="Tidak ada imunisasi bulan ini">Tidak ada imunisasi bulan ini</option>
                            <option value="Hepatitis B (HB-0)">Hepatitis B (HB-0)</option>
                            <option value="BCG & Polio 1">BCG & Polio 1 (Usia 1 Bulan)</option>
                            <option value="DPT-HB-Hib 1 & Polio 2 & PCV 1">DPT-HB-Hib 1 & Polio 2 & PCV 1 (Usia 2 Bulan)</option>
                            <option value="DPT-HB-Hib 2 & Polio 3 & PCV 2">DPT-HB-Hib 2 & Polio 3 & PCV 2 (Usia 3 Bulan)</option>
                            <option value="DPT-HB-Hib 3 & Polio 4 & IPV 1">DPT-HB-Hib 3 & Polio 4 & IPV 1 (Usia 4 Bulan)</option>
                            <option value="Campak-Rubella (MR) & IPV 2">Campak-Rubella (MR) & IPV 2 (Usia 9 Bulan)</option>
                            <option value="DPT-HB-Hib Lanjutan (Booster)">DPT-HB-Hib Lanjutan / Booster (Usia 18 Bulan)</option>
                            <option value="Campak-Rubella (MR) Booster">Campak-Rubella (MR) Booster (Usia 18 Bulan)</option>
                            <option value="Imunisasi Dasar Lengkap (IDL)">Sudah Imunisasi Dasar Lengkap (IDL)</option>
                          </select>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-4 sm:pt-6">
                          <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={balitaVitaminA}
                              onChange={(e) => setBalitaVitaminA(e.target.checked)}
                              className="h-4 w-4 text-pink-600 rounded border-slate-300"
                            />
                            <span>Kapsul Vitamin A</span>
                          </label>

                          <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={balitaObatCacing}
                              onChange={(e) => setBalitaObatCacing(e.target.checked)}
                              className="h-4 w-4 text-pink-600 rounded border-slate-300"
                            />
                            <span>Obat Cacing</span>
                          </label>

                          <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={balitaAsiEksklusif}
                              onChange={(e) => setBalitaAsiEksklusif(e.target.checked)}
                              className="h-4 w-4 text-pink-600 rounded border-slate-300"
                            />
                            <span>ASI Eksklusif / MPASI Sehat</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ================= DEWASA & LANSIA SECTION ================= */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Tensi Darah */}
                      <div className={`p-4 rounded-xl border transition ${
                        sistolik >= 140 || diastolik >= 90
                          ? 'border-red-400 bg-red-50/50'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}>
                        <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                          <span className="flex items-center gap-1.5">
                            <Activity className="h-4 w-4 text-emerald-600" />
                            Tekanan Darah (Tensi)
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">mmHg</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Sistolik (Atas)</span>
                            <input
                              type="number"
                              min="60"
                              max="260"
                              required
                              value={sistolik}
                              onChange={(e) => setSistolik(Number(e.target.value))}
                              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-base font-bold text-slate-900 text-center"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Diastolik (Bawah)</span>
                            <input
                              type="number"
                              min="40"
                              max="160"
                              required
                              value={diastolik}
                              onChange={(e) => setDiastolik(Number(e.target.value))}
                              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-base font-bold text-slate-900 text-center"
                            />
                          </div>
                        </div>
                        <div className="mt-2 text-[11px]">
                          {sistolik >= 140 || diastolik >= 90 ? (
                            <span className="font-bold text-red-600 flex items-center gap-1">
                              ⚠️ Melebihi Batas Normal (≥ 140/90)
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium">Normal (&lt; 140/90)</span>
                          )}
                        </div>
                      </div>

                      {/* Gula Darah Sewaktu */}
                      <div className={`p-4 rounded-xl border transition ${
                        gulaDarah > 200
                          ? 'border-red-400 bg-red-50/50'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}>
                        <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                          <span className="flex items-center gap-1.5">
                            <Droplets className="h-4 w-4 text-emerald-600" />
                            Gula Darah Sewaktu (GDS)
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">mg/dL</span>
                        </label>
                        <input
                          type="number"
                          min="40"
                          max="600"
                          required
                          value={gulaDarah}
                          onChange={(e) => setGulaDarah(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-base font-bold text-slate-900 text-center"
                        />
                        <div className="mt-2 text-[11px]">
                          {gulaDarah > 200 ? (
                            <span className="font-bold text-red-600 flex items-center gap-1">
                              ⚠️ Gula Darah Tinggi (&gt; 200 mg/dL)
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium">Normal (&le; 200 mg/dL)</span>
                          )}
                        </div>
                      </div>

                      {/* Kolesterol Total */}
                      <div className={`p-4 rounded-xl border transition ${
                        kolesterol > 200
                          ? 'border-amber-400 bg-amber-50/50'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}>
                        <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                          <span>Kolesterol Total</span>
                          <span className="font-mono text-[11px] text-slate-500">mg/dL</span>
                        </label>
                        <input
                          type="number"
                          min="80"
                          max="500"
                          required
                          value={kolesterol}
                          onChange={(e) => setKolesterol(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-base font-bold text-slate-900 text-center"
                        />
                        <div className="mt-2 text-[11px]">
                          {kolesterol > 200 ? (
                            <span className="text-amber-700 font-medium">Batas Tinggi (&gt; 200 mg/dL)</span>
                          ) : (
                            <span className="text-emerald-700 font-medium">Normal (&le; 200 mg/dL)</span>
                          )}
                        </div>
                      </div>

                      {/* Asam Urat */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                          <span>Asam Urat</span>
                          <span className="font-mono text-[11px] text-slate-500">mg/dL</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="2"
                          max="20"
                          value={asamUrat}
                          onChange={(e) => setAsamUrat(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-base font-bold text-slate-900 text-center"
                        />
                        <div className="mt-2 text-[11px] text-slate-500">
                          Pria &le; 7.0 mg/dL, Wanita &le; 6.0 mg/dL
                        </div>
                      </div>
                    </div>

                    {/* Berat, Tinggi, Lingkar Perut */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Berat Badan (kg)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="25"
                          max="200"
                          required
                          value={beratBadan}
                          onChange={(e) => setBeratBadan(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-300 p-2 text-sm font-bold text-center bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Tinggi Badan (cm)
                        </label>
                        <input
                          type="number"
                          min="100"
                          max="220"
                          required
                          value={tinggiBadan}
                          onChange={(e) => setTinggiBadan(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-300 p-2 text-sm font-bold text-center bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Lingkar Perut (cm)
                        </label>
                        <input
                          type="number"
                          min="40"
                          max="180"
                          value={lingkarPerut}
                          onChange={(e) => setLingkarPerut(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-300 p-2 text-sm font-bold text-center bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Pesan Kasih Sayang / Nasihat Kader (Human Warmth) */}
                <div className="rounded-xl border border-slate-200 p-4 bg-white space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Smile className="h-4 w-4 text-emerald-600" />
                    Pesan Kasih & Nasihat Kader (Akan tercetak di struk thermal warga):
                  </label>
                  <textarea
                    rows={2}
                    value={pesanKasihKader}
                    onChange={(e) => setPesanKasihKader(e.target.value)}
                    placeholder={
                      isWargaAnak
                        ? 'Contoh: Adik lincah & sehat, teruskan ASI & perbanyak protein telur/ikan ya Bunda.'
                        : 'Contoh: Bapak/Ibu rajin jalan pagi, kurangi konsumsi garam dan santan ya, semoga lekas pulih.'
                    }
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                {/* Action Submit Button */}
                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-md transition flex items-center justify-center gap-2 ${
                    isWargaAnak
                      ? 'bg-pink-600 hover:bg-pink-700'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  <Printer className="h-4 w-4" />
                  <span>Simpan Hasil & Buka Struk Kasir Thermal</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Live Status & Community Health Insights */}
          <div className="space-y-6">
            {/* Live Status Card */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
              <h4 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-emerald-600" />
                Evaluasi Otomatis Kesehatan Real-Time
              </h4>

              {isWargaAnak ? (
                /* Status Balita */
                <div className="mt-4">
                  {balitaEvaluation.status === 'SIAGA' ? (
                    <div className="rounded-xl bg-amber-50 p-4 border border-amber-300">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <div>
                          <div className="font-bold text-amber-900 text-sm">
                            STATUS: PERLU PERHATIAN KHUSUS
                          </div>
                          <div className="text-xs text-amber-700 font-medium mt-0.5">
                            Status Gizi: {balitaEvaluation.statusGizi}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-amber-800 space-y-1">
                        {balitaEvaluation.reasons.map((r, i) => (
                          <div key={i}>• {r}</div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <div>
                          <div className="font-bold text-emerald-900 text-sm">
                            STATUS: TUMBUH KEMBANG BAIK
                          </div>
                          <div className="text-xs text-emerald-700 font-medium mt-0.5">
                            Gizi Sesuai Usia (Garis Hijau KMS)
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-emerald-800">
                        Pertumbuhan berat dan tinggi badan berada pada jalur yang sehat.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Status Dewasa */
                <div className="mt-4">
                  {adultHealthEvaluation.status === 'SIAGA' ? (
                    <div className="rounded-xl bg-red-50 p-4 border border-red-300">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <div className="font-bold text-red-900 text-sm">
                            STATUS: ⚠️ SIAGA RUJUKAN KLINIK
                          </div>
                          <div className="text-xs text-red-700 font-medium">
                            Melebihi batas ambang aman Kemenkes
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-red-800 space-y-1">
                        {adultHealthEvaluation.reasons.map((r, i) => (
                          <div key={i}>• {r}</div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <div>
                          <div className="font-bold text-emerald-900 text-sm">
                            STATUS: ✅ SEHAT & NORMAL
                          </div>
                          <div className="text-xs text-emerald-700 font-medium">
                            Semua indikator dalam rentang aman
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-emerald-800 space-y-1">
                        <div>• Tensi: {sistolik}/{diastolik} mmHg (&lt; 140/90)</div>
                        <div>• GDS: {gulaDarah} mg/dL (&le; 200)</div>
                        <div>• BMI: {adultHealthEvaluation.bmi} ({adultHealthEvaluation.bmiCategory})</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pedoman Ramah Kader */}
              <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-slate-500" />
                  Tips Ramah Posyandu untuk Kader:
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
                  <li>Sapa warga dan anak dengan senyuman hangat dan sebut nama mereka.</li>
                  <li>Jika balita takut timbangan, ajak ibu memangku sambil dikurangi berat pakaian/popok.</li>
                  <li>Berikan apresiasi kepada ibu yang rutin membawa buku KIA pink ke Posyandu.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENDAFTARAN WARGA & ANAK (KIA) + DAFTAR WARGA */}
      {activeTab === 'daftar_warga' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Registration Form */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <UserPlus className="h-5 w-5 text-emerald-700" />
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Form Pendaftaran Baru
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bisa untuk Warga Dewasa maupun Bayi/Anak (KIA)
                  </p>
                </div>
              </div>

              {/* Category Selector: Dewasa vs Anak */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setKategoriPendaftaran('dewasa');
                    setNewTanggalLahir('1992-06-15');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    kategoriPendaftaran === 'dewasa'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Warga Dewasa</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setKategoriPendaftaran('anak');
                    setNewTanggalLahir('2024-03-10');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    kategoriPendaftaran === 'anak'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Baby className="h-4 w-4" />
                  <span>Anak / Balita (KIA)</span>
                </button>
              </div>

              <form onSubmit={handleSubmitNewWarga} className="space-y-3 text-xs">
                {kategoriPendaftaran === 'anak' ? (
                  /* ================= FORM ANAK / BALITA ================= */
                  <div className="space-y-3 p-3.5 bg-pink-50/60 rounded-xl border border-pink-200">
                    <div className="flex items-center gap-1.5 text-pink-900 font-bold text-xs pb-1 border-b border-pink-200">
                      <Baby className="h-4 w-4 text-pink-600" />
                      Data Bayi / Balita Posyandu
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        Nama Lengkap Anak *
                      </label>
                      <input
                        type="text"
                        required
                        value={newNama}
                        onChange={(e) => setNewNama(e.target.value)}
                        placeholder="Contoh: Muhammad Farhan Al-Fatih"
                        className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white focus:border-pink-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-800 mb-1">
                          Nama Panggilan Anak
                        </label>
                        <input
                          type="text"
                          value={newNamaPanggilan}
                          onChange={(e) => setNewNamaPanggilan(e.target.value)}
                          placeholder="Contoh: Farhan"
                          className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-800 mb-1">
                          Anak Ke-
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="15"
                          value={newAnakKe}
                          onChange={(e) => setNewAnakKe(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white text-center focus:border-pink-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        Nama Ibu Kandung / Wali *
                      </label>
                      <input
                        type="text"
                        required
                        value={newNamaIbu}
                        onChange={(e) => setNewNamaIbu(e.target.value)}
                        placeholder="Contoh: Ibu Siti Nurhaliza"
                        className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white focus:border-pink-500"
                      />
                    </div>

                    {/* NIK / KIA Options */}
                    <div className="rounded-lg bg-white p-2.5 border border-pink-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-slate-800 text-[11px]">
                          Nomor Identitas Anak (NIK / KIA):
                        </label>
                        <span className="text-[10px] text-pink-700 font-medium">
                          Otomatis jika belum punya
                        </span>
                      </div>

                      <input
                        type="text"
                        value={newNik}
                        onChange={(e) => setNewNik(e.target.value)}
                        placeholder="Kosongkan jika balita belum punya NIK KTP"
                        className="w-full rounded-lg border border-slate-300 p-2 font-mono text-xs focus:border-pink-500"
                      />
                      <p className="text-[10px] text-slate-500 leading-tight">
                        💡 Jika belum ada NIK, sistem akan otomatis menerbitkan ID resmi <strong>KIA Posyandu</strong> yang terhubung dengan No. KK orang tua.
                      </p>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        No. Kartu Keluarga (KK) Orang Tua *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={16}
                        value={newNoKk}
                        onChange={(e) => setNewNoKk(e.target.value.replace(/\D/g, ''))}
                        placeholder="320101XXXXXXXXXX"
                        className="w-full rounded-lg border border-slate-300 p-2 font-mono text-xs bg-white focus:border-pink-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-800 mb-1">
                          Tanggal Lahir *
                        </label>
                        <input
                          type="date"
                          required
                          value={newTanggalLahir}
                          onChange={(e) => setNewTanggalLahir(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-800 mb-1">
                          Jenis Kelamin *
                        </label>
                        <select
                          value={newGender}
                          onChange={(e) => setNewGender(e.target.value as 'L' | 'P')}
                          className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white focus:border-pink-500"
                        >
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="punyaKiaCheck"
                        checked={newPunyaKia}
                        onChange={(e) => setNewPunyaKia(e.target.checked)}
                        className="h-4 w-4 text-pink-600 rounded border-slate-300"
                      />
                      <label htmlFor="punyaKiaCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
                        Sudah memiliki Buku KIA Pink (Fisik)
                      </label>
                    </div>
                  </div>
                ) : (
                  /* ================= FORM DEWASA ================= */
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        NIK KTP (16 Digit) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={16}
                        value={newNik}
                        onChange={(e) => setNewNik(e.target.value.replace(/\D/g, ''))}
                        placeholder="320101XXXXXXXXXX"
                        className="w-full rounded-lg border border-slate-300 p-2 font-mono text-xs focus:border-emerald-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        No. Kartu Keluarga (KK)
                      </label>
                      <input
                        type="text"
                        maxLength={16}
                        value={newNoKk}
                        onChange={(e) => setNewNoKk(e.target.value.replace(/\D/g, ''))}
                        placeholder="320101XXXXXXXXXX"
                        className="w-full rounded-lg border border-slate-300 p-2 font-mono text-xs focus:border-emerald-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nama Lengkap Warga *
                      </label>
                      <input
                        type="text"
                        required
                        value={newNama}
                        onChange={(e) => setNewNama(e.target.value)}
                        placeholder="Contoh: Siti Rahmawati"
                        className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Tgl Lahir *
                        </label>
                        <input
                          type="date"
                          required
                          value={newTanggalLahir}
                          onChange={(e) => setNewTanggalLahir(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Gender *
                        </label>
                        <select
                          value={newGender}
                          onChange={(e) => setNewGender(e.target.value as 'L' | 'P')}
                          className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                        >
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Pekerjaan
                      </label>
                      <input
                        type="text"
                        value={newPekerjaan}
                        onChange={(e) => setNewPekerjaan(e.target.value)}
                        placeholder="Contoh: Karyawan Swasta / Pedagang"
                        className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {/* Common fields: RT, RW, Alamat, Golongan Darah, Telepon */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      RT *
                    </label>
                    <input
                      type="text"
                      required
                      value={newRt}
                      onChange={(e) => setNewRt(e.target.value)}
                      placeholder="02"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      RW *
                    </label>
                    <input
                      type="text"
                      required
                      value={newRw}
                      onChange={(e) => setNewRw(e.target.value)}
                      placeholder="05"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alamat Rumah
                  </label>
                  <input
                    type="text"
                    value={newAlamat}
                    onChange={(e) => setNewAlamat(e.target.value)}
                    placeholder="Contoh: Jl. Mawar No. 10"
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Gol. Darah
                    </label>
                    <select
                      value={newGoldar}
                      onChange={(e) => setNewGoldar(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                    >
                      <option value="O">O</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="-">-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      No. HP / WA
                    </label>
                    <input
                      type="text"
                      value={newTelepon}
                      onChange={(e) => setNewTelepon(e.target.value)}
                      placeholder="0812-XXXX-XXXX"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full mt-3 flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-4 font-bold text-white shadow-sm transition ${
                    kategoriPendaftaran === 'anak'
                      ? 'bg-pink-600 hover:bg-pink-700'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>
                    {kategoriPendaftaran === 'anak'
                      ? 'Daftarkan Anak & Buat Kartu KIA'
                      : 'Daftarkan Warga & Buat Kartu QR'}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* List of Registered Residents with Filter Tabs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Buku Warga & Posyandu Terdaftar ({wargaList.length} Orang)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Klik Kartu QR untuk mencetak atau membagikan ke WhatsApp warga/orang tua
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchWargaQuery}
                    onChange={(e) => setSearchWargaQuery(e.target.value)}
                    placeholder="Cari nama, nama ibu, atau NIK..."
                    className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-hidden"
                  />
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterKategori('semua')}
                  className={`px-3 py-1 rounded-full font-semibold transition ${
                    filterKategori === 'semua'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Warga ({wargaList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterKategori('anak')}
                  className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1 ${
                    filterKategori === 'anak'
                      ? 'bg-pink-600 text-white'
                      : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200'
                  }`}
                >
                  <Baby className="h-3 w-3" />
                  Balita & Anak (KIA) ({balitaCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterKategori('dewasa')}
                  className={`px-3 py-1 rounded-full font-semibold transition ${
                    filterKategori === 'dewasa'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  Dewasa & Lansia ({dewasaCount})
                </button>
              </div>

              {/* Resident Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Nama & Identitas</th>
                      <th className="py-2.5 px-3">Kategori & Usia</th>
                      <th className="py-2.5 px-3">Ibu / Wali / Wilayah</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWarga.map((w) => {
                      const isChild = w.isAnakTanpaNik || w.kategoriUsia === 'balita' || w.kategoriUsia === 'anak';
                      return (
                        <tr key={w.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {w.nama}
                              {w.namaPanggilan && (
                                <span className="text-[10px] text-pink-700 bg-pink-50 px-1.5 py-0.2 rounded border border-pink-200">
                                  {w.namaPanggilan}
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[11px] text-slate-500">
                              {w.isAnakTanpaNik ? 'ID KIA:' : 'NIK:'} {w.nik}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            {isChild ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 text-pink-800 px-2 py-0.5 text-[10px] font-bold">
                                <Baby className="h-3 w-3" />
                                {formatAgeFriendly(w.tanggalLahir)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-semibold">
                                {formatAgeFriendly(w.tanggalLahir)}
                              </span>
                            )}
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {w.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} • Gol: {w.golonganDarah || '-'}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            {w.namaIbuOrangTua ? (
                              <div className="text-[11px] font-medium text-pink-900">
                                Ibu: {w.namaIbuOrangTua}
                              </div>
                            ) : null}
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                              RT {w.rt} / RW {w.rw}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-1.5">
                            <button
                              onClick={() => setSelectedWargaCard(w)}
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold shadow-xs transition ${
                                isChild
                                  ? 'bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              <QrCode className="h-3.5 w-3.5" />
                              <span>{isChild ? 'Kartu KIA' : 'Kartu QR'}</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedNik(w.nik);
                                setActiveTab('input_ckg');
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-900 transition"
                            >
                              <span>{isChild ? 'Timbang' : 'Periksa'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RIWAYAT PEMERIKSAAN & CETAK STRUK */}
      {activeTab === 'riwayat_ckg' && (
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Riwayat Hasil Cek Kesehatan & Timbang Balita
              </h3>
              <p className="text-xs text-slate-500">
                Pemeriksaan tersimpan di Satu Data RW dan siap cetak ulang struk thermal kasir kapan pun
              </p>
            </div>

            <button
              onClick={() => exportCKGToExcel(pemeriksaanList)}
              className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Ekspor ke Excel (.xlsx)</span>
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Waktu & Kader</th>
                  <th className="py-2.5 px-3">Nama Warga / Balita</th>
                  <th className="py-2.5 px-3">Jenis Layanan</th>
                  <th className="py-2.5 px-3">Hasil Kunci</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kaderPemeriksaanHistory.map((p) => {
                  const isBalita = p.jenisPemeriksaan === 'balita_anak';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {new Date(p.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-500">{p.namaKader}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{p.namaWarga}</div>
                        <div className="font-mono text-[10px] text-slate-500">
                          RT {p.rt} / RW {p.rw} • ID: {p.nik}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {isBalita ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 text-pink-800 px-2 py-0.5 text-[10px] font-bold">
                            <Baby className="h-3 w-3" /> Balita KMS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                            <HeartPulse className="h-3 w-3" /> CKG Dewasa
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isBalita ? (
                          <div className="text-slate-800">
                            <div>BB: <strong>{p.beratBadan} kg</strong> | TB: <strong>{p.tinggiBadan} cm</strong></div>
                            <div className="text-[10px] text-slate-500">{p.statusGiziKms || 'Gizi Baik'}</div>
                          </div>
                        ) : (
                          <div className="text-slate-800">
                            <div>Tensi: <strong>{p.sistolik}/{p.diastolik}</strong> mmHg</div>
                            <div className="text-[10px] text-slate-500">GDS: {p.gulaDarah} mg/dL</div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {p.status === 'SIAGA' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700 border border-red-200">
                            <AlertTriangle className="h-3 w-3" />
                            SIAGA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            SEHAT
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 transition shadow-xs"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Cetak Struk</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Scanner Camera Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        wargaList={wargaList}
        title="Kamera Scanner QR Code Warga & Balita"
        subtitle="Arahkan kamera ke QR Code Kartu CKG atau Kartu KIA fisik"
      />

      {/* Thermal Receipt Print Modal */}
      <ThermalReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        pemeriksaan={selectedReceipt}
        warga={wargaList.find((w) => w.nik === selectedReceipt?.nik)}
      />

      {/* Digital Warga Card with QR Modal */}
      <WargaCardModal
        isOpen={!!selectedWargaCard}
        onClose={() => setSelectedWargaCard(null)}
        warga={selectedWargaCard}
      />
    </div>
  );
};
