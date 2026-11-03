import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  Download, 
  CheckCircle, 
  Clock, 
  Calendar, 
  FileText, 
  Camera, 
  Building2,
  PieChart
} from 'lucide-react';
import { DailyActivity, EmployeeProfile } from '../types';
import { formatTanggalStandar, hitungDurasiJam, LIST_BULAN } from '../utils/dateFormatter';
import { OfficialKop } from './OfficialKop';
import { KATEGORI_OPTIONS } from '../utils/storage';

interface MonthlyRecapViewProps {
  profile: EmployeeProfile;
  activities: DailyActivity[];
  selectedYear: number;
  selectedMonth: number; // 0-indexed (0 = Jan, 9 = Oct)
  onChangeMonth: (year: number, month: number) => void;
}

export const MonthlyRecapView: React.FC<MonthlyRecapViewProps> = ({
  profile,
  activities,
  selectedYear,
  selectedMonth,
  onChangeMonth,
}) => {
  const [viewMode, setViewMode] = useState<'recap' | 'print_preview'>('recap');

  // Filter activities for this month & year
  const monthlyActivities = useMemo(() => {
    return activities
      .filter((act) => {
        const [y, m] = act.tanggal.split('-').map(Number);
        return y === selectedYear && m - 1 === selectedMonth;
      })
      .sort((a, b) => {
        const dateCompare = a.tanggal.localeCompare(b.tanggal);
        if (dateCompare !== 0) return dateCompare;
        return a.waktuMulai.localeCompare(b.waktuMulai);
      });
  }, [activities, selectedYear, selectedMonth]);

  // Unique working days filled
  const distinctDays = useMemo(() => {
    const setDays = new Set(monthlyActivities.map((a) => a.tanggal));
    return setDays.size;
  }, [monthlyActivities]);

  // Total Hours
  const totalHours = useMemo(() => {
    return monthlyActivities.reduce((acc, curr) => {
      return acc + hitungDurasiJam(curr.waktuMulai, curr.waktuSelesai);
    }, 0);
  }, [monthlyActivities]);

  // Percentage with Geotag / Timemark evidence
  const evidenceCount = useMemo(() => {
    return monthlyActivities.filter((a) => !!a.buktiDukung).length;
  }, [monthlyActivities]);

  const evidencePercentage = monthlyActivities.length > 0
    ? Math.round((evidenceCount / monthlyActivities.length) * 100)
    : 0;

  // Category Breakdown
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    KATEGORI_OPTIONS.forEach((cat) => (map[cat] = 0));
    monthlyActivities.forEach((act) => {
      map[act.kategori] = (map[act.kategori] || 0) + 1;
    });
    return Object.entries(map).filter(([_, count]) => count > 0);
  }, [monthlyActivities]);

  const namaBulanTerpilih = LIST_BULAN[selectedMonth]?.label || '';

  // Export to CSV
  const handleExportCSV = () => {
    if (monthlyActivities.length === 0) {
      alert('Tidak ada data kegiatan di bulan ini untuk diekspor.');
      return;
    }

    const headers = ['No', 'Tanggal', 'Waktu Mulai', 'Waktu Selesai', 'Uraian Kegiatan', 'Kategori', 'Bukti Dukung', 'Lokasi Geotag', 'Keterangan'];
    const rows = monthlyActivities.map((act, idx) => [
      idx + 1,
      act.tanggal,
      act.waktuMulai,
      act.waktuSelesai,
      `"${act.kegiatan.replace(/"/g, '""')}"`,
      `"${act.kategori}"`,
      `"${act.buktiDukung?.caption || '-'}"`,
      `"${act.buktiDukung?.lokasi || '-'}"`,
      `"${act.keterangan || '-'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Rekap_Kinerja_${profile.nama.replace(/\s+/g, '_')}_${namaBulanTerpilih}_${selectedYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month & Year Selectors */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700">Periode:</label>
            <select
              value={selectedMonth}
              onChange={(e) => onChangeMonth(selectedYear, Number(e.target.value))}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              {LIST_BULAN.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => onChangeMonth(Number(e.target.value), selectedMonth)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              {[2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500 hidden sm:inline">·</span>
          <span className="text-xs text-slate-600 hidden sm:inline font-medium">
            {profile.unitKerja}
          </span>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('recap')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === 'recap'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ringkasan & Tabel
            </button>
            <button
              onClick={() => setViewMode('print_preview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === 'print_preview'
                  ? 'bg-white text-blue-800 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lembar Pengesahan Resmi
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Ekspor Excel
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan Bulanan
          </button>
        </div>
      </div>

      {/* DASHBOARD RECAP VIEW */}
      {viewMode === 'recap' && (
        <div className="no-print space-y-5">
          {/* 4 KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Hari Kerja Terisi</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 font-mono-tabular">
                {distinctDays} <span className="text-xs font-normal text-slate-500">Hari</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Bulan {namaBulanTerpilih} {selectedYear}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Total Kegiatan</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 font-mono-tabular">
                {monthlyActivities.length} <span className="text-xs font-normal text-slate-500">Aktivitas</span>
              </p>
              <p className="text-[11px] text-emerald-600 mt-1">Status Selesai</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Akumulasi Jam Kerja</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 font-mono-tabular">
                {totalHours.toFixed(1)} <span className="text-xs font-normal text-slate-500">Jam</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Rata-rata {(distinctDays > 0 ? totalHours / distinctDays : 0).toFixed(1)} jam/hari
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Bukti Geotag / Foto</span>
                <Camera className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 font-mono-tabular">
                {evidencePercentage}%
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {evidenceCount} dari {monthlyActivities.length} terlampir
              </p>
            </div>
          </div>

          {/* Category Distribution Grid */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-blue-600" />
              Distribusi Kategori Kinerja Bulanan
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {categoryStats.length > 0 ? (
                categoryStats.map(([cat, count]) => (
                  <div key={cat} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <p className="text-xs text-slate-600 truncate font-medium">{cat}</p>
                    <p className="text-lg font-bold text-slate-900 font-mono-tabular mt-1">
                      {count} <span className="text-xs font-normal text-slate-500">kegiatan</span>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 col-span-full">
                  Belum ada kegiatan yang tercatat untuk periode ini.
                </p>
              )}
            </div>
          </div>

          {/* Detailed Monthly Activity Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Rincian Kegiatan Bulan {namaBulanTerpilih} {selectedYear}
                </h3>
                <p className="text-xs text-slate-500">
                  Unit Kerja: {profile.unitKerja} · {profile.instansi}
                </p>
              </div>
              <span className="text-xs font-mono-tabular text-slate-600">
                {monthlyActivities.length} Data
              </span>
            </div>

            {monthlyActivities.length === 0 ? (
              <div className="text-center py-12 px-4">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-700">
                  Tidak ada rekaman kinerja pada {namaBulanTerpilih} {selectedYear}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Pilih bulan lain atau catat kegiatan baru pada tab Jurnal Harian.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="py-3 px-3 w-10 text-center">No</th>
                      <th className="py-3 px-3 w-28">Tanggal</th>
                      <th className="py-3 px-3 w-24">Waktu</th>
                      <th className="py-3 px-4">Uraian Kegiatan</th>
                      <th className="py-3 px-3 w-36">Kategori</th>
                      <th className="py-3 px-4 w-44">Bukti Dukung</th>
                      <th className="py-3 px-4 w-32">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {monthlyActivities.map((act, index) => (
                      <tr key={act.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 text-center font-mono-tabular text-slate-500 font-medium">
                          {index + 1}
                        </td>
                        <td className="py-3 px-3 font-medium whitespace-nowrap text-slate-900">
                          {formatTanggalStandar(act.tanggal)}
                        </td>
                        <td className="py-3 px-3 font-mono-tabular whitespace-nowrap text-slate-600">
                          {act.waktuMulai} - {act.waktuSelesai}
                        </td>
                        <td className="py-3 px-4 leading-relaxed">
                          <p className="font-medium text-slate-900">{act.kegiatan}</p>
                          {act.outputVolume && (
                            <span className="text-[11px] text-slate-500">
                              Output: {act.outputVolume}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {act.kategori}
                        </td>
                        <td className="py-3 px-4">
                          {act.buktiDukung ? (
                            <div className="flex items-center gap-2">
                              {act.buktiDukung.fileUrl && (
                                <img
                                  src={act.buktiDukung.fileUrl}
                                  alt="Bukti"
                                  className="w-8 h-8 rounded border object-cover shrink-0"
                                />
                              )}
                              <div className="text-[11px] truncate">
                                <p className="font-medium text-slate-800 truncate">
                                  {act.buktiDukung.caption || 'Foto Geotag'}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono truncate">
                                  {act.buktiDukung.timestamp}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          {act.keterangan || 'Selesai'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OFFICIAL MONTHLY PRINT PREVIEW (Laporan Bulanan dengan Kop Resmi & Dual Tanda Tangan) */}
      <div className={`print-container bg-white p-6 md:p-10 rounded-xl border border-slate-300 shadow-md max-w-4xl mx-auto ${viewMode === 'recap' ? 'hidden md:block print:block opacity-95' : 'block'}`}>
        <div className="no-print mb-4 pb-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-bold text-slate-900">Format Laporan Rekapitulasi Kinerja Bulanan</span>
            <span>·</span>
            <span>SMP Negeri 2 Serang Baru</span>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Lembar Laporan Ini
          </button>
        </div>

        {/* Kop Surat Bulanan */}
        <OfficialKop
          title="LAPORAN REKAPITULASI KINERJA BULANAN PEGAWAI"
          subTitle={`PERIODE BULAN ${namaBulanTerpilih.toUpperCase()} ${selectedYear}`}
          unitKerja={profile.unitKerja}
          instansi={profile.instansi.toUpperCase()}
          customLogoUrl={profile.customLogoUrl}
        />

        {/* Profil Pegawai */}
        <div className="my-4 text-xs font-sans">
          <table className="w-full text-black border-none">
            <tbody>
              <tr>
                <td className="w-32 py-0.5 font-bold">Nama Pegawai</td>
                <td className="w-3 py-0.5">:</td>
                <td className="py-0.5 font-semibold uppercase">{profile.nama}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-bold">NIP</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5 font-mono-tabular">{profile.nip}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-bold">Pangkat / Gol.</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{profile.pangkatGolongan || 'Pengatur Muda / II/a'}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-bold">Jabatan</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{profile.jabatan}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-bold">Unit Kerja</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{profile.unitKerja}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabel Rekap Bulanan Sesuai Format Resmi */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border border-slate-400 border-collapse text-xs text-black">
            <thead>
              <tr className="bg-[#1c304a] text-white font-bold border-b border-slate-500 [print-color-adjust:exact]">
                <th className="border border-slate-400 py-2.5 px-2 w-8 text-center text-white">No</th>
                <th className="border border-slate-400 py-2.5 px-2.5 w-24 text-center text-white">Tanggal</th>
                <th className="border border-slate-400 py-2.5 px-2 w-24 text-center text-white">Waktu</th>
                <th className="border border-slate-400 py-2.5 px-3 text-center text-white">Uraian Kegiatan / Tugas</th>
                <th className="border border-slate-400 py-2.5 px-2.5 w-28 text-center text-white">Kategori</th>
                <th className="border border-slate-400 py-2.5 px-2.5 w-36 text-center text-white">
                  <div>Bukti Dukung</div>
                  <div className="text-[9px] italic font-normal text-slate-200">(TimeMark/Geotag)</div>
                </th>
                <th className="border border-slate-400 py-2.5 px-2 w-32 text-center text-white">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {monthlyActivities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="border border-slate-400 py-8 text-center text-slate-500 italic">
                    Tidak ada kegiatan yang dicatat pada bulan {namaBulanTerpilih} {selectedYear}.
                  </td>
                </tr>
              ) : (
                monthlyActivities.map((act, index) => (
                  <tr key={act.id} className="border-b border-slate-400">
                    <td className="border border-slate-400 py-2 px-2 text-center align-middle font-mono-tabular font-bold">
                      {index + 1}
                    </td>
                    <td className="border border-slate-400 py-2 px-2 text-center align-middle whitespace-nowrap font-medium">
                      {formatTanggalStandar(act.tanggal)}
                    </td>
                    <td className="border border-slate-400 py-2 px-2 text-center align-middle font-mono-tabular whitespace-nowrap">
                      <div>{act.waktuMulai} - {act.waktuSelesai}</div>
                      <div className="text-[10px] text-slate-600 font-semibold">WIB</div>
                    </td>
                    <td className="border border-slate-400 py-2 px-3 align-middle leading-relaxed font-medium">
                      {act.kegiatan}
                    </td>
                    <td className="border border-slate-400 py-2 px-2 align-middle text-[11px]">
                      {act.kategori}
                    </td>
                    <td className="border border-slate-400 py-2 px-2 align-middle text-center">
                      {act.buktiDukung && act.buktiDukung.fileUrl ? (
                        <div className="inline-block rounded overflow-hidden border border-slate-300 max-w-[130px]">
                          <img
                            src={act.buktiDukung.fileUrl}
                            alt="Bukti"
                            className="w-full h-16 object-cover"
                          />
                          <div className="bg-[#0f172a] text-white text-[8px] px-1 py-0.5 truncate text-left font-mono">
                            {act.buktiDukung.timestamp || 'TimeMark'}
                          </div>
                        </div>
                      ) : (
                        <span className="italic text-slate-400 print:text-black">-</span>
                      )}
                    </td>
                    <td className="border border-slate-400 py-2 px-2 align-middle text-center font-medium">
                      <div className="text-slate-900 font-semibold text-[11px]">
                        {act.keterangan || 'Selesai 100% (Sesuai Target)'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Ringkasan Akumulasi Angka */}
        <div className="mt-3 p-2 border border-black text-xs font-mono-tabular flex items-center justify-between">
          <span>Total Hari Kinerja: <strong>{distinctDays} Hari</strong></span>
          <span>Total Kegiatan: <strong>{monthlyActivities.length} Aktivitas</strong></span>
          <span>Akumulasi Jam Kerja: <strong>{totalHours.toFixed(1)} Jam Efektif</strong></span>
          <span>Kelengkapan Bukti: <strong>{evidencePercentage}%</strong></span>
        </div>

        {/* Dual Signatures Section (Standar Laporan Kinerja Instansi Pemerintah) */}
        <div className="mt-10 grid grid-cols-2 gap-8 text-xs md:text-sm font-sans">
          {/* Kolom Kiri: Kepala Sekolah */}
          <div className="text-center">
            <p className="mb-1">Mengetahui,</p>
            <p className="font-bold">Kepala {profile.unitKerja}</p>
            
            <div className="h-20 flex items-center justify-center my-1">
              {profile.signatureKepalaSekolah ? (
                <img
                  src={profile.signatureKepalaSekolah}
                  alt="Tanda Tangan Kepala Sekolah"
                  className="max-h-16 object-contain"
                />
              ) : (
                <div className="text-slate-300 print:text-transparent select-none text-[10px]">
                  (Tanda Tangan & Stempel)
                </div>
              )}
            </div>

            <p className="font-bold uppercase underline underline-offset-2">
              {profile.kepalaSekolahNama}
            </p>
            <p className="text-xs font-mono-tabular">
              NIP. {profile.kepalaSekolahNip}
            </p>
          </div>

          {/* Kolom Kanan: Pegawai Yang Bersangkutan */}
          <div className="text-center">
            <p className="mb-1">
              Serang Baru, 31 {namaBulanTerpilih} {selectedYear}
            </p>
            <p className="font-bold">Pegawai Yang Bersangkutan,</p>
            
            <div className="h-20 flex items-center justify-center my-1">
              {profile.signaturePegawai ? (
                <img
                  src={profile.signaturePegawai}
                  alt="Tanda Tangan Pegawai"
                  className="max-h-16 object-contain"
                />
              ) : (
                <div className="text-slate-300 print:text-transparent select-none text-[10px]">
                  (Tanda Tangan Pegawai)
                </div>
              )}
            </div>

            <p className="font-bold uppercase underline underline-offset-2">
              {profile.nama}
            </p>
            <p className="text-xs font-mono-tabular">
              NIP. {profile.nip}
            </p>
            <p className="text-[11px] text-slate-700 print:text-black">
              {profile.jabatan}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
