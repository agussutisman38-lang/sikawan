import { DailyActivity, EmployeeProfile } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'ekinerja_smpn2sb_profile_v2',
  ACTIVITIES: 'ekinerja_smpn2sb_activities_v2',
};

export const DEFAULT_PROFILE: EmployeeProfile = {
  nama: 'AGUS SUTISMAN',
  nip: '198708232025211003',
  jabatan: 'Pengadministrasi Perkantoran',
  unitKerja: 'SMP Negeri 2 Serang Baru',
  instansi: 'Dinas Pendidikan Kabupaten Bekasi',
  pangkatGolongan: 'Pengatur Muda / II/a',
  alamatSekolah: 'Jl. Jayasampurna, Sukasari, Kec. Serang Baru, Kab. Bekasi, Jawa Barat 17330',
  kepalaSekolahNama: 'Drs. H. Mamat Rohimat, M.Pd.',
  kepalaSekolahNip: '196805121994121002',
};

export const DEFAULT_ACTIVITIES: DailyActivity[] = [
  {
    id: 'act-20261005-1',
    tanggal: '2026-10-05',
    waktuMulai: '06:30',
    waktuSelesai: '10:00',
    kegiatan: 'Mencatat keluar masuk barang',
    kategori: 'Layanan Sekolah & Sarpras',
    outputVolume: '1 Buku Inventarisasi',
    buktiDukung: {
      id: 'bk-5-1',
      tipe: 'geotag_photo',
      fileUrl: '/src/assets/images/inventory_goods_staff_1793671378198.jpg',
      caption: 'Pencatatan dan penerimaan paket logistik perlengkapan sekolah',
      timestamp: '06:30 WIB, Senin, 5 Oktober 2026',
      lokasi: 'Gudang Logistik & Sarpras SMPN 2 Serang Baru (-6.3685, 107.1352)',
    },
    keterangan: 'Selesai 100% (Sesuai Target)',
    status: 'selesai',
    createdAt: '2026-10-05T10:00:00Z',
  },
  {
    id: 'act-20261005-2',
    tanggal: '2026-10-05',
    waktuMulai: '10:00',
    waktuSelesai: '12:00',
    kegiatan: 'Stok opname ATK awal bulan (kertas, tinta, spidol)',
    kategori: 'Administrasi Persuratan',
    outputVolume: '1 Lembar Format Cek ATK',
    buktiDukung: {
      id: 'bk-5-2',
      tipe: 'geotag_photo',
      fileUrl: '/src/assets/images/office_stock_opname_1793671379938.jpg',
      caption: 'Pemeriksaan fisik stok kertas HVS, tinta printer, dan spidol',
      timestamp: '10:00 WIB, Senin, 5 Oktober 2026',
      lokasi: 'Ruang Tata Usaha SMPN 2 Serang Baru (-6.3685, 107.1352)',
    },
    keterangan: 'Selesai 100% (Sesuai Target)',
    status: 'selesai',
    createdAt: '2026-10-05T12:00:00Z',
  },
  {
    id: 'act-20261005-3',
    tanggal: '2026-10-05',
    waktuMulai: '12:00',
    waktuSelesai: '15:00',
    kegiatan: 'Buat laporan barang rusak bulan September',
    kategori: 'Layanan Sekolah & Sarpras',
    outputVolume: '1 Bundel Laporan Kerusakan',
    buktiDukung: {
      id: 'bk-5-3',
      tipe: 'geotag_photo',
      fileUrl: '/src/assets/images/office_computer_report_1793671379130.jpg',
      caption: 'Pengetikan dan kompilasi laporan inventaris barang rusak',
      timestamp: '12:00 WIB, Senin, 5 Oktober 2026',
      lokasi: 'Komputer Pelayanan TU SMPN 2 Serang Baru (-6.3685, 107.1352)',
    },
    keterangan: 'Selesai 100% (Sesuai Target)',
    status: 'selesai',
    createdAt: '2026-10-05T15:00:00Z',
  },
  {
    id: 'act-20261006-1',
    tanggal: '2026-10-06',
    waktuMulai: '07:30',
    waktuSelesai: '08:30',
    kegiatan: 'Melakukan registrasi dan pengarsipan surat masuk dinas',
    kategori: 'Administrasi Persuratan',
    outputVolume: '3 Lembar Agenda',
    buktiDukung: {
      id: 'bk-6-1',
      tipe: 'geotag_photo',
      fileUrl: '/src/assets/images/office_stock_opname_1793671379938.jpg',
      caption: 'Buku register surat masuk dan disposisi pimpinan',
      timestamp: '07:45 WIB, Selasa, 6 Oktober 2026',
      lokasi: 'Ruang TU SMPN 2 Serang Baru',
    },
    keterangan: 'Selesai 100% (Sesuai Target)',
    status: 'selesai',
    createdAt: '2026-10-06T08:30:00Z',
  },
  {
    id: 'act-20261006-2',
    tanggal: '2026-10-06',
    waktuMulai: '08:30',
    waktuSelesai: '11:00',
    kegiatan: 'Sinkronisasi dan validasi pembaruan data Dapodik kesiswaan',
    kategori: 'Dapodik & Data',
    outputVolume: '1 Periode Sinkron',
    buktiDukung: {
      id: 'bk-6-2',
      tipe: 'geotag_photo',
      fileUrl: '/src/assets/images/office_computer_report_1793671379130.jpg',
      caption: 'Validasi data peserta didik semester ganjil pada server Dapodik',
      timestamp: '09:30 WIB, Selasa, 6 Oktober 2026',
      lokasi: 'Lab Komputer SMPN 2 Serang Baru',
    },
    keterangan: 'Selesai 100% (Sesuai Target)',
    status: 'selesai',
    createdAt: '2026-10-06T11:00:00Z',
  },
  {
    id: 'act-20261006-3',
    tanggal: '2026-10-06',
    waktuMulai: '11:00',
    waktuSelesai: '14:30',
    kegiatan: 'Penyusunan berkas kenaikan gaji berkala (KGB) pegawai dan guru',
    kategori: 'Kepegawaian & Kinerja',
    outputVolume: '4 Berkas KGB',
    buktiDukung: {
      id: 'bk-6-3',
      tipe: 'geotag_photo',
      fileUrl: '/src/assets/images/inventory_goods_staff_1793671378198.jpg',
      caption: 'Verifikasi berkas SK pangkat dan SK berkala guru',
      timestamp: '11:15 WIB, Selasa, 6 Oktober 2026',
      lokasi: 'Ruang Tata Usaha SMPN 2 Serang Baru',
    },
    keterangan: 'Selesai 100% (Sesuai Target)',
    status: 'selesai',
    createdAt: '2026-10-06T14:30:00Z',
  },
];

