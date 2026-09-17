import React from 'react';
import {
  HeartPulse,
  LogOut,
  Database,
  DownloadCloud,
  WifiOff,
  ChevronDown,
  Shield,
  Activity,
  Users,
  Building2,
  QrCode,
  UserPlus,
  Lock
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  currentUser: UserType;
  users?: UserType[];
  onSwitchUser?: (user: UserType) => void;
  onSwitchRole?: (role: UserRole) => void;
  onLogout: () => void;
  onOpenSchema: () => void;
  onOpenRegister: () => void;
  isOnline: boolean;
}

const ROLE_LABELS: Record<UserRole, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  super_admin: {
    label: 'Super Admin (Puskesmas)',
    bg: 'bg-purple-100',
    text: 'text-purple-800 border-purple-200',
    icon: <Building2 className="h-3.5 w-3.5 text-purple-700" />,
  },
  klinik: {
    label: 'Klinik / Dokter',
    bg: 'bg-blue-100',
    text: 'text-blue-800 border-blue-200',
    icon: <Activity className="h-3.5 w-3.5 text-blue-700" />,
  },
  ketua_rw: {
    label: 'Ketua RW (Dashboard EWS)',
    bg: 'bg-amber-100',
    text: 'text-amber-800 border-amber-200',
    icon: <Shield className="h-3.5 w-3.5 text-amber-700" />,
  },
  kader: {
    label: 'RT / Kader (Scan & CKG)',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800 border-emerald-200',
    icon: <Users className="h-3.5 w-3.5 text-emerald-700" />,
  },
  warga: {
    label: 'Warga Mandiri',
    bg: 'bg-cyan-100',
    text: 'text-cyan-800 border-cyan-200',
    icon: <QrCode className="h-3.5 w-3.5 text-cyan-700" />,
  },
};

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onOpenSchema,
  onOpenRegister,
  isOnline,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);
  const [showIOSModal, setShowIOSModal] = React.useState(false);

  const roleMeta = ROLE_LABELS[currentUser.role];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white shadow-sm shrink-0">
              <HeartPulse className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight leading-none">
                  Satu Data Kesehatan RW
                </h1>
                <span className="hidden sm:inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  CKG PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Integrasi Posyandu RT/RW, Puskesmas & Faskes Mandiri
              </p>
            </div>
          </div>

          {/* Center/Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Offline indicator */}
            {!isOnline && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-800 border border-amber-200 animate-pulse">
                <WifiOff className="h-3 w-3" />
                <span className="hidden md:inline">Mode Offline</span>
              </span>
            )}

            {/* PWA In-App Install Button */}
            {!isInstalled && isInstallable && (
              <button
                onClick={install}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95"
                title="Install Web App ke Layar Utama HP"
              >
                <DownloadCloud className="h-4 w-4" />
                <span className="hidden sm:inline">Install PWA</span>
              </button>
            )}

            {!isInstalled && isIOS && (
              <button
                onClick={() => setShowIOSModal(true)}
                className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                title="Petunjuk Install di iPhone/iPad"
              >
                <DownloadCloud className="h-3.5 w-3.5 text-slate-600" />
                <span className="hidden sm:inline">Install iOS</span>
              </button>
            )}

            {/* Quick Register Button on Navbar */}
            <button
              onClick={onOpenRegister}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
              title="Daftarkan Akun RT, RW, Kader atau Dokter Baru"
            >
              <UserPlus className="h-3.5 w-3.5 text-emerald-700" />
              <span className="hidden md:inline">+ Daftar Akun</span>
            </button>

            {/* Database Schema Button */}
            <button
              onClick={onOpenSchema}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              title="Lihat Struktur SQL Database PostgreSQL"
            >
              <Database className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden lg:inline">SQL Schema</span>
            </button>

            {/* Role / User Switcher Pill / Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${roleMeta.bg} ${roleMeta.text}`}
              >
                {roleMeta.icon}
                <div className="max-w-[120px] sm:max-w-[160px] truncate text-left">
                  <span className="font-semibold">{currentUser.nama}</span>
                  {currentUser.rt && (
                    <span className="ml-1 text-[10px] opacity-75">
                      (RT {currentUser.rt})
                    </span>
                  )}
                  {currentUser.role === 'ketua_rw' && currentUser.rw && (
                    <span className="ml-1 text-[10px] opacity-75">
                      (RW {currentUser.rw})
                    </span>
                  )}
                </div>
                <ChevronDown className="h-3 w-3 opacity-70 shrink-0" />
              </button>

              {showRoleMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRoleMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 max-h-[85vh] overflow-y-auto rounded-xl bg-white p-2 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
                    {/* Header: Current User */}
                    <div className="px-3 py-2 border-b border-slate-100 mb-2">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Akun Sedang Aktif:
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.nama}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 mt-0.5">
                        <span className="capitalize">{roleMeta.label}</span>
                        {currentUser.rt && <span>• RT {currentUser.rt}</span>}
                        {currentUser.rw && <span>• RW {currentUser.rw}</span>}
                        {currentUser.posyandu && <span>• {currentUser.posyandu}</span>}
                      </div>
                    </div>

                    {/* Quick Action: Register New Account */}
                    <div className="mb-2 px-1">
                      <button
                        onClick={() => {
                          setShowRoleMenu(false);
                          onOpenRegister();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>+ Daftarkan Akun RT/RW/Kader Baru</span>
                      </button>
                    </div>

                    {/* Active User Detailed Security & Profile Card */}
                    <div className="p-2 space-y-2.5 text-xs">
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 space-y-2 text-slate-700">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">Username:</span>
                          <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            @{currentUser.username}
                          </span>
                        </div>
                        {currentUser.nip && (
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-500">NIP:</span>
                            <span className="font-mono text-slate-800">{currentUser.nip}</span>
                          </div>
                        )}
                        {currentUser.nik && (
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-500">NIK:</span>
                            <span className="font-mono text-slate-800">{currentUser.nik}</span>
                          </div>
                        )}
                        {currentUser.telepon && (
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-500">Kontak:</span>
                            <span className="text-slate-800">{currentUser.telepon}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500">Status Keamanan:</span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                            <Shield className="h-3 w-3" /> Terotentikasi & Aman
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 bg-amber-50/90 p-2.5 rounded-xl border border-amber-200/80 flex items-start gap-1.5 leading-relaxed">
                        <Lock className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span>
                          Sesi akun ini terlindungi kata sandi. Untuk berganti akun petugas atau warga, silakan tekan <strong>Keluar / Ganti Akun</strong>.
                        </span>
                      </div>
                    </div>

                    {/* Logout / Switch Account */}
                    <div className="border-t border-slate-100 mt-2 pt-2 px-1">
                      <button
                        onClick={() => {
                          setShowRoleMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 transition border border-red-200 active:scale-98"
                      >
                        <LogOut className="h-4 w-4 text-red-600" />
                        <span>Keluar / Ganti Akun</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* iOS Install Prompt Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Install di iPhone / iPad (PWA)</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              1. Buka browser <strong>Safari</strong> di iOS Anda.<br />
              2. Tekan tombol <strong>Bagikan (Share)</strong> ikon kotak berpanah ke atas.<br />
              3. Gulir ke bawah dan pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.<br />
              4. Aplikasi CKG RW siap dibuka secara offline layaknya aplikasi native!
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
            >
              Mengerti & Tutup
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
