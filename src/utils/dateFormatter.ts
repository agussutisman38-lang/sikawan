const HARI_INDONESIA = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu'
];

const BULAN_INDONESIA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

/**
 * Format string YYYY-MM-DD into "Selasa, 6 Oktober 2026"
 */
export function formatTanggalLengkap(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const hari = HARI_INDONESIA[dateObj.getDay()];
  const namaBulan = BULAN_INDONESIA[month - 1];
  return `${hari}, ${day} ${namaBulan} ${year}`;
}

/**
 * Format string YYYY-MM-DD into "6 Oktober 2026"
 */
export function formatTanggalStandar(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const namaBulan = BULAN_INDONESIA[month - 1];
  return `${day} ${namaBulan} ${year}`;
}

/**
 * Format Year and Month into "Oktober 2026"
 */
export function formatBulanTahun(year: number, monthIndex0: number): string {
  return `${BULAN_INDONESIA[monthIndex0]} ${year}`;
}

export function getNamaBulan(monthIndex0: number): string {
  return BULAN_INDONESIA[monthIndex0];
}

export const LIST_BULAN = BULAN_INDONESIA.map((nama, idx) => ({
  value: idx,
  label: nama
}));

/**
 * Calculates duration between HH:mm and HH:mm in hours
 */
export function hitungDurasiJam(mulai: string, selesai: string): number {
  if (!mulai || !selesai) return 0;
  const [h1, m1] = mulai.split(':').map(Number);
  const [h2, m2] = selesai.split(':').map(Number);
  const totalMulai = h1 * 60 + m1;
  const totalSelesai = h2 * 60 + m2;
  const diffMinutes = Math.max(0, totalSelesai - totalMulai);
  return Number((diffMinutes / 60).toFixed(1));
}
