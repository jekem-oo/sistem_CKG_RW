-- ==============================================================================
-- SISTEM SATU DATA KESEHATAN RW (CKG TERINTEGRASI)
-- Database Architecture: PostgreSQL 15+ / 16+
-- Relational Schema: users, klinik, warga, pemeriksaan_ckg, rekam_medis, early_warning_alerts
-- ==============================================================================

-- 1. ENUM DEFINITIONS
CREATE TYPE user_role_enum AS ENUM (
    'super_admin',  -- Puskesmas / Dinas Kesehatan
    'klinik',       -- Dokter / Tenaga Medis Klinik
    'ketua_rw',     -- Pimpinan Wilayah RW (Dashboard & Early Warning)
    'kader',        -- RT / Kader Kesehatan Posyandu CKG
    'warga'         -- Warga Masyarakat (Akses Mandiri via NIK)
);

CREATE TYPE jenis_kelamin_enum AS ENUM ('L', 'P');

CREATE TYPE ckg_status_enum AS ENUM ('SEHAT', 'SIAGA', 'WASPADA');

CREATE TYPE alert_severity_enum AS ENUM ('RENDAH', 'SEDANG', 'TINGGI');

-- 2. TABEL KLINIK / FASILITAS KESEHATAN
CREATE TABLE klinik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_klinik VARCHAR(20) UNIQUE NOT NULL,
    nama_klinik VARCHAR(150) NOT NULL,
    alamat TEXT NOT NULL,
    pj_dokter VARCHAR(120) NOT NULL,
    no_telepon VARCHAR(25) NOT NULL,
    status_operasional VARCHAR(20) DEFAULT 'Aktif' CHECK (status_operasional IN ('Aktif', 'Nonaktif')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL USERS (Autentikasi 5 Multi-Role)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(60) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    role user_role_enum NOT NULL,
    rw VARCHAR(5),                        -- Terisi jika ketua_rw / kader
    rt VARCHAR(5),                        -- Terisi jika kader
    nik_warga VARCHAR(16) UNIQUE,         -- Relasi jika role = 'warga'
    klinik_id UUID REFERENCES klinik(id) ON DELETE SET NULL, -- Relasi jika role = 'klinik'
    no_telepon VARCHAR(25),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL WARGA (Data Demografi & Identitas QR Code)
CREATE TABLE warga (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nik VARCHAR(16) UNIQUE NOT NULL,
    no_kk VARCHAR(16) NOT NULL,
    nama VARCHAR(150) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    jenis_kelamin jenis_kelamin_enum NOT NULL,
    golongan_darah VARCHAR(3) DEFAULT '-',
    alamat TEXT NOT NULL,
    rt VARCHAR(5) NOT NULL,
    rw VARCHAR(5) NOT NULL,
    kelurahan VARCHAR(80) NOT NULL DEFAULT 'Sukajadi',
    kecamatan VARCHAR(80) NOT NULL DEFAULT 'Sukamaju',
    kota_kabupaten VARCHAR(80) NOT NULL DEFAULT 'Kota Sehat',
    no_telepon VARCHAR(25),
    pekerjaan VARCHAR(80),
    riwayat_penyakit_keluarga TEXT[],    -- Array riwayat (Hipertensi, Diabetes, dll)
    qr_code_hash VARCHAR(64) UNIQUE,     -- Hash NIK untuk verifikasi QR
    registered_by_kader UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL PEMERIKSAAN CKG (Cek Kesehatan Gratis oleh Kader)
CREATE TABLE pemeriksaan_ckg (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id UUID NOT NULL REFERENCES warga(id) ON DELETE CASCADE,
    kader_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    tanggal_pemeriksaan TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Parameter Pengukuran Fisik
    tensi_sistolik INT NOT NULL,         -- Standar mmHg
    tensi_diastolik INT NOT NULL,        -- Standar mmHg
    gula_darah_sewaktu INT NOT NULL,     -- mg/dL
    kolesterol_total INT NOT NULL,       -- mg/dL
    asam_urat NUMERIC(4,1),              -- mg/dL
    berat_badan NUMERIC(5,2) NOT NULL,   -- kg
    tinggi_badan NUMERIC(5,2) NOT NULL,  -- cm
    lingkar_perut NUMERIC(5,2),          -- cm
    bmi NUMERIC(4,2) GENERATED ALWAYS AS (
        ROUND(berat_badan / POWER(tinggi_badan / 100.0, 2), 2)
    ) STORED,

    -- Logika Otomatis Status Kesehatan
    status_kesehatan ckg_status_enum NOT NULL DEFAULT 'SEHAT',
    alasan_siaga TEXT[],                 -- Array alasan (misal: "Tensi Tinggi >=140", "GDS >200")
    catatan_kader TEXT,
    dirujuk_ke_klinik BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABEL REKAM MEDIS KLINIK / DOKTER
CREATE TABLE rekam_medis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id UUID NOT NULL REFERENCES warga(id) ON DELETE CASCADE,
    klinik_id UUID NOT NULL REFERENCES klinik(id) ON DELETE RESTRICT,
    dokter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    pemeriksaan_ckg_ref_id UUID REFERENCES pemeriksaan_ckg(id) ON DELETE SET NULL,
    tanggal_kunjungan TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    keluhan_utama TEXT NOT NULL,
    diagnosa_medis TEXT NOT NULL,
    kode_icd10 VARCHAR(10),              -- e.g. A90 (DBD), I10 (Hipertensi), E11 (DM Tipe 2)
    nama_penyakit VARCHAR(120) NOT NULL,
    kategori_penyakit VARCHAR(40) NOT NULL CHECK (kategori_penyakit IN ('Menular', 'Tidak Menular', 'Umum')),
    resep_obat TEXT NOT NULL,
    tindakan_medis TEXT,
    status_tindak_lanjut VARCHAR(40) DEFAULT 'Rawat Jalan' CHECK (
        status_tindak_lanjut IN ('Rawat Jalan', 'Rujuk Puskesmas', 'Sembuh', 'Observasi')
    ),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABEL EARLY WARNING SYSTEM (EWS) LONJAKAN PENYAKIT DI RW
CREATE TABLE early_warning_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rw VARCHAR(5) NOT NULL,
    rt VARCHAR(5) NOT NULL,
    nama_penyakit VARCHAR(100) NOT NULL,
    jumlah_kasus INT NOT NULL DEFAULT 1,
    ambang_batas_kasus INT NOT NULL DEFAULT 3,
    periode_pantau VARCHAR(50) NOT NULL, -- e.g. 'Minggu ke-37 (September 2026)'
    tingkat_bahaya alert_severity_enum NOT NULL DEFAULT 'SEDANG',
    pesan_peringatan TEXT NOT NULL,
    rekomendasi_tindakan TEXT[] NOT NULL,
    status_penanganan VARCHAR(30) DEFAULT 'Aktif' CHECK (status_penanganan IN ('Aktif', 'Terkendali', 'Dalam Investigasi')),
    created_by_user UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 8. INDEXES UNTUK PERFORMA QUERY CEPAT
CREATE INDEX idx_warga_nik ON warga(nik);
CREATE INDEX idx_warga_wilayah ON warga(rw, rt);
CREATE INDEX idx_pemeriksaan_warga ON pemeriksaan_ckg(warga_id);
CREATE INDEX idx_pemeriksaan_tanggal ON pemeriksaan_ckg(tanggal_pemeriksaan DESC);
CREATE INDEX idx_pemeriksaan_status ON pemeriksaan_ckg(status_kesehatan);
CREATE INDEX idx_rekam_medis_warga ON rekam_medis(warga_id);
CREATE INDEX idx_rekam_medis_penyakit ON rekam_medis(nama_penyakit, kategori_penyakit);
CREATE INDEX idx_ews_wilayah ON early_warning_alerts(rw, rt, status_penanganan);

-- 9. TRIGGER OTOMATIS EVALUASI SIAGA CKG
CREATE OR REPLACE FUNCTION trg_evaluate_ckg_siaga()
RETURNS TRIGGER AS $$
DECLARE
    reasons TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Evaluasi Tensi: Sistolik >= 140 atau Diastolik >= 90
    IF NEW.tensi_sistolik >= 140 OR NEW.tensi_diastolik >= 90 THEN
        reasons := array_append(reasons, format('Hipertensi / Tensi Tinggi (%s/%s mmHg)', NEW.tensi_sistolik, NEW.tensi_diastolik));
    END IF;

    -- Evaluasi Gula Darah Sewaktu: > 200 mg/dL
    IF NEW.gula_darah_sewaktu > 200 THEN
        reasons := array_append(reasons, format('Gula Darah Tinggi (%s mg/dL)', NEW.gula_darah_sewaktu));
    END IF;

    -- Evaluasi Kolesterol Total: > 200 mg/dL
    IF NEW.kolesterol_total > 200 THEN
        reasons := array_append(reasons, format('Kolesterol Tinggi (%s mg/dL)', NEW.kolesterol_total));
    END IF;

    -- Tentukan Status
    IF array_length(reasons, 1) > 0 THEN
        NEW.status_kesehatan := 'SIAGA';
        NEW.alasan_siaga := reasons;
        NEW.dirujuk_ke_klinik := TRUE;
    ELSE
        NEW.status_kesehatan := 'SEHAT';
        NEW.alasan_siaga := ARRAY['Semua parameter pemeriksaan dalam batas normal.'];
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_ckg_eval
BEFORE INSERT OR UPDATE ON pemeriksaan_ckg
FOR EACH ROW
EXECUTE FUNCTION trg_evaluate_ckg_siaga();
