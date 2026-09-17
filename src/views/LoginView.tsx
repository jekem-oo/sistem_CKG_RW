import React, { useState } from 'react';
import {
  HeartPulse,
  ShieldCheck,
  Building2,
  Activity,
  Shield,
  Users,
  QrCode,
  ArrowRight,
  Lock,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { User, UserRole, Warga, Klinik } from '../types';
import { RegisterForm } from '../components/RegisterForm';

interface LoginViewProps {
  users: User[];
  klinikList?: Klinik[];
  onLogin: (user: User) => void;
  onRegisterUser: (newUser: User, initialWarga?: Partial<Warga>) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  klinikList = [],
  onLogin,
  onRegisterUser,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginCategory, setLoginCategory] = useState<'petugas' | 'warga'>('petugas');
  
  // Credentials state - empty by default (DO NOT prefill credentials for privacy & security)
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nikInput, setNikInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (loginCategory === 'warga') {
      const cleanNik = nikInput.replace(/\D/g, '').trim();
      if (!cleanNik) {
        setLoginError('Silakan masukkan NIK Anda.');
        return;
      }

      if (cleanNik.length !== 16) {
        setLoginError('NIK harus terdiri dari 16 digit angka.');
        return;
      }

      const citizen = users.find((u) => u.role === 'warga' && u.nik === cleanNik);
      if (citizen) {
        // Verify password
        const validPassword = citizen.password || 'password123';
        if (passwordInput.trim() !== validPassword) {
          setLoginError('Kata sandi untuk NIK ini salah. Silakan periksa kembali.');
          return;
        }
        onLogin(citizen);
        return;
      } else {
        setLoginError('NIK belum terdaftar di sistem Satu Data Kesehatan RW. Silakan klik tab "Daftar Akun Baru" di atas untuk mendaftarkan akun warga Anda.');
        return;
      }
    }

    // Category Petugas (RT, RW, Kader, Klinik, Super Admin)
    const cleanUsername = usernameInput.trim().toLowerCase();
    if (!cleanUsername) {
      setLoginError('Silakan masukkan username akun Anda.');
      return;
    }

    if (!passwordInput) {
      setLoginError('Silakan masukkan kata sandi akun Anda.');
      return;
    }

    const matchedUser = users.find(
      (u) => u.username.toLowerCase() === cleanUsername && u.role !== 'warga'
    );

    if (!matchedUser) {
      setLoginError(`Username "${usernameInput}" tidak ditemukan. Pastikan username sudah benar atau daftarkan akun baru.`);
      return;
    }

    // Strict Password Verification
    const expectedPassword = matchedUser.password || 'password123';
    if (passwordInput !== expectedPassword) {
      setLoginError('Kata sandi yang Anda masukkan salah. Silakan coba kembali.');
      return;
    }

    // Login successful
    onLogin(matchedUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-slate-50 to-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white shadow-lg shadow-emerald-700/20">
          <HeartPulse className="h-8 w-8" />
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Satu Data Kesehatan RW
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Portal Terintegrasi Cek Kesehatan Gratis (CKG) Posyandu Siklus Hidup, RT, RW & Puskesmas
        </p>

        {/* Tab Selector: Masuk vs Daftar Baru */}
        <div className="mt-6 inline-flex p-1 bg-slate-200/80 rounded-xl max-w-md w-full shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="h-4 w-4 text-emerald-600" />
            <span>Masuk Akun</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setLoginError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition ${
              activeTab === 'register'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="h-4 w-4 text-emerald-600" />
            <span>Daftar Akun Baru</span>
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-6 px-5 sm:px-8 shadow-xl rounded-2xl border border-slate-200">
          {activeTab === 'register' ? (
            <RegisterForm
              existingUsers={users}
              klinikList={klinikList}
              onRegister={onRegisterUser}
              onSuccessNavigate={onLogin}
              onCancel={() => setActiveTab('login')}
            />
          ) : (
            <div>
              {/* Category Selector: Petugas vs Warga */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Pilih Kategori Pengguna:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginCategory('petugas');
                      setLoginError(null);
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                      loginCategory === 'petugas'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Users className="h-4 w-4 text-emerald-700" />
                    <span>Petugas & Faskes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginCategory('warga');
                      setLoginError(null);
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                      loginCategory === 'warga'
                        ? 'border-cyan-600 bg-cyan-50 text-cyan-900 ring-2 ring-cyan-600/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <QrCode className="h-4 w-4 text-cyan-700" />
                    <span>Warga Mandiri</span>
                  </button>
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  {loginCategory === 'petugas'
                    ? 'Untuk Ketua RT, Kader Posyandu, Ketua RW, Dokter Klinik & Puskesmas.'
                    : 'Untuk warga yang ingin mengecek hasil skrining CKG & Kartu QR mandiri.'}
                </div>
              </div>

              {/* Error Message */}
              {loginError && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Secure Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {loginCategory === 'warga' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nomor Induk Kependudukan (NIK 16 Digit)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={16}
                        value={nikInput}
                        onChange={(e) => setNikInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="Contoh: 3201011205750003"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-cyan-600 focus:outline-hidden focus:ring-1 focus:ring-cyan-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kata Sandi Akun Warga
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="Masukkan kata sandi Anda"
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-10 text-sm focus:border-cyan-600 focus:outline-hidden focus:ring-1 focus:ring-cyan-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                          title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Username Akun Petugas
                      </label>
                      <input
                        type="text"
                        required
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="Contoh: kader.siti atau rw05.bambang"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kata Sandi
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="Masukkan kata sandi akun Anda"
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-10 text-sm focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                          title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition active:scale-98"
                >
                  <Lock className="h-4 w-4" />
                  <span>Masuk Aplikasi</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Security Privacy Notice */}
              <div className="mt-5 rounded-xl bg-slate-50 p-3 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Privasi & Keamanan Data Warga:</strong> Akses rekam medis dan data skrining terlindungi otentikasi kata sandi. Dilarang menggunakan akun milik pihak lain tanpa wewenang.
                </div>
              </div>

              {/* Link to Register Tab */}
              <div className="mt-5 pt-4 border-t border-slate-200 text-center">
                <p className="text-xs text-slate-600">
                  Belum memiliki akun pengurus atau warga?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setLoginError(null);
                    }}
                    className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    Daftar Akun Baru &rarr;
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
