import React, { useState } from 'react';
import {
  ShieldAlert,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  HeartPulse,
  Activity,
  MapPin,
  Calendar,
  Share2,
  Check,
  Send
} from 'lucide-react';
import { User, Warga, PemeriksaanCKG, EarlyWarningAlert } from '../types';

interface RWDashboardProps {
  currentUser: User;
  wargaList: Warga[];
  pemeriksaanList: PemeriksaanCKG[];
  alerts: EarlyWarningAlert[];
  onAcknowledgeAlert?: (alertId: string) => void;
}

export const RWDashboard: React.FC<RWDashboardProps> = ({
  currentUser,
  wargaList,
  pemeriksaanList,
  alerts,
}) => {
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [activeAlertTab, setActiveAlertTab] = useState<'semua' | 'aktif'>('aktif');

  const rwNumber = currentUser.rw || '05';

  // Filter RW 05 data
  const rwWarga = wargaList.filter((w) => w.rw === rwNumber);
  const rwPemeriksaan = pemeriksaanList.filter((p) => p.rw === rwNumber);

  // Health Metrics
  const totalWarga = rwWarga.length;
  const totalDiperiksa = rwPemeriksaan.length;
  const siagaCount = rwPemeriksaan.filter((p) => p.status === 'SIAGA').length;
  const sehatCount = rwPemeriksaan.filter((p) => p.status === 'SEHAT').length;

  const siagaPercentage = totalDiperiksa > 0 ? Math.round((siagaCount / totalDiperiksa) * 100) : 0;
  const sehatPercentage = totalDiperiksa > 0 ? 100 - siagaPercentage : 0;

  // RT Breakdown (RT 01 - RT 05)
  const rtList = ['01', '02', '03', '04', '05'];
  const rtStats = rtList.map((rt) => {
    const checksInRt = rwPemeriksaan.filter((p) => p.rt === rt);
    const siagaInRt = checksInRt.filter((p) => p.status === 'SIAGA').length;
    const sehatInRt = checksInRt.filter((p) => p.status === 'SEHAT').length;
    const wargaCount = rwWarga.filter((w) => w.rt === rt).length;
    return {
      rt,
      totalWarga: wargaCount,
      totalChecks: checksInRt.length,
      sehat: sehatInRt,
      siaga: siagaInRt,
    };
  });

  // Early Warning Alerts for this RW
  const rwAlerts = alerts.filter((a) => a.rw === rwNumber);
  const activeAlerts = rwAlerts.filter((a) => a.status === 'Aktif');

  const handleSendBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 5000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* RW Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-0.5 text-xs font-semibold text-amber-100">
              <MapPin className="h-3.5 w-3.5" />
              Pusat Komando Wilayah RW {rwNumber} • Kelurahan Sukajadi
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Dashboard Kesehatan Warga & Early Warning System (EWS)
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/90 max-w-2xl">
              Pantau tren kesehatan warga secara real-time. Sistem akan membunyikan alarm dini otomatis jika terdeteksi lonjakan penyakit menular (seperti DBD) di tingkat RT.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendBroadcast}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-amber-900 shadow-md hover:bg-amber-50 transition active:scale-95"
            >
              {broadcastSent ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Instruksi Terkirim ke Kader RT!</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 text-amber-700" />
                  <span>Kirim Alarm PSN ke Semua RT</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 🚨 EARLY WARNING SYSTEM (EWS) ALARM BANNER */}
      {activeAlerts.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 p-5 text-white shadow-xl border-2 border-red-400/80 animate-pulse">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-xs">
                <BellRing className="h-7 w-7 text-yellow-300 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-yellow-400 text-red-950 font-black px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    ALARM DINI DARURAT
                  </span>
                  <span className="text-xs text-red-100 font-medium">
                    Sumber: Puskesmas Pembina Sukamaju
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {activeAlerts[0].pesanPeringatan}
                </h3>
                <p className="text-xs text-red-100">
                  Target Intervensi: Wilayah <strong>RT {activeAlerts[0].rt} / RW {rwNumber}</strong> ({activeAlerts[0].jumlahKasus} Kasus Terkonfirmasi)
                </p>
              </div>
            </div>

            <div className="shrink-0 bg-white/10 p-3 rounded-xl backdrop-blur-xs text-xs space-y-1.5 border border-white/20">
              <div className="font-bold text-yellow-300">Rekomendasi Tindakan RW:</div>
              <ul className="space-y-1 text-[11px] text-white">
                {activeAlerts[0].rekomendasiTindakan.slice(0, 2).map((rek, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                    <span>{rek}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Warga */}
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Warga RW {rwNumber}</span>
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalWarga}</div>
          <div className="mt-1 text-[11px] text-slate-500">Terdaftar di database RT 01-05</div>
        </div>

        {/* Card 2: Total Diperiksa CKG */}
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Diperiksa CKG</span>
            <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-700">{totalDiperiksa}</div>
          <div className="mt-1 text-[11px] text-slate-500">Total pemeriksaan terlaksana</div>
        </div>

        {/* Card 3: Warga Sehat */}
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kondisi Sehat</span>
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{sehatCount}</div>
          <div className="mt-1 text-[11px] text-emerald-700 font-semibold">
            {sehatPercentage}% dalam batas normal
          </div>
        </div>

        {/* Card 4: Warga Siaga (⚠️) */}
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Status SIAGA (⚠️)</span>
            <div className="rounded-lg bg-red-100 p-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-red-600">{siagaCount}</div>
          <div className="mt-1 text-[11px] text-red-600 font-semibold">
            {siagaPercentage}% perlu rujukan klinik
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Chart: Sehat vs Siaga Proportion */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-emerald-600" />
            Rasio Kesehatan Warga (Sehat vs Siaga)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Berdasarkan pemeriksaan fisik CKG Posyandu RW {rwNumber}
          </p>

          {/* Donut Chart Visual via SVG */}
          <div className="mt-6 flex flex-col items-center justify-center">
            <div className="relative h-44 w-44">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="3.8"
                />
                {/* Sehat Segment (Green) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="3.8"
                  strokeDasharray={`${sehatPercentage} ${100 - sehatPercentage}`}
                  strokeDashoffset="0"
                />
                {/* Siaga Segment (Red) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="3.8"
                  strokeDasharray={`${siagaPercentage} ${100 - siagaPercentage}`}
                  strokeDashoffset={`${-sehatPercentage}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900">{totalDiperiksa}</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Cek
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-2 gap-4 w-full text-xs">
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 border border-emerald-200">
                <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-900">{sehatCount} Warga</div>
                  <div className="text-[10px] text-emerald-700">Sehat ({sehatPercentage}%)</div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-2.5 border border-red-200">
                <span className="h-3 w-3 rounded-full bg-red-500 shrink-0" />
                <div>
                  <div className="font-bold text-red-900">{siagaCount} Warga</div>
                  <div className="text-[10px] text-red-700">Siaga ({siagaPercentage}%)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RT Health Distribution Bar Breakdown */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                Distribusi Status Kesehatan Tiap RT
              </h3>
              <p className="text-xs text-slate-500">
                Pemantauan komparasi beban kesehatan per rukun tetangga
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">Wilayah RW {rwNumber}</span>
          </div>

          <div className="mt-4 space-y-4">
            {rtStats.map((stat) => {
              const total = stat.totalChecks || 1;
              const sehatPct = Math.round((stat.sehat / total) * 100);
              const siagaPct = Math.round((stat.siaga / total) * 100);

              return (
                <div key={stat.rt} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      RT {stat.rt} ({stat.totalChecks} Warga Diperiksa)
                    </span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-emerald-700 font-semibold">Sehat: {stat.sehat}</span>
                      <span className="text-red-600 font-semibold">Siaga: {stat.siaga}</span>
                    </div>
                  </div>

                  {/* Horizontal Multi-color Bar */}
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      style={{ width: `${sehatPct}%` }}
                      className="bg-emerald-500 transition-all duration-500"
                      title={`Sehat: ${stat.sehat} (${sehatPct}%)`}
                    />
                    <div
                      style={{ width: `${siagaPct}%` }}
                      className="bg-red-500 transition-all duration-500"
                      title={`Siaga: ${stat.siaga} (${siagaPct}%)`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notice Note */}
          <div className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200">
            <span className="font-bold text-slate-800">Catatan Ketua RW:</span> Warga dengan status
            SIAGA telah otomatis mendapatkan surat rujukan ke <strong>Klinik Sehat Prima</strong> dan Puskesmas.
          </div>
        </div>
      </div>

      {/* Early Warning Alerts Detail Table from Puskesmas */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              Tabel Peringatan Dini Penyakit dari Puskesmas & Sistem EWS
            </h3>
            <p className="text-xs text-slate-500">
              Notifikasi lonjakan kasus penyakit menular dan tidak menular di lingkungan RW {rwNumber}
            </p>
          </div>

          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveAlertTab('aktif')}
              className={`px-3 py-1 rounded-lg transition ${
                activeAlertTab === 'aktif' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Alert Aktif ({activeAlerts.length})
            </button>
            <button
              onClick={() => setActiveAlertTab('semua')}
              className={`px-3 py-1 rounded-lg transition ${
                activeAlertTab === 'semua' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Semua ({rwAlerts.length})
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Tingkat Bahaya</th>
                <th className="py-2.5 px-3">Penyakit</th>
                <th className="py-2.5 px-3">Wilayah RT</th>
                <th className="py-2.5 px-3">Kasus</th>
                <th className="py-2.5 px-3">Pesan & Rekomendasi Tindakan</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(activeAlertTab === 'aktif' ? activeAlerts : rwAlerts).map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3">
                    {alert.tingkatBahaya === 'TINGGI' ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 font-bold text-red-700 border border-red-200">
                        <AlertTriangle className="h-3 w-3" />
                        TINGGI
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 font-bold text-amber-800 border border-amber-200">
                        SEDANG
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {alert.penyakit}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    RT {alert.rt} / RW {alert.rw}
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded-full bg-red-50 text-red-700 font-black px-2.5 py-0.5">
                      {alert.jumlahKasus} Kasus
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-md">
                    <div className="font-medium text-slate-800">{alert.pesanPeringatan}</div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      Rekomendasi: {alert.rekomendasiTindakan.join(', ')}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded-md bg-emerald-50 text-emerald-800 px-2 py-0.5 font-semibold text-[10px] border border-emerald-200">
                      {alert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
