import React, { useState, useEffect } from 'react';
import { User, UserRole, Warga, PemeriksaanCKG, RekamMedis, Klinik, EarlyWarningAlert } from './types';
import {
  INITIAL_USERS,
  INITIAL_WARGA,
  INITIAL_PEMERIKSAAN,
  INITIAL_REKAM_MEDIS,
  INITIAL_KLINIK,
  INITIAL_EWS_ALERTS,
} from './data/initialData';
import schemaSql from './data/schema.sql?raw';
import { Navbar } from './components/Navbar';
import { SchemaModal } from './components/SchemaModal';
import { RegisterModal } from './components/RegisterModal';
import { LoginView } from './views/LoginView';
import { KaderDashboard } from './views/KaderDashboard';
import { RWDashboard } from './views/RWDashboard';
import { SuperAdminDashboard } from './views/SuperAdminDashboard';
import { KlinikDashboard } from './views/KlinikDashboard';
import { WargaDashboard } from './views/WargaDashboard';

export default function App() {
  // Users state with persistence
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('satudata_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {}
    }
    return INITIAL_USERS;
  });

  // Authentication & Current Active User
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('satudata_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      } catch {}
    }
    return null;
  });

  // App Data with LocalStorage Persistence
  const [wargaList, setWargaList] = useState<Warga[]>(() => {
    const saved = localStorage.getItem('satudata_warga');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_WARGA;
  });

  const [pemeriksaanList, setPemeriksaanList] = useState<PemeriksaanCKG[]>(() => {
    const saved = localStorage.getItem('satudata_pemeriksaan');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_PEMERIKSAAN;
  });

  const [rekamMedisList, setRekamMedisList] = useState<RekamMedis[]>(() => {
    const saved = localStorage.getItem('satudata_rekam_medis');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_REKAM_MEDIS;
  });

  const [klinikList, setKlinikList] = useState<Klinik[]>(() => {
    const saved = localStorage.getItem('satudata_klinik');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_KLINIK;
  });

  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>(() => {
    const saved = localStorage.getItem('satudata_alerts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_EWS_ALERTS;
  });

  // Online / Offline Status
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Modals State
  const [isSchemaOpen, setIsSchemaOpen] = useState<boolean>(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('satudata_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('satudata_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('satudata_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('satudata_warga', JSON.stringify(wargaList));
  }, [wargaList]);

  useEffect(() => {
    localStorage.setItem('satudata_pemeriksaan', JSON.stringify(pemeriksaanList));
  }, [pemeriksaanList]);

  useEffect(() => {
    localStorage.setItem('satudata_rekam_medis', JSON.stringify(rekamMedisList));
  }, [rekamMedisList]);

  useEffect(() => {
    localStorage.setItem('satudata_klinik', JSON.stringify(klinikList));
  }, [klinikList]);

  useEffect(() => {
    localStorage.setItem('satudata_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Network Connectivity Listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handlers
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
  };

  const handleSwitchRole = (role: UserRole) => {
    const target = users.find((u) => u.role === role) || INITIAL_USERS.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleRegisterUser = (newUser: User, initialWarga?: Partial<Warga>) => {
    setUsers((prev) => [newUser, ...prev]);

    // If new registered account is a citizen (warga), ensure wargaList entry exists
    if (newUser.role === 'warga' && initialWarga && initialWarga.nik) {
      setWargaList((prev) => {
        const exists = prev.some((w) => w.nik === initialWarga.nik);
        if (exists) return prev;
        const newWargaRecord: Warga = {
          id: `w-${Date.now()}`,
          nik: initialWarga.nik!,
          noKk: initialWarga.noKk || '3201010000000001',
          nama: initialWarga.nama || newUser.nama,
          tanggalLahir: initialWarga.tanggalLahir || '1990-01-01',
          jenisKelamin: initialWarga.jenisKelamin || 'L',
          alamat: initialWarga.alamat || `Jl. Sukamaju Sehat RT ${newUser.rt || '01'}`,
          rt: newUser.rt || '01',
          rw: newUser.rw || '05',
          kelurahan: 'Sukamaju',
          kategoriUsia: initialWarga.kategoriUsia || 'dewasa',
          telepon: newUser.telepon || initialWarga.telepon || '-',
          tanggalRegistrasi: new Date().toISOString().slice(0, 10),
          riwayatPenyakitKeluarga: initialWarga.riwayatPenyakitKeluarga || [],
          qrCodeData: `CKG-RW-${newUser.rt || '01'}-${initialWarga.nik}`,
        };
        return [newWargaRecord, ...prev];
      });
    }

    // If new registered account is a clinic, ensure klinikList entry exists
    if (newUser.role === 'klinik' && newUser.namaKlinik) {
      setKlinikList((prev) => {
        const exists = prev.some((k) => k.nama.toLowerCase() === newUser.namaKlinik?.toLowerCase());
        if (exists) return prev;
        const newKlinik: Klinik = {
          id: `kln-${Date.now().toString().slice(-4)}`,
          kodeKlinik: `KLN-${Date.now().toString().slice(-3)}`,
          nama: newUser.namaKlinik,
          alamat: `Kelurahan Sukamaju RT ${newUser.rt || '01'} / RW ${newUser.rw || '05'}`,
          pjDokter: newUser.nama,
          telepon: newUser.telepon || '021-000000',
          status: 'Aktif',
        };
        return [...prev, newKlinik];
      });
    }

    // Automatically log in to the newly registered account
    setCurrentUser(newUser);
  };

  const handleAddWarga = (newWarga: Warga) => {
    setWargaList((prev) => [newWarga, ...prev]);
  };

  const handleAddPemeriksaan = (newCKG: PemeriksaanCKG) => {
    setPemeriksaanList((prev) => [newCKG, ...prev]);
  };

  const handleAddRekamMedis = (newRM: RekamMedis) => {
    setRekamMedisList((prev) => [newRM, ...prev]);
  };

  const handleAddKlinik = (newKlinik: Klinik) => {
    setKlinikList((prev) => [...prev, newKlinik]);
  };

  const handleAddAlert = (newAlert: EarlyWarningAlert) => {
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // If not logged in, render Login / Register Page
  if (!currentUser) {
    return (
      <LoginView
        users={users}
        klinikList={klinikList}
        onLogin={setCurrentUser}
        onRegisterUser={handleRegisterUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar with PWA install, Multi-Account switcher, & Quick Register */}
      <Navbar
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
        onOpenSchema={() => setIsSchemaOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        isOnline={isOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentUser.role === 'kader' && (
          <KaderDashboard
            currentUser={currentUser}
            wargaList={wargaList}
            pemeriksaanList={pemeriksaanList}
            onAddWarga={handleAddWarga}
            onAddPemeriksaan={handleAddPemeriksaan}
          />
        )}

        {currentUser.role === 'ketua_rw' && (
          <RWDashboard
            currentUser={currentUser}
            wargaList={wargaList}
            pemeriksaanList={pemeriksaanList}
            alerts={alerts}
          />
        )}

        {currentUser.role === 'super_admin' && (
          <SuperAdminDashboard
            currentUser={currentUser}
            users={users}
            wargaList={wargaList}
            pemeriksaanList={pemeriksaanList}
            rekamMedisList={rekamMedisList}
            klinikList={klinikList}
            alerts={alerts}
            onAddAlert={handleAddAlert}
            onAddKlinik={handleAddKlinik}
            onOpenRegister={() => setIsRegisterOpen(true)}
          />
        )}

        {currentUser.role === 'klinik' && (
          <KlinikDashboard
            currentUser={currentUser}
            wargaList={wargaList}
            pemeriksaanList={pemeriksaanList}
            rekamMedisList={rekamMedisList}
            onAddRekamMedis={handleAddRekamMedis}
          />
        )}

        {currentUser.role === 'warga' && (
          <WargaDashboard
            currentUser={currentUser}
            wargaList={wargaList}
            pemeriksaanList={pemeriksaanList}
            rekamMedisList={rekamMedisList}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <div className="font-semibold text-slate-700">
            Sistem Satu Data Kesehatan RW (CKG Terintegrasi) • Progressive Web App (PWA)
          </div>
          <div>
            Kementerian Kesehatan RI • Puskesmas Pembina Sukamaju • Rukun Warga (RW) 05 & RW 06
          </div>
          <div className="pt-2 text-[11px] text-slate-400">
            Mendukung Registrasi Mandiri RT/RW/Kader • Identitas Anak/Balita Tanpa NIK • Scan Kamera QR Code • Print Thermal 58mm/80mm • Ekspor Excel .xlsx • Early Warning System (EWS)
          </div>
        </div>
      </footer>

      {/* PostgreSQL Database Schema Modal */}
      <SchemaModal
        isOpen={isSchemaOpen}
        onClose={() => setIsSchemaOpen(false)}
        sqlContent={schemaSql}
      />

      {/* Register Modal (accessible from anywhere in the app) */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        existingUsers={users}
        klinikList={klinikList}
        onRegister={handleRegisterUser}
        onSuccessNavigate={(registeredUser) => {
          setCurrentUser(registeredUser);
          setIsRegisterOpen(false);
        }}
      />
    </div>
  );
}
