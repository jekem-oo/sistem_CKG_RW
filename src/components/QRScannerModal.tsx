import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';
import { Warga } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (nik: string) => void;
  wargaList: Warga[];
  title?: string;
  subtitle?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  wargaList,
  title = 'Scan QR Code Warga',
  subtitle = 'Arahkan kamera ke QR Code Kartu CKG fisik warga',
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const qrRegionId = 'html5qr-code-region';
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setScannedResult(null);
      setCameraError(null);
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setCameraError(null);
        setIsScanning(true);

        // Tunggu DOM elemen siap
        await new Promise((res) => setTimeout(res, 200));

        const element = document.getElementById(qrRegionId);
        if (!element || !isMounted) return;

        const html5QrCode = new Html5Qrcode(qrRegionId);
        html5QrCodeRef.current = html5QrCode;

        const qrCodeSuccessCallback = (decodedText: string) => {
          let nikFound = decodedText.trim();
          // Jika decodedText adalah JSON, coba parse
          try {
            const parsed = JSON.parse(decodedText);
            if (parsed.nik) nikFound = parsed.nik;
          } catch {
            // plain text NIK
          }

          setScannedResult(nikFound);
          stopScanner();
          onScanSuccess(nikFound);
        };

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          qrCodeSuccessCallback,
          () => {
            // scanning loop ignore failures
          }
        );
      } catch (err: unknown) {
        console.warn('Camera scanner error:', err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        setCameraError(
          `Kamera tidak dapat diakses (${errorMsg}). Anda dapat menggunakan tombol simulasi cepat warga di bawah.`
        );
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().then(() => {
            html5QrCodeRef.current?.clear();
          }).catch(() => {});
        }
      } catch {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSelect = (nik: string) => {
    setScannedResult(nik);
    stopScanner();
    onScanSuccess(nik);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Scanner Box */}
          <div className="relative overflow-hidden rounded-xl bg-slate-950 min-h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-emerald-500/50">
            <div id={qrRegionId} className="w-full h-full min-h-[260px]" />

            {/* Scanning Laser Line Overlay */}
            {isScanning && !cameraError && (
              <div className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_12px_#34d399]" />
            )}

            {cameraError && (
              <div className="p-6 text-center text-slate-300 space-y-2">
                <AlertCircle className="mx-auto h-8 w-8 text-amber-400" />
                <p className="text-xs text-amber-200 max-w-xs mx-auto">{cameraError}</p>
              </div>
            )}
          </div>

          {scannedResult && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>
                QR Code Berhasil Terbaca! NIK: <strong>{scannedResult}</strong>
              </span>
            </div>
          )}

          {/* Quick Select Shortcut for Testing / Device without camera */}
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                Atau Pilih Cepat Warga Terdaftar (Simulasi Scan)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {wargaList.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleManualSelect(w.nik)}
                  type="button"
                  className="flex items-start gap-2 rounded-lg bg-white p-2 text-left border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-xs group"
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0 group-hover:scale-125 transition" />
                  <div className="truncate">
                    <div className="font-medium text-slate-800 truncate">{w.nama}</div>
                    <div className="font-mono text-[10px] text-slate-500">NIK: {w.nik}</div>
                    <div className="text-[10px] text-emerald-700">RT {w.rt} / RW {w.rw}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 transition"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
