import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, X, QrCode as QrIcon, ShieldCheck, UserCheck, Baby, Heart } from 'lucide-react';
import { Warga } from '../types';
import { formatAgeFriendly } from '../utils/healthCalculator';

interface WargaCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  warga: Warga | null;
}

export const WargaCardModal: React.FC<WargaCardModalProps> = ({
  isOpen,
  onClose,
  warga,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const isAnak = warga?.isAnakTanpaNik || warga?.kategoriUsia === 'balita' || warga?.kategoriUsia === 'anak';

  useEffect(() => {
    if (!isOpen || !warga) return;

    // Generate QR Code with NIK / KIA and verification payload
    const qrPayload = JSON.stringify({
      nik: warga.nik,
      nama: warga.nama,
      rw: warga.rw,
      rt: warga.rt,
      tipe: isAnak ? 'KIA-BALITA' : 'WARGA-DEWASA',
      system: 'SATUDATA-CKG-RW',
    });

    QRCode.toDataURL(
      qrPayload,
      {
        width: 260,
        margin: 1.5,
        color: {
          dark: isAnak ? '#831843' : '#064e3b', // rose-900 or emerald-900
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [isOpen, warga, isAnak]);

  if (!isOpen || !warga) return null;

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Kartu_${isAnak ? 'KIA_Anak' : 'CKG_Warga'}_${warga.nik}_${warga.nama.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-5 py-4 text-white ${
          isAnak ? 'bg-gradient-to-r from-pink-600 to-rose-700 border-pink-700' : 'bg-emerald-700 border-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {isAnak ? <Baby className="h-5 w-5 text-pink-200" /> : <QrIcon className="h-5 w-5 text-emerald-200" />}
            <h3 className="font-semibold text-base">
              {isAnak ? 'Kartu Identitas Anak (KIA) & Posyandu' : 'Kartu Digital Sehat Warga CKG'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/80 hover:bg-black/20 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Digital ID Card Preview */}
        <div className="p-6">
          <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-xl ${
            isAnak
              ? 'bg-gradient-to-br from-pink-600 via-rose-600 to-amber-600'
              : 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800'
          }`}>
            {/* Watermark Circle */}
            <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/10 blur-xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/20">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white/90">
                  {isAnak ? 'POSYANDU BALITA & IBU' : 'SATU DATA KESEHATAN RW'}
                </div>
                <div className="text-xs font-semibold">
                  {isAnak ? 'KARTU POSYANDU ANAK SEHAT (KIA)' : 'KARTU PESERTA CKG TERINTEGRASI'}
                </div>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white border border-white/30">
                {isAnak ? <Heart className="h-3 w-3 text-pink-200" /> : <ShieldCheck className="h-3 w-3" />}
                {isAnak ? 'BUKU PINK' : `RESMI RW ${warga.rw}`}
              </span>
            </div>

            {/* Main Content */}
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
              {/* QR Code Container */}
              <div className="rounded-xl bg-white p-2 shadow-inner shrink-0">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code ${warga.nama}`}
                    className="h-36 w-36 object-contain"
                  />
                ) : (
                  <div className="h-36 w-36 flex items-center justify-center text-xs text-slate-400">
                    Memuat QR...
                  </div>
                )}
                <div className={`text-center text-[9px] font-mono font-bold mt-1 ${isAnak ? 'text-pink-900' : 'text-emerald-900'}`}>
                  SCAN DI MEJA POSYANDU
                </div>
              </div>

              {/* Resident Info */}
              <div className="flex-1 space-y-1.5 text-xs text-left w-full">
                <div>
                  <span className="text-[10px] text-white/80 block uppercase">
                    {isAnak ? 'Nama Si Kecil' : 'Nama Warga'}
                  </span>
                  <strong className="text-sm font-bold text-white block truncate">
                    {warga.nama} {warga.namaPanggilan ? `(${warga.namaPanggilan})` : ''}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] text-white/80 block uppercase">
                    {isAnak ? 'ID KIA / No. KK' : 'NIK'}
                  </span>
                  <span className="font-mono text-xs font-semibold text-white bg-black/25 px-2 py-0.5 rounded inline-block">
                    {warga.nik}
                  </span>
                </div>

                {isAnak && warga.namaIbuOrangTua && (
                  <div>
                    <span className="text-[10px] text-white/80 block uppercase">Ibu / Orang Tua</span>
                    <span className="text-xs font-medium text-white block">{warga.namaIbuOrangTua}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/15">
                  <div>
                    <span className="text-[10px] text-white/80 block">Usia Saat Ini</span>
                    <span className="font-semibold">{formatAgeFriendly(warga.tanggalLahir)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/80 block">Wilayah</span>
                    <span>RT {warga.rt} / RW {warga.rw}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-4 pt-2 border-t border-white/15 flex items-center justify-between text-[10px] text-white/90">
              <span>Kel. {warga.kelurahan}</span>
              <span>{isAnak ? 'Tunjukkan saat timbang balita' : 'Tunjukkan saat CKG'}</span>
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-slate-500">
            {isAnak
              ? 'Kartu ini memudahkan Kader Posyandu mencatat tumbuh kembang, imunisasi, dan vitamin tanpa perlu menghafal nomor panjang.'
              : 'QR Code ini berisi identitas unik untuk mempercepat antrean pemeriksaan di Posyandu CKG dan faskes klinik.'}
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3.5">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 transition"
          >
            Tutup
          </button>
          <button
            onClick={handleDownloadQR}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-sm transition ${
              isAnak ? 'bg-pink-600 hover:bg-pink-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Download className="h-4 w-4" />
            Simpan Kartu ke Galeri HP
          </button>
        </div>
      </div>
    </div>
  );
};
