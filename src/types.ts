export type UserRole = 'super_admin' | 'klinik' | 'ketua_rw' | 'kader' | 'warga';

export interface User {
  id: string;
  username: string;
  password?: string;
  nama: string;
  role: UserRole;
  rw?: string;
  rt?: string;
  nik?: string; // Khusus role warga
  klinikId?: string; // Khusus role klinik
  namaKlinik?: string; // Nama klinik bila role klinik
  posyandu?: string; // Misal: Posyandu Melati RT 02
  jabatan?: string; // Misal: Ketua RT 02, Kader Posyandu, Ketua RW 05
  nip?: string; // Khusus petugas Puskesmas / Dinas
  telepon?: string;
  foto?: string;
  createdAt?: string;
}

export type KategoriUsia = 'balita' | 'anak' | 'remaja' | 'dewasa' | 'lansia';

export interface Warga {
  id: string;
  nik: string; // NIK 16 digit resmi ATAU ID KIA Anak (contoh: "KIA-320101...-01")
  noKk: string;
  nama: string;
  namaPanggilan?: string;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  telepon: string;
  golonganDarah?: 'A' | 'B' | 'AB' | 'O' | '-';
  pekerjaan?: string;
  riwayatPenyakitKeluarga?: string[];
  tanggalRegistrasi: string;
  registeredByKaderId?: string;
  
  // Penanganan Warga Ramah & Khusus Anak / Balita Tanpa NIK Mandiri
  isAnakTanpaNik?: boolean;
  kategoriUsia?: KategoriUsia;
  namaIbuOrangTua?: string;
  anakKe?: number;
  punyaBukuKia?: boolean;
  hubunganKeluarga?: 'Kepala Keluarga' | 'Istri' | 'Anak' | 'Orang Tua / Lansia' | 'Famili Lain';
  qrCodeData?: string;
}

export type CKGStatus = 'SEHAT' | 'SIAGA' | 'WASPADA';
export type JenisPemeriksaan = 'dewasa' | 'balita_anak';

export interface PemeriksaanCKG {
  id: string;
  wargaId: string;
  nik: string;
  namaWarga: string;
  rt: string;
  rw: string;
  tanggal: string;
  kaderId: string;
  namaKader: string;
  
  // Tipe pemeriksaan (Dewasa / Posbindu PTM vs Balita / Posyandu KMS)
  jenisPemeriksaan?: JenisPemeriksaan;

  // Parameter fisik Dewasa/Lansia (opsional untuk balita)
  sistolik?: number; // mmHg
  diastolik?: number; // mmHg
  gulaDarah?: number; // mg/dL (GDS)
  kolesterol?: number; // mg/dL
  asamUrat?: number; // mg/dL
  lingkarPerut?: number; // cm

  // Parameter pertumbuhan (Dewasa & Balita)
  beratBadan: number; // kg
  tinggiBadan: number; // cm (atau panjang badan untuk bayi)
  bmi: number;

  // Parameter Khusus Tumbuh Kembang Balita & Anak (KMS Posyandu)
  lingkarKepala?: number; // cm
  lingkarLenganAtas?: number; // LiLA cm (indikator status gizi balita)
  statusGiziKms?: 'Gizi Baik' | 'Risiko Kurang / Stunting' | 'Gizi Buruk' | 'Gizi Lebih';
  imunisasiDiberikan?: string;
  vitaminA?: boolean;
  obatCacing?: boolean;
  asiEksklusif?: boolean;

  // Status otomatis & rujukan
  status: CKGStatus;
  alasanSiaga: string[];
  catatanKader?: string;
  pesanKasihKader?: string; // Pesan ramah dan membumi untuk orang tua / warga
  dirujukKeKlinik: boolean;
}

export interface RekamMedis {
  id: string;
  wargaId: string;
  nik: string;
  namaWarga: string;
  klinikId: string;
  namaKlinik: string;
  dokterNama: string;
  tanggal: string;
  keluhanUtama: string;
  diagnosa: string;
  kodeIcd10?: string;
  kategoriPenyakit: 'Menular' | 'Tidak Menular' | 'Umum';
  namaPenyakit: string; // Misal: "Demam Berdarah Dengue (DBD)", "Hipertensi", "ISPA"
  resepObat: string;
  tindakanMedis: string;
  statusKondisi: 'Rawat Jalan' | 'Rujuk Puskesmas' | 'Sembuh' | 'Observasi';
}

export interface Klinik {
  id: string;
  kodeKlinik: string;
  nama: string;
  alamat: string;
  pjDokter: string;
  telepon: string;
  status: 'Aktif' | 'Nonaktif';
}

export interface EarlyWarningAlert {
  id: string;
  rw: string;
  rt: string;
  penyakit: string;
  jumlahKasus: number;
  periode: string;
  tingkatBahaya: 'TINGGI' | 'SEDANG' | 'RENDAH';
  status: 'Aktif' | 'Terkendali' | 'Dalam Investigasi';
  pesanPeringatan: string;
  rekomendasiTindakan: string[];
  tanggalRilis: string;
  sumber: 'Puskesmas Kecamatan' | 'Sistem AI EWS RW';
}
