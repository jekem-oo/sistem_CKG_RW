import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  HeartPulse,
  Activity,
  Droplets,
  Scale,
  Calendar,
  ShieldCheck,
  Stethoscope,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Baby,
  Heart,
  Users,
  Smile,
  Info
} from 'lucide-react';
import { User, Warga, PemeriksaanCKG, RekamMedis } from '../types';
import { formatAgeFriendly } from '../utils/healthCalculator';

interface WargaDashboardProps {
  currentUser: User;
  wargaList: Warga[];
  pemeriksaanList: PemeriksaanCKG[];
  rekamMedisList: RekamMedis[];
}

export const WargaDashboard: React.FC<WargaDashboardProps> = ({
  currentUser,
  wargaList,
  pemeriksaanList,
  rekamMedisList,
}) => {
  // Find logged in primary citizen
  const primaryWarga = useMemo(() => {
    return wargaList.find((w) => w.nik === currentUser.nik) || wargaList[0];
  }, [wargaList, currentUser.nik]);

  // Family members (either matching No KK, or children where namaIbu matches, or same RT)
  const familyMembers = useMemo(() => {
    if (!primaryWarga) return [];
    return wargaList.filter((w) => {
      if (w.id === primaryWarga.id) return false;
      const sameKk = primaryWarga.noKk && w.noKk === primaryWarga.noKk;
      const isMyChild = w.namaIbuOrangTua && w.namaIbuOrangTua.toLowerCase().includes(primaryWarga.nama.toLowerCase());
      const sameRtRw = w.rt === primaryWarga.rt && w.rw === primaryWarga.rw && (w.isAnakTanpaNik || w.kategoriUsia === 'balita');
      return sameKk || isMyChild || sameRtRw;
    });
  }, [wargaList, primaryWarga]);

  // Selected profile to view (defaults to primary citizen, but mother can switch to child)
  const [activeWargaId, setActiveWargaId] = useState<string>(primaryWarga ? primaryWarga.id : '');

  const activeWarga = useMemo(() => {
    return wargaList.find((w) => w.id === activeWargaId) || primaryWarga;
  }, [wargaList, activeWargaId, primaryWarga]);

  const isChild = useMemo(() => {
    if (!activeWarga) return false;
    return activeWarga.isAnakTanpaNik || activeWarga.kategoriUsia === 'balita' || activeWarga.kategoriUsia === 'anak';
  }, [activeWarga]);

  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Active citizen's examinations
  const myCKG = useMemo(() => {
    if (!activeWarga) return [];
    return pemeriksaanList.filter((p) => p.nik === activeWarga.nik || p.wargaId === activeWarga.id);
  }, [pemeriksaanList, activeWarga]);

  const latestCKG = myCKG[0];

  // Active citizen's clinic records
  const myMedical = useMemo(() => {
    if (!activeWarga) return [];
    return rekamMedisList.filter((r) => r.nik === activeWarga.nik);
  }, [rekamMedisList, activeWarga]);

  // Generate QR Code for active profile
  useEffect(() => {
    if (!activeWarga) return;

    const qrPayload = JSON.stringify({
      nik: activeWarga.nik,
      nama: activeWarga.nama,
      rw: activeWarga.rw,
      rt: activeWarga.rt,
      tipe: isChild ? 'KIA-BALITA' : 'WARGA-DEWASA',
      system: 'SATUDATA-CKG-RW',
    });

    QRCode.toDataURL(
      qrPayload,
      {
        width: 280,
        margin: 1.5,
        color: {
          dark: isChild ? '#9d174d' : '#0f766e', // pink-800 or teal-700
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [activeWarga, isChild]);

  const handleDownloadQR = () => {
    if (!qrDataUrl || !activeWarga) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Kartu_${isChild ? 'KIA_Balita' : 'CKG_Warga'}_${activeWarga.nik}_${activeWarga.nama.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  if (!activeWarga) {
    return <div className="p-6 text-center text-slate-500">Data warga tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Warm, Neighborly & Helpful */}
      <div className={`rounded-2xl p-6 text-white shadow-lg transition ${
        isChild
          ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600'
          : 'bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold backdrop-blur-xs">
              {isChild ? <Baby className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              {isChild ? 'Buku Kesehatan Anak (KIA) Digital' : 'Akses Mandiri Warga RT ' + activeWarga.rt}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {isChild
                ? `Buku Posyandu Si Kecil: ${activeWarga.nama}`
                : `Buku Kesehatan Digital ${activeWarga.nama}`}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
              {isChild
                ? `Pantau tumbuh kembang dan riwayat imunisasi ananda tercinta. Simpan kartu KIA digital ini ke galeri HP untuk ditunjukkan saat jadwal Posyandu bulanan.`
                : `Simpan dan tunjukkan QR Code digital ini saat menghadiri Cek Kesehatan Gratis (CKG) di Posyandu RT ${activeWarga.rt} / RW ${activeWarga.rw} maupun klinik.`}
            </p>
          </div>

          <button
            onClick={handleDownloadQR}
            className={`flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold shadow-md hover:bg-slate-100 transition active:scale-95 shrink-0 ${
              isChild ? 'text-pink-900' : 'text-teal-900'
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Simpan Kartu ke Galeri HP</span>
          </button>
        </div>
      </div>

      {/* Family Member Switcher (Memudahkan Ibu/Bapak melihat data anak) */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-700" />
            <span className="text-xs font-bold text-slate-800">
              Pilih Profil Anggota Keluarga:
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              (Bisa beralih antara kartu Anda dan kartu balita/anak)
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveWargaId(primaryWarga.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                activeWargaId === primaryWarga.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{primaryWarga.nama} (Saya)</span>
            </button>

            {familyMembers.map((member) => {
              const memberIsChild = member.isAnakTanpaNik || member.kategoriUsia === 'balita' || member.kategoriUsia === 'anak';
              return (
                <button
                  key={member.id}
                  onClick={() => setActiveWargaId(member.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                    activeWargaId === member.id
                      ? memberIsChild ? 'bg-pink-600 text-white shadow-xs' : 'bg-slate-800 text-white shadow-xs'
                      : 'bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100'
                  }`}
                >
                  {memberIsChild && <Baby className="h-3.5 w-3.5" />}
                  <span>{member.nama} {member.namaPanggilan ? `(${member.namaPanggilan})` : ''}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Digital Card & Health Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Digital ID Card (KIA or CKG) */}
        <div className="lg:col-span-1 space-y-4">
          <div className={`rounded-2xl p-5 text-white shadow-xl relative overflow-hidden transition ${
            isChild
              ? 'bg-gradient-to-br from-pink-600 via-rose-600 to-amber-600'
              : 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-white/20">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/90">
                {isChild ? 'KARTU POSYANDU BALITA (KIA)' : `KARTU CKG DIGITAL RW ${activeWarga.rw}`}
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                {isChild ? 'BUKU PINK' : 'RESMI RW'}
              </span>
            </div>

            <div className="mt-4 flex flex-col items-center text-center">
              {/* QR Image */}
              <div className="rounded-2xl bg-white p-2.5 shadow-md">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code Warga"
                    className="h-44 w-44 object-contain"
                  />
                ) : (
                  <div className="h-44 w-44 flex items-center justify-center text-xs text-slate-400">
                    Menyiapkan QR...
                  </div>
                )}
                <div className={`text-[10px] font-mono font-bold mt-1 ${isChild ? 'text-pink-900' : 'text-emerald-900'}`}>
                  SCAN DI MEJA POSYANDU
                </div>
              </div>

              <div className="mt-3 font-bold text-base text-white">
                {activeWarga.nama} {activeWarga.namaPanggilan ? `(${activeWarga.namaPanggilan})` : ''}
              </div>
              <div className="font-mono text-xs text-white/90 bg-black/20 px-2 py-0.5 rounded mt-1">
                {isChild ? 'ID KIA / KK:' : 'NIK:'} {activeWarga.nik}
              </div>
              {isChild && activeWarga.namaIbuOrangTua && (
                <div className="text-xs text-pink-100 font-medium mt-1">
                  Ibu: {activeWarga.namaIbuOrangTua}
                </div>
              )}
              <div className="text-xs text-white/80 mt-1">
                Usia: {formatAgeFriendly(activeWarga.tanggalLahir)} • RT {activeWarga.rt} / RW {activeWarga.rw}
              </div>
            </div>

            <button
              onClick={handleDownloadQR}
              className={`mt-5 w-full flex items-center justify-center gap-1.5 rounded-xl bg-white py-2 text-xs font-bold shadow hover:bg-slate-50 transition ${
                isChild ? 'text-pink-900' : 'text-emerald-900'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              Simpan Kartu ke Galeri HP
            </button>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-slate-500" />
              Petunjuk Penggunaan Warga:
            </div>
            <p className="leading-relaxed text-[11px]">
              Tunjukkan layar HP ini ke Kader Posyandu saat pemeriksaan. Kader akan memindai QR Code untuk mencatat hasil timbangan atau tensi dalam hitungan detik.
            </p>
          </div>
        </div>

        {/* Latest Health Check Metrics (Pediatric or Adult) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  {isChild ? <Baby className="h-4 w-4 text-pink-600" /> : <HeartPulse className="h-4 w-4 text-emerald-600" />}
                  {isChild ? 'Catatan Tumbuh Kembang Posyandu Terakhir' : 'Hasil Pemeriksaan Fisik CKG Terakhir'}
                </h3>
                <p className="text-xs text-slate-500">
                  {latestCKG ? (
                    <>Diperiksa pada {new Date(latestCKG.tanggal).toLocaleDateString('id-ID', { dateStyle: 'long' })} oleh Kader {latestCKG.namaKader}</>
                  ) : (
                    'Belum ada catatan pemeriksaan terbaru'
                  )}
                </p>
              </div>

              {latestCKG && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 self-start sm:self-auto ${
                  latestCKG.status === 'SIAGA' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {latestCKG.status === 'SIAGA' ? (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {isChild ? 'PERHATIAN GIZI' : 'STATUS SIAGA'}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {isChild ? 'GIZI BAIK & NORMAL' : 'STATUS SEHAT'}
                    </>
                  )}
                </span>
              )}
            </div>

            {latestCKG ? (
              <div className="mt-4 space-y-4">
                {isChild || latestCKG.jenisPemeriksaan === 'balita_anak' ? (
                  /* ================= METRICS BALITA ================= */
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-xl bg-pink-50/60 p-3 border border-pink-200">
                        <span className="text-[11px] text-pink-700 block font-semibold">Berat Badan</span>
                        <div className="text-lg font-bold text-slate-900">
                          {latestCKG.beratBadan} <span className="text-[11px] font-normal text-slate-500">kg</span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-pink-50/60 p-3 border border-pink-200">
                        <span className="text-[11px] text-pink-700 block font-semibold">Panjang/Tinggi</span>
                        <div className="text-lg font-bold text-slate-900">
                          {latestCKG.tinggiBadan} <span className="text-[11px] font-normal text-slate-500">cm</span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-pink-50/60 p-3 border border-pink-200">
                        <span className="text-[11px] text-pink-700 block font-semibold">Lingkar Kepala</span>
                        <div className="text-lg font-bold text-slate-900">
                          {latestCKG.lingkarKepala || '-'} <span className="text-[11px] font-normal text-slate-500">cm</span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-pink-50/60 p-3 border border-pink-200">
                        <span className="text-[11px] text-pink-700 block font-semibold">LiLA (Lengan)</span>
                        <div className="text-lg font-bold text-slate-900">
                          {latestCKG.lingkarLenganAtas || '-'} <span className="text-[11px] font-normal text-slate-500">cm</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs">
                        <span className="font-semibold text-slate-600 block">Status Gizi (KMS):</span>
                        <span className="font-bold text-emerald-800 text-sm mt-0.5 block">
                          {latestCKG.statusGiziKms || 'Gizi Baik (Jalur Hijau)'}
                        </span>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs">
                        <span className="font-semibold text-slate-600 block">Imunisasi Diberikan:</span>
                        <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">
                          {latestCKG.imunisasiDiberikan || 'Sesuai Jadwal Usia'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ================= METRICS DEWASA ================= */
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Tensi Darah</span>
                      <div className="text-lg font-bold text-slate-900">
                        {latestCKG.sistolik}/{latestCKG.diastolik} <span className="text-[10px] font-normal text-slate-500">mmHg</span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Gula Darah (GDS)</span>
                      <div className="text-lg font-bold text-slate-900">
                        {latestCKG.gulaDarah} <span className="text-[10px] font-normal text-slate-500">mg/dL</span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Kolesterol Total</span>
                      <div className="text-lg font-bold text-slate-900">
                        {latestCKG.kolesterol} <span className="text-[10px] font-normal text-slate-500">mg/dL</span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Indeks Massa (BMI)</span>
                      <div className="text-lg font-bold text-slate-900">
                        {latestCKG.bmi} <span className="text-[10px] font-normal text-slate-500">BB/TB</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pesan Kasih Sayang & Nasihat Kader */}
                {(latestCKG.pesanKasihKader || latestCKG.catatanKader) && (
                  <div className="rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-200 text-xs space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <Smile className="h-4 w-4 text-emerald-700" />
                      Pesan Kasih dari Ibu Kader Posyandu:
                    </div>
                    <p className="text-emerald-800 italic leading-relaxed">
                      "{latestCKG.pesanKasihKader || latestCKG.catatanKader}"
                    </p>
                  </div>
                )}

                {/* Siaga reasons if any */}
                {latestCKG.alasanSiaga && latestCKG.alasanSiaga.length > 0 && (
                  <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Catatan Evaluasi Kesehatan:
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                      {latestCKG.alasanSiaga.map((alasan, i) => (
                        <li key={i}>{alasan}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Silakan datang ke Posyandu RW saat acara CKG untuk melakukan pemeriksaan fisik.
              </div>
            )}
          </div>

          {/* Clinical Doctor History */}
          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              Catatan Rekam Medis dari Dokter Klinik ({myMedical.length})
            </h4>

            <div className="mt-3 space-y-3">
              {myMedical.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-4">
                  Belum ada kunjungan ke klinik mitra terdaftar.
                </div>
              ) : (
                myMedical.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900">{m.namaPenyakit}</div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(m.tanggal).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-700">Diagnosa:</span> {m.diagnosa}
                    </div>
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-700">Resep Dokter:</span> {m.resepObat}
                    </div>
                    <div className="text-[11px] text-blue-700 font-medium">
                      Faskes: {m.namaKlinik} ({m.dokterNama})
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
