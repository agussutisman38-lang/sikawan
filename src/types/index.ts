export interface EmployeeProfile {
  nama: string;
  nip: string;
  jabatan: string;
  unitKerja: string;
  instansi: string;
  pangkatGolongan?: string;
  alamatSekolah: string;
  customLogoUrl?: string; // base64 or url of uploaded logo (JPG/PNG)
  kepalaSekolahNama: string;
  kepalaSekolahNip: string;
  signaturePegawai?: string; // base64 of signature (drawn or uploaded JPG/PNG)
  signatureKepalaSekolah?: string; // base64 of signature (uploaded JPG/PNG)
}

export interface BuktiDukung {
  id: string;
  tipe: 'geotag_photo' | 'dokumen' | 'tautan';
  fileUrl?: string;
  caption?: string;
  timestamp?: string;
  lokasi?: string;
}

export interface DailyActivity {
  id: string;
  tanggal: string; // YYYY-MM-DD
  waktuMulai: string; // HH:mm
  waktuSelesai: string; // HH:mm
  kegiatan: string;
  kategori: string;
  outputVolume?: string; // e.g. "1 Berkas", "25 Siswa", "1 Laporan"
  buktiDukung?: BuktiDukung;
  keterangan: string;
  status: 'selesai' | 'dalam_proses';
  createdAt: string;
}

export type ActiveTab = 'harian' | 'bulanan' | 'geotag_camera' | 'pengaturan';
