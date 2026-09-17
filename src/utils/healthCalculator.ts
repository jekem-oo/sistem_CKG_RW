import { CKGStatus } from '../types';

export interface HealthEvaluationResult {
  status: CKGStatus;
  reasons: string[];
  tensiLevel: 'Normal' | 'Pra-Hipertensi' | 'Hipertensi Tk 1' | 'Hipertensi Tk 2 (Krisis)';
  gulaDarahLevel: 'Normal' | 'Waspada' | 'Tinggi (Diabetes)';
  kolesterolLevel: 'Normal' | 'Batas Tinggi' | 'Tinggi';
  bmi: number;
  bmiCategory: 'Kurang' | 'Normal' | 'Kelebihan BB' | 'Obesitas';
  colorBadge: string; // Tailwind class
  bannerBg: string; // Tailwind class
}

export function evaluateCKG(
  sistolik: number,
  diastolik: number,
  gulaDarah: number,
  kolesterol: number,
  beratBadan: number,
  tinggiBadan: number
): HealthEvaluationResult {
  const reasons: string[] = [];
  let isSiaga = false;

  // 1. Evaluasi Tensi (Blood Pressure)
  let tensiLevel: HealthEvaluationResult['tensiLevel'] = 'Normal';
  if (sistolik >= 180 || diastolik >= 120) {
    tensiLevel = 'Hipertensi Tk 2 (Krisis)';
    isSiaga = true;
    reasons.push(`Tensi Darah Sangat Tinggi (${sistolik}/${diastolik} mmHg) - Krisis Hipertensi`);
  } else if (sistolik >= 140 || diastolik >= 90) {
    tensiLevel = 'Hipertensi Tk 1';
    isSiaga = true;
    reasons.push(`Tensi Darah Tinggi (${sistolik}/${diastolik} mmHg) >= 140/90 mmHg`);
  } else if ((sistolik >= 120 && sistolik < 140) || (diastolik >= 80 && diastolik < 90)) {
    tensiLevel = 'Pra-Hipertensi';
  }

  // 2. Evaluasi Gula Darah Sewaktu (GDS)
  let gulaDarahLevel: HealthEvaluationResult['gulaDarahLevel'] = 'Normal';
  if (gulaDarah > 200) {
    gulaDarahLevel = 'Tinggi (Diabetes)';
    isSiaga = true;
    reasons.push(`Gula Darah Sewaktu Tinggi (${gulaDarah} mg/dL) > 200 mg/dL`);
  } else if (gulaDarah >= 140) {
    gulaDarahLevel = 'Waspada';
  }

  // 3. Evaluasi Kolesterol Total
  let kolesterolLevel: HealthEvaluationResult['kolesterolLevel'] = 'Normal';
  if (kolesterol >= 240) {
    kolesterolLevel = 'Tinggi';
    isSiaga = true;
    reasons.push(`Kolesterol Sangat Tinggi (${kolesterol} mg/dL) >= 240 mg/dL`);
  } else if (kolesterol > 200) {
    kolesterolLevel = 'Batas Tinggi';
    reasons.push(`Kolesterol Di Atas Normal (${kolesterol} mg/dL)`);
  }

  // 4. Hitung BMI (Indeks Massa Tubuh)
  const tinggiMeter = tinggiBadan > 0 ? tinggiBadan / 100 : 1;
  const bmiRaw = beratBadan > 0 ? beratBadan / (tinggiMeter * tinggiMeter) : 0;
  const bmi = Math.round(bmiRaw * 10) / 10;

  let bmiCategory: HealthEvaluationResult['bmiCategory'] = 'Normal';
  if (bmi < 18.5) {
    bmiCategory = 'Kurang';
  } else if (bmi <= 22.9) {
    bmiCategory = 'Normal'; // Standar Asia Pasifik
  } else if (bmi <= 24.9) {
    bmiCategory = 'Kelebihan BB';
  } else {
    bmiCategory = 'Obesitas';
    if (bmi >= 30) {
      reasons.push(`Indeks Massa Tubuh Obesitas (BMI ${bmi})`);
    }
  }

  const status: CKGStatus = isSiaga ? 'SIAGA' : 'SEHAT';

  return {
    status,
    reasons: reasons.length > 0 ? reasons : ['Semua hasil pemeriksaan fisik berada dalam batas normal.'],
    tensiLevel,
    gulaDarahLevel,
    kolesterolLevel,
    bmi,
    bmiCategory,
    colorBadge: isSiaga ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white',
    bannerBg: isSiaga ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
  };
}

export interface BalitaEvaluationResult {
  status: CKGStatus;
  statusGiziKms: 'Gizi Baik' | 'Risiko Kurang / Stunting' | 'Gizi Buruk' | 'Gizi Lebih';
  reasons: string[];
  rekomendasiHangat: string;
  lilaStatus: 'Normal' | 'Waspada Kurang Gizi' | 'Gizi Buruk';
  colorBadge: string;
  bannerBg: string;
}

