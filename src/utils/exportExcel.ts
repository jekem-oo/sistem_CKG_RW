import * as XLSX from 'xlsx';
import { PemeriksaanCKG } from '../types';

export function exportCKGToExcel(pemeriksaanList: PemeriksaanCKG[], filename: string = 'Laporan_CKG_RW05_Bulanan.xlsx') {
  // Format data untuk Sheet 1
  const rows = pemeriksaanList.map((item, index) => ({
    No: index + 1,
    'Tanggal Periksa': new Date(item.tanggal).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    'NIK': item.nik,
    'Nama Warga': item.namaWarga,
    'RT': item.rt,
    'RW': item.rw,
    'Tensi (mmHg)': `${item.sistolik}/${item.diastolik}`,
    'Gula Darah (mg/dL)': item.gulaDarah,
    'Kolesterol (mg/dL)': item.kolesterol,
    'Berat Badan (kg)': item.beratBadan,
    'Tinggi Badan (cm)': item.tinggiBadan,
    'BMI': item.bmi,
    'Status CKG': item.status,
    'Catatan / Alasan Siaga': item.alasanSiaga.join('; '),
    'Rujukan Klinik': item.dirujukKeKlinik ? 'Ya (Dirujuk)' : 'Tidak',
    'Kader Pemeriksa': item.namaKader,
  }));

  // Buat Sheet Rekap RT
  const rtSummaryMap = new Map<string, { total: number; sehat: number; siaga: number }>();
  pemeriksaanList.forEach((item) => {
    const key = `RT ${item.rt} / RW ${item.rw}`;
    const current = rtSummaryMap.get(key) || { total: 0, sehat: 0, siaga: 0 };
    current.total += 1;
    if (item.status === 'SIAGA') current.siaga += 1;
    else current.sehat += 1;
    rtSummaryMap.set(key, current);
  });

  const summaryRows = Array.from(rtSummaryMap.entries()).map(([wilayah, data]) => ({
    Wilayah: wilayah,
    'Total Diperiksa': data.total,
    'Jumlah Sehat': data.sehat,
    'Jumlah Siaga (⚠️)': data.siaga,
    'Persentase Siaga': `${Math.round((data.siaga / (data.total || 1)) * 100)}%`,
  }));

  const wb = XLSX.utils.book_new();

  const wsData = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, wsData, 'Data Pemeriksaan CKG');

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Rekapitulasi RT');

  // Trigger download file .xlsx
  XLSX.writeFile(wb, filename);
}