export function loadProfile(): EmployeeProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: EmployeeProfile): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function loadActivities(): DailyActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) {
      saveActivities(DEFAULT_ACTIVITIES);
      return DEFAULT_ACTIVITIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveActivities(DEFAULT_ACTIVITIES);
    return DEFAULT_ACTIVITIES;
  } catch {
    return DEFAULT_ACTIVITIES;
  }
}

export function saveActivities(activities: DailyActivity[]): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
}

export const KATEGORI_OPTIONS = [
  'Administrasi Persuratan',
  'Layanan Sekolah & Sarpras',
  'Dapodik & Data',
  'Kepegawaian & Kinerja',
  'Kesiswaan & Arsip',
  'Rapat & Koordinasi',
  'Piket & Kedisiplinan',
  'Lainnya',
] as const;

export const TEMPLATE_KEGIATAN = [
  'Mencatat keluar masuk barang',
  'Stok opname ATK awal bulan (kertas, tinta, spidol)',
  'Buat laporan barang rusak bulan September',
  'Melakukan registrasi dan pengarsipan surat masuk dinas',
  'Sinkronisasi dan validasi pembaruan data Dapodik kesiswaan',
  'Melayani legalisir ijazah dan permohonan surat keterangan siswa aktif',
  'Rekapitulasi absensi harian guru dan tenaga kependidikan',
  'Menyusun draf surat undangan rapat dan surat edaran sekolah',
  'Pengecekan fisik sarana prasarana ruang kelas dan buku KIB',
];

export const TEMPLATE_KETERANGAN = [
  'Selesai 100% (Sesuai Target)',
  'Selesai 100% (Terverifikasi)',
  'Dalam Proses (80%)',
  'Selesai & Didisposisikan ke Pimpinan',
];
