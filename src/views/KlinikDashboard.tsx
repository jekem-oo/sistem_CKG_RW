import React, { useState, useMemo } from 'react';
import {
  Camera,
  Activity,
  Stethoscope,
  ClipboardList,
  FileText,
  UserCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  History,
  Pill,
  Send,
  Plus
} from 'lucide-react';
import { User, Warga, PemeriksaanCKG, RekamMedis } from '../types';
import { QRScannerModal } from '../components/QRScannerModal';

interface KlinikDashboardProps {
  currentUser: User;
  wargaList: Warga[];
  pemeriksaanList: PemeriksaanCKG[];
  rekamMedisList: RekamMedis[];
  onAddRekamMedis: (rekam: RekamMedis) => void;
}

export const KlinikDashboard: React.FC<KlinikDashboardProps> = ({
  currentUser,
  wargaList,
  pemeriksaanList,
  rekamMedisList,
  onAddRekamMedis,
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedNik, setSelectedNik] = useState<string>('3201011205750003');

  // Rekam Medis Form State
  const [keluhanUtama, setKeluhanUtama] = useState('Tengkuk kaku dan sering haus sejak 3 hari, rujukan dari CKG RW 05');
  const [diagnosaMedis, setDiagnosaMedis] = useState('Hipertensi Grade 1 Esensial dan Diabetes Melitus Tipe 2');
  const [kodeIcd10, setKodeIcd10] = useState('I10 / E11');
  const [namaPenyakit, setNamaPenyakit] = useState('Hipertensi & DM Tipe 2');
  const [kategoriPenyakit, setKategoriPenyakit] = useState<'Menular' | 'Tidak Menular' | 'Umum'>('Tidak Menular');
  const [resepObat, setResepObat] = useState('Amlodipine 5mg 1x1 pagi, Metformin 500mg 2x1 sesudah makan, Vitamin B Kompleks 1x1');
  const [tindakanMedis, setTindakanMedis] = useState('Pemeriksaan lab gula darah puasa & edukasi diet rendah garam');
  const [statusKondisi, setStatusKondisi] = useState<'Rawat Jalan' | 'Rujuk Puskesmas' | 'Sembuh' | 'Observasi'>('Rawat Jalan');
  const [submittedNotification, setSubmittedNotification] = useState(false);

  // Selected Warga Details
  const activeWarga = useMemo(() => {
    return wargaList.find((w) => w.nik === selectedNik);
  }, [wargaList, selectedNik]);

  // Citizen's CKG Checks from RW / Posyandu
  const wargaCKGHistory = useMemo(() => {
    return pemeriksaanList.filter((p) => p.nik === selectedNik);
  }, [pemeriksaanList, selectedNik]);

  // Citizen's Previous Medical Records
  const wargaMedicalHistory = useMemo(() => {
    return rekamMedisList.filter((r) => r.nik === selectedNik);
  }, [rekamMedisList, selectedNik]);

  const handleScanSuccess = (scannedNik: string) => {
    setIsScannerOpen(false);
    setSelectedNik(scannedNik);
  };

  const handleSubmitRekamMedis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWarga) {
      alert('Pilih atau scan warga terlebih dahulu!');
      return;
    }

    const newRecord: RekamMedis = {
      id: `rm-${Date.now().toString().slice(-6)}`,
      wargaId: activeWarga.id,
      nik: activeWarga.nik,
      namaWarga: activeWarga.nama,
      klinikId: currentUser.klinikId || 'kln-01',
      namaKlinik: 'Klinik Pratama Sehat Prima RW 05',
      dokterNama: currentUser.nama,
      tanggal: new Date().toISOString(),
      keluhanUtama,
      diagnosa: diagnosaMedis,
      kodeIcd10,
      kategoriPenyakit,
      namaPenyakit,
      resepObat,
      tindakanMedis,
      statusKondisi,
    };

    onAddRekamMedis(newRecord);
    setSubmittedNotification(true);
    setTimeout(() => setSubmittedNotification(false), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold text-blue-200">
              <Stethoscope className="h-3.5 w-3.5" />
              Pemeriksaan Dokter & Rekam Medis Elektronik (RME)
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
              Integrasi Data CKG Posyandu RW dengan Faskes / Dokter
            </h2>
            <p className="text-xs sm:text-sm text-blue-200 max-w-xl">
              Scan kartu QR fisik warga untuk langsung menarik riwayat tensi, gula darah, dan kolesterol dari kader Posyandu RW sebelum menginput diagnosa medis.
            </p>
          </div>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-900 shadow-md hover:bg-blue-50 transition active:scale-95"
          >
            <Camera className="h-4 w-4 text-blue-600" />
            <span>Scan QR Pasien Datang</span>
          </button>
        </div>
      </div>

      {submittedNotification && (
        <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>Rekam medis berhasil disimpan dan terintegrasi ke sistem pemantauan surveilans Puskesmas!</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Profile & CKG History from RW */}
        <div className="space-y-6 lg:col-span-1">
          {/* Patient Card */}
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-blue-600" />
                Pasien Terpilih
              </h3>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Scan Ulang
              </button>
            </div>

            {/* Quick selector dropdown */}
            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Ganti Pasien Terdaftar:
              </label>
              <select
                value={selectedNik}
                onChange={(e) => setSelectedNik(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-medium text-slate-800"
              >
                {wargaList.map((w) => {
                  const isChild = w.isAnakTanpaNik || w.kategoriUsia === 'balita' || w.kategoriUsia === 'anak';
                  return (
                    <option key={w.id} value={w.nik}>
                      {isChild ? '👶 [ANAK] ' : '👤 '}
                      {w.nama} {w.namaPanggilan ? `(${w.namaPanggilan})` : ''} — {w.isAnakTanpaNik ? 'KIA:' : 'NIK:'} {w.nik} (RT {w.rt})
                    </option>
                  );
                })}
              </select>
            </div>

            {activeWarga && (
              <div className="mt-4 rounded-xl bg-blue-50/60 p-4 border border-blue-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-blue-950">
                    {activeWarga.nama} {activeWarga.namaPanggilan ? `(${activeWarga.namaPanggilan})` : ''}
                  </div>
                  {(activeWarga.isAnakTanpaNik || activeWarga.kategoriUsia === 'balita') && (
                    <span className="bg-pink-100 text-pink-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Balita Posyandu
                    </span>
                  )}
                </div>
                <div className="font-mono text-slate-600 text-[11px]">
                  {activeWarga.isAnakTanpaNik ? 'ID KIA / KK:' : 'NIK:'} {activeWarga.nik}
                </div>
                {activeWarga.namaIbuOrangTua && (
                  <div className="text-[11px] text-pink-900 font-semibold">
                    Ibu Kandung: {activeWarga.namaIbuOrangTua}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 pt-1 border-t border-blue-100">
                  <div>Gender: {activeWarga.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                  <div>Gol. Darah: {activeWarga.golonganDarah || '-'}</div>
                  <div>Wilayah: RT {activeWarga.rt} / RW {activeWarga.rw}</div>
                  <div>Pekerjaan: {activeWarga.pekerjaan || '-'}</div>
                </div>
                {activeWarga.riwayatPenyakitKeluarga && activeWarga.riwayatPenyakitKeluarga.length > 0 && (
                  <div className="text-[11px] pt-1">
                    <span className="font-semibold text-slate-700">Riwayat Keluarga:</span>{' '}
                    <span className="text-slate-600">{activeWarga.riwayatPenyakitKeluarga.join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CKG Physical Checks from Posyandu/Kader */}
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <History className="h-4 w-4 text-emerald-600" />
              Riwayat CKG & Posyandu dari RW
            </h4>

            <div className="mt-3 space-y-3">
              {wargaCKGHistory.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Belum ada catatan CKG/Posyandu untuk warga ini.
                </div>
              ) : (
                wargaCKGHistory.map((c) => {
                  const isBalita = c.jenisPemeriksaan === 'balita_anak';
                  return (
                    <div key={c.id} className="p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">
                          {new Date(c.tanggal).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'SIAGA' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      {isBalita ? (
                        <div className="space-y-1 text-[11px] text-slate-800">
                          <div className="font-semibold text-pink-800">Hasil Timbang Balita (KMS):</div>
                          <div className="grid grid-cols-2 gap-1 font-mono">
                            <div>BB: <strong>{c.beratBadan} kg</strong></div>
                            <div>TB: <strong>{c.tinggiBadan} cm</strong></div>
                            <div>LiLA: <strong>{c.lingkarLenganAtas || '-'} cm</strong></div>
                            <div>Kepala: <strong>{c.lingkarKepala || '-'} cm</strong></div>
                          </div>
                          <div className="text-emerald-800 font-semibold">
                            Status Gizi: {c.statusGiziKms || 'Gizi Baik'}
                          </div>
                          {c.imunisasiDiberikan && (
                            <div className="text-[10px] text-slate-600">
                              Imunisasi: {c.imunisasiDiberikan}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1 font-mono text-[11px] text-slate-800">
                          <div>Tensi: <strong>{c.sistolik}/{c.diastolik}</strong> mmHg</div>
                          <div>Gula: <strong>{c.gulaDarah}</strong> mg/dL</div>
                          <div>Kolesterol: <strong>{c.kolesterol}</strong> mg/dL</div>
                          <div>BMI: <strong>{c.bmi}</strong></div>
                        </div>
                      )}

                      {(c.pesanKasihKader || c.catatanKader) && (
                        <div className="text-[10px] text-slate-600 italic pt-1 border-t border-slate-200">
                          Catatan Kader: "{c.pesanKasihKader || c.catatanKader}"
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Doctor's Medical Record Input */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  Input Rekam Medis Pasien (Dokter Klinik)
                </h3>
                <p className="text-xs text-slate-500">
                  Diagnosa, klasifikasi menular/tidak menular untuk early warning surveilans, dan resep obat
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Pemeriksa: {currentUser.nama}
              </span>
            </div>

            <form onSubmit={handleSubmitRekamMedis} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keluhan Utama & Anamnesis Pasien *
                </label>
                <textarea
                  rows={2}
                  required
                  value={keluhanUtama}
                  onChange={(e) => setKeluhanUtama(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Penyakit Utama *
                  </label>
                  <input
                    type="text"
                    required
                    value={namaPenyakit}
                    onChange={(e) => setNamaPenyakit(e.target.value)}
                    placeholder="Contoh: Demam Berdarah Dengue (DBD)"
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kode ICD-10 (Opsional)
                  </label>
                  <input
                    type="text"
                    value={kodeIcd10}
                    onChange={(e) => setKodeIcd10(e.target.value)}
                    placeholder="Contoh: A90 (DBD), I10 (Hipertensi)"
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori Penyakit (Untuk Surveilans EWS) *
                  </label>
                  <select
                    value={kategoriPenyakit}
                    onChange={(e) => setKategoriPenyakit(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="Menular">Menular (DBD, ISPA, Diare, TBC) - Terhubung EWS</option>
                    <option value="Tidak Menular">Tidak Menular (Hipertensi, DM, Jantung)</option>
                    <option value="Umum">Umum / Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status Tindak Lanjut *
                  </label>
                  <select
                    value={statusKondisi}
                    onChange={(e) => setStatusKondisi(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="Rawat Jalan">Rawat Jalan</option>
                    <option value="Rujuk Puskesmas">Rujuk Puskesmas / RS</option>
                    <option value="Observasi">Observasi</option>
                    <option value="Sembuh">Sembuh</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Diagnosa Medis Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={diagnosaMedis}
                  onChange={(e) => setDiagnosaMedis(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Pill className="h-3.5 w-3.5 text-blue-600" />
                  Resep Obat & Terapi Farmakologi
                </label>
                <textarea
                  rows={2}
                  required
                  value={resepObat}
                  onChange={(e) => setResepObat(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tindakan Medis & Edukasi Gaya Hidup
                </label>
                <input
                  type="text"
                  value={tindakanMedis}
                  onChange={(e) => setTindakanMedis(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 px-4 font-bold text-white hover:bg-blue-800 shadow-md transition"
              >
                <Send className="h-4 w-4" />
                <span>Simpan Rekam Medis & Kirim Data ke Sistem RW</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* QR Scanner Camera Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        wargaList={wargaList}
        title="Scan QR Pasien Datang di Klinik"
        subtitle="Arahkan kamera ke QR Kartu CKG fisik warga"
      />
    </div>
  );
};