export function calculateAgeInMonths(birthDateStr: string): number {
  const birth = new Date(birthDateStr);
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

export function formatAgeFriendly(birthDateStr: string): string {
  const months = calculateAgeInMonths(birthDateStr);
  if (months < 12) {
    return `${months} Bulan`;
  }
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths === 0) {
    return `${years} Tahun`;
  }
  return `${years} Thn ${remMonths} Bln`;
}

export function evaluateBalitaCKG(
  usiaBulan: number,
  beratBadan: number,
  tinggiBadan: number,
  jenisKelamin: 'L' | 'P' = 'L',
  lila?: number
): BalitaEvaluationResult {
  const reasons: string[] = [];
  let isSiaga = false;
  let statusGiziKms: BalitaEvaluationResult['statusGiziKms'] = 'Gizi Baik';
  let lilaStatus: BalitaEvaluationResult['lilaStatus'] = 'Normal';

  // 1. Evaluasi Lingkar Lengan Atas (LiLA) jika anak >= 6 bulan
  if (lila && lila > 0 && usiaBulan >= 6) {
    if (lila < 11.5) {
      lilaStatus = 'Gizi Buruk';
      isSiaga = true;
      statusGiziKms = 'Gizi Buruk';
      reasons.push(`Lingkar Lengan Atas (${lila} cm) < 11.5 cm - Indikasi Gizi Buruk/KEK`);
    } else if (lila < 12.5) {
      lilaStatus = 'Waspada Kurang Gizi';
      isSiaga = true;
      if (statusGiziKms === 'Gizi Baik') statusGiziKms = 'Risiko Kurang / Stunting';
      reasons.push(`Lingkar Lengan Atas (${lila} cm) di garis kuning (11.5 - 12.5 cm) - Waspada Gizi Kurang`);
    }
  }

  // 2. Evaluasi Sederhana Antropometri Berat Badan menurut Umur (Standar KMS Indonesia)
  // Perkiraan BB ideal rata-rata anak Indonesia:
  // Umur 0 bln: ~3.2 kg, 6 bln: ~7.5 kg, 12 bln: ~9.5 kg, 24 bln: ~12 kg, dst (~ 2 * umurTahun + 8)
  const beratIdealPerkiraan = usiaBulan <= 12
    ? 3.2 + (usiaBulan * 0.6)
    : 8 + ((usiaBulan / 12) * 2);

  const rasioBb = beratBadan / beratIdealPerkiraan;

  if (rasioBb < 0.70) {
    statusGiziKms = 'Gizi Buruk';
    isSiaga = true;
    reasons.push(`Berat badan (${beratBadan} kg) berada di bawah garis merah KMS (BB sangat kurang)`);
  } else if (rasioBb < 0.85) {
    statusGiziKms = 'Risiko Kurang / Stunting';
    isSiaga = true;
    reasons.push(`Berat badan (${beratBadan} kg) di bawah garis kuning KMS - Risiko Kurang / Stunting`);
  } else if (rasioBb > 1.30) {
    statusGiziKms = 'Gizi Lebih';
    reasons.push(`Berat badan (${beratBadan} kg) berada di atas grafik pertumbuhan normal (Kelebihan BB)`);
  }

  // Rekomendasi Hangat untuk Ibu / Keluarga (Human Tone)
  let rekomendasiHangat = 'Alhamdulillah si kecil tumbuh sehat dan ceria! Pertahankan pemberian ASI dan makanan bergizi seimbang (lauk hewani, sayur, buah) ya Bund ❤️';

  if (statusGiziKms === 'Gizi Buruk' || statusGiziKms === 'Risiko Kurang / Stunting') {
    rekomendasiHangat = 'Perhatian Bunda: Timbangan adik perlu perhatian ekstra. Disarankan konsultasi dengan bidan desa/Puskesmas. Tambahkan asupan protein hewani (1 butir telur/ikan setiap hari) dan bawa rutin ke Posyandu setiap bulan.';
  } else if (statusGiziKms === 'Gizi Lebih') {
    rekomendasiHangat = 'Pertumbuhan adik cukup pesat. Kurangi cemilan manis atau biskuit berlebihan, perbanyak aktivitas bermain aktif dan buah potong segar.';
  }

  return {
    status: isSiaga ? 'SIAGA' : 'SEHAT',
    statusGiziKms,
    reasons: reasons.length > 0 ? reasons : ['Pertumbuhan dan perkembangan fisik anak berada di pita hijau KMS (Normal).'],
    rekomendasiHangat,
    lilaStatus,
    colorBadge: isSiaga ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white',
    bannerBg: isSiaga ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
  };
}
