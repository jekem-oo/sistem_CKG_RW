import React, { useRef } from 'react';
import { Printer, X, Download, HeartPulse, CheckCircle, AlertTriangle } from 'lucide-react';
import { PemeriksaanCKG, Warga } from '../types';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  pemeriksaan: PemeriksaanCKG | null;
  warga?: Warga;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  pemeriksaan,
  warga,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !pemeriksaan) return null;

  const handlePrint = () => {
    window.print();
  };

  const isSiaga = pemeriksaan.status === 'SIAGA';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-xs overflow-y-auto">
      {/* Print-specific stylesheet injected */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-print-area, #thermal-print-area * {
            visibility: visible;
          }
          #thermal-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 58mm !important;
            margin: 0;
            padding: 2mm;
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 my-6">
        {/* Modal Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-800 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <Printer className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold">Struk Hasil CKG (Thermal)</span>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Paper Container - Simulates 58mm / 80mm Roll */}
        <div className="bg-slate-100 p-4 flex justify-center">
          <div
            ref={receiptRef}
            id="thermal-print-area"
            className="w-[280px] bg-white p-4 shadow-md font-mono text-[11px] leading-tight text-slate-900 border border-slate-300 rounded-sm"
          >
            {/* Header POSYANDU */}
            <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-0.5">
              <div className="font-bold text-xs uppercase tracking-wider">
                POSYANDU CKG TERINTEGRASI
              </div>
              <div className="text-[10px] font-semibold">RW 05 KEL. SUKAJADI</div>
              <div className="text-[9px] text-slate-600">
                Puskesmas Pembina Sukamaju
              </div>
              <div className="text-[9px] text-slate-500">
                ================================
              </div>
            </div>

            {/* Meta Info */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>No. Bukti:</span>
                <span className="font-bold">{pemeriksaan.id.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>
                  {new Date(pemeriksaan.tanggal).toLocaleString('id-ID', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Kader Posyandu:</span>
                <span className="truncate max-w-[140px] font-semibold">{pemeriksaan.namaKader}</span>
              </div>
              <div className="text-[9px] text-slate-500">
                --------------------------------
              </div>
              <div className="flex justify-between">
                <span>Nama Warga/Anak:</span>
                <span className="font-bold uppercase">{pemeriksaan.namaWarga}</span>
              </div>
              <div className="flex justify-between">
                <span>{warga?.isAnakTanpaNik ? 'ID KIA / No. KK:' : 'NIK Warga:'}</span>
                <span className="font-mono">{pemeriksaan.nik}</span>
              </div>
              {warga?.namaIbuOrangTua && (
                <div className="flex justify-between">
                  <span>Nama Ibu/Wali:</span>
                  <span>{warga.namaIbuOrangTua}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Wilayah:</span>
                <span>RT {pemeriksaan.rt} / RW {pemeriksaan.rw}</span>
              </div>
            </div>

            {/* Health Parameters: Balita vs Dewasa */}
            {pemeriksaan.jenisPemeriksaan === 'balita_anak' ? (
              <div className="py-2 border-b border-dashed border-slate-400 space-y-1.5">
                <div className="font-bold text-center text-[10px] uppercase tracking-wide text-emerald-800">
                  HASIL TUMBUH KEMBANG BALITA (KMS)
                </div>

                <div className="flex justify-between items-center">
                  <span>BERAT BADAN:</span>
                  <span className="font-bold text-slate-900">{pemeriksaan.beratBadan} kg</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>TINGGI / PANJANG:</span>
                  <span className="font-bold text-slate-900">{pemeriksaan.tinggiBadan} cm</span>
                </div>

                {pemeriksaan.lingkarKepala && (
                  <div className="flex justify-between items-center">
                    <span>LINGKAR KEPALA:</span>
                    <span>{pemeriksaan.lingkarKepala} cm</span>
                  </div>
                )}

                {pemeriksaan.lingkarLenganAtas && (
                  <div className="flex justify-between items-center">
                    <span>LINGKAR LENGAN (LiLA):</span>
                    <span className={pemeriksaan.lingkarLenganAtas < 12.5 ? 'font-bold text-amber-700 underline' : ''}>
                      {pemeriksaan.lingkarLenganAtas} cm
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>STATUS GIZI (KMS):</span>
                  <span className="font-bold text-emerald-700">
                    {pemeriksaan.statusGiziKms || 'Gizi Baik'}
                  </span>
                </div>

                {pemeriksaan.imunisasiDiberikan && (
                  <div className="flex justify-between items-center text-[9px]">
                    <span>IMUNISASI:</span>
                    <span className="font-medium text-right max-w-[130px] truncate">{pemeriksaan.imunisasiDiberikan}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-[9px]">
                  <span>VITAMIN A:</span>
                  <span>{pemeriksaan.vitaminA ? 'Sudah Diberikan' : 'Belum / Sesuai Jadwal'}</span>
                </div>
              </div>
            ) : (
              <div className="py-2 border-b border-dashed border-slate-400 space-y-1.5">
                <div className="font-bold text-center text-[10px] uppercase tracking-wide">
                  HASIL PEMERIKSAAN FISIK
                </div>

                {pemeriksaan.sistolik !== undefined && pemeriksaan.diastolik !== undefined && (
                  <div className="flex justify-between items-center">
                    <span>TENSI DARAH:</span>
                    <span className={`font-bold ${pemeriksaan.sistolik >= 140 || pemeriksaan.diastolik >= 90 ? 'text-red-700 underline' : ''}`}>
                      {pemeriksaan.sistolik}/{pemeriksaan.diastolik} mmHg
                    </span>
                  </div>
                )}

                {pemeriksaan.gulaDarah !== undefined && (
                  <div className="flex justify-between items-center">
                    <span>GULA DARAH (GDS):</span>
                    <span className={`font-bold ${pemeriksaan.gulaDarah > 200 ? 'text-red-700 underline' : ''}`}>
                      {pemeriksaan.gulaDarah} mg/dL
                    </span>
                  </div>
                )}

                {pemeriksaan.kolesterol !== undefined && (
                  <div className="flex justify-between items-center">
                    <span>KOLESTEROL:</span>
                    <span className={`font-bold ${pemeriksaan.kolesterol > 200 ? 'text-amber-800' : ''}`}>
                      {pemeriksaan.kolesterol} mg/dL
                    </span>
                  </div>
                )}

                {pemeriksaan.asamUrat !== undefined && (
                  <div className="flex justify-between items-center">
                    <span>ASAM URAT:</span>
                    <span>{pemeriksaan.asamUrat} mg/dL</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>BERAT / TINGGI:</span>
                  <span>
                    {pemeriksaan.beratBadan} kg / {pemeriksaan.tinggiBadan} cm
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>INDEKS MASSA (BMI):</span>
                  <span>{pemeriksaan.bmi}</span>
                </div>
              </div>
            )}

            {/* Status SIAGA or SEHAT */}
            <div className="py-2.5 text-center border-b border-dashed border-slate-400">
              {isSiaga ? (
                <div className="p-1.5 border-2 border-dashed border-red-600 bg-red-50 text-red-700">
                  <div className="font-bold text-xs">⚠️ STATUS: PERHATIAN / SIAGA ⚠️</div>
                  <div className="text-[9px] mt-0.5 font-sans font-medium">
                    PERLU KONSULTASI / RUJUKAN KLINIK / PUSKESMAS
                  </div>
                </div>
              ) : (
                <div className="p-1.5 border border-dashed border-emerald-600 bg-emerald-50 text-emerald-800">
                  <div className="font-bold text-xs">✅ STATUS: SEHAT & NORMAL</div>
                  <div className="text-[9px] mt-0.5 font-sans">
                    Alhamdulillah Kondisi Baik Terpantau
                  </div>
                </div>
              )}

              {/* Detail Alasan & Pesan Sayang Kader */}
              <div className="mt-2 text-left text-[9px] text-slate-700 space-y-1 font-sans">
                {pemeriksaan.alasanSiaga && pemeriksaan.alasanSiaga.length > 0 && (
                  <div>
                    <span className="font-bold">Evaluasi:</span>
                    {pemeriksaan.alasanSiaga.map((alasan, idx) => (
                      <div key={idx}>• {alasan}</div>
                    ))}
                  </div>
                )}

                {(pemeriksaan.pesanKasihKader || pemeriksaan.catatanKader) && (
                  <div className="pt-1 border-t border-dashed border-slate-300 text-slate-800">
                    <span className="font-bold text-emerald-800">Pesan Kasih Kader Posyandu:</span>
                    <p className="italic mt-0.5">
                      "{pemeriksaan.pesanKasihKader || pemeriksaan.catatanKader}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 text-center text-[9px] text-slate-500 space-y-1">
              <div>Simpan struk ini untuk rujukan dokter</div>
              <div className="font-bold tracking-widest">*** TERIMA KASIH ***</div>
              <div className="text-[8px]">Sistem Satu Data Kesehatan RW (CKG)</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">
            Format: Thermal Roll 58mm
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <Printer className="h-4 w-4" />
              Cetak Struk Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
