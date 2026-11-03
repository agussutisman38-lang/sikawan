import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Trash2, 
  Edit3, 
  Camera, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { DailyActivity, EmployeeProfile } from '../types';
import { formatTanggalLengkap, hitungDurasiJam } from '../utils/dateFormatter';
import { OfficialKop } from './OfficialKop';
import { GeotagStamper } from './GeotagStamper';
import { KATEGORI_OPTIONS, TEMPLATE_KEGIATAN, TEMPLATE_KETERANGAN } from '../utils/storage';

interface DailyJournalViewProps {
  profile: EmployeeProfile;
  activities: DailyActivity[];
  onSaveActivities: (newActivities: DailyActivity[]) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DailyJournalView: React.FC<DailyJournalViewProps> = ({
  profile,
  activities,
  onSaveActivities,
  selectedDate,
  onSelectDate,
}) => {
  const [viewMode, setViewMode] = useState<'print_preview' | 'interactive'>('print_preview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<DailyActivity | null>(null);
  const [isStamperOpen, setIsStamperOpen] = useState(false);
  const [viewingEvidence, setViewingEvidence] = useState<DailyActivity['buktiDukung'] | null>(null);

  // Form State
  const [formMulai, setFormMulai] = useState('06:30');
  const [formSelesai, setFormSelesai] = useState('10:00');
  const [formKegiatan, setFormKegiatan] = useState('');
  const [formKategori, setFormKategori] = useState<string>(KATEGORI_OPTIONS[0]);
  const [formKeterangan, setFormKeterangan] = useState('Selesai 100% (Sesuai Target)');
  const [formBukti, setFormBukti] = useState<DailyActivity['buktiDukung'] | undefined>(undefined);

  const directFileInputRef = useRef<HTMLInputElement | null>(null);
  const [targetUploadActId, setTargetUploadActId] = useState<string | null>(null);

  const [stamperTargetAct, setStamperTargetAct] = useState<DailyActivity | null>(null);

  // Filter activities for selected date
  const filteredActivities = activities
    .filter((a) => a.tanggal === selectedDate)
    .sort((a, b) => a.waktuMulai.localeCompare(b.waktuMulai));

  // Date Navigation
  const changeDateByDays = (delta: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + delta);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    onSelectDate(`${newY}-${newM}-${newD}`);
  };

  const handleOpenAddModal = () => {
    setEditingActivity(null);
    setFormMulai('06:30');
    setFormSelesai('10:00');
    setFormKegiatan('');
    setFormKategori(KATEGORI_OPTIONS[0]);
    setFormKeterangan('Selesai 100% (Sesuai Target)');
    setFormBukti(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (act: DailyActivity) => {
    setEditingActivity(act);
    setFormMulai(act.waktuMulai);
    setFormSelesai(act.waktuSelesai);
    setFormKegiatan(act.kegiatan);
    setFormKategori(act.kategori);
    setFormKeterangan(act.keterangan || 'Selesai 100% (Sesuai Target)');
    setFormBukti(act.buktiDukung);
    setIsModalOpen(true);
  };

  const handleDeleteActivity = (id: string) => {
    if (window.confirm('Hapus kegiatan ini dari jurnal harian?')) {
      const updated = activities.filter((a) => a.id !== id);
      onSaveActivities(updated);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKegiatan.trim()) {
      alert('Mohon isi uraian kegiatan!');
      return;
    }

    if (editingActivity) {
      const updated = activities.map((a) =>
        a.id === editingActivity.id
          ? {
              ...a,
              waktuMulai: formMulai,
              waktuSelesai: formSelesai,
              kegiatan: formKegiatan,
              kategori: formKategori,
              keterangan: formKeterangan || 'Selesai 100% (Sesuai Target)',
              buktiDukung: formBukti,
            }
          : a
      );
      onSaveActivities(updated);
    } else {
      const newAct: DailyActivity = {
        id: `act-${Date.now()}`,
        tanggal: selectedDate,
        waktuMulai: formMulai,
        waktuSelesai: formSelesai,
        kegiatan: formKegiatan,
        kategori: formKategori,
        keterangan: formKeterangan || 'Selesai 100% (Sesuai Target)',
        buktiDukung: formBukti,
        status: 'selesai',
        createdAt: new Date().toISOString(),
      };
      onSaveActivities([...activities, newAct]);
    }

    setIsModalOpen(false);
  };

  // Direct quick photo upload for an existing row
  const handleDirectPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetUploadActId) return;

    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result as string;

      // Automatically stamp the photo with TimeMark overlay
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(img.width, 960);
        canvas.height = Math.round((canvas.width / img.width) * img.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Dark Timemark banner at bottom
        const bannerH = Math.max(65, Math.round(canvas.height * 0.22));
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(0, canvas.height - bannerH, canvas.width, bannerH);
        
        // Amber line
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(0, canvas.height - bannerH, canvas.width, 2);

        const targetAct = activities.find((a) => a.id === targetUploadActId);
        const actTime = targetAct ? targetAct.waktuMulai : '06:30';
        const actDate = targetAct ? targetAct.tanggal : selectedDate;
        const formattedTimestamp = `${actTime} WIB, ${formatTanggalLengkap(actDate)}`;

        // Timemark text
        const padX = 14;
        const fontBase = Math.max(10, Math.round(canvas.width * 0.024));
        ctx.fillStyle = '#FDE047'; // Yellow timemark
        ctx.font = `bold ${fontBase + 2}px 'JetBrains Mono', monospace`;
        ctx.fillText(`🕒 ${formattedTimestamp}`, padX, canvas.height - bannerH + 20);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${fontBase}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText(`📍 ${profile.unitKerja.toUpperCase()} - DINAS PENDIDIKAN KAB. BEKASI`, padX, canvas.height - bannerH + 38);

        ctx.fillStyle = '#94A3B8';
        ctx.font = `normal ${fontBase - 1}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText(`Pegawai: ${profile.nama} (NIP. ${profile.nip})`, padX, canvas.height - bannerH + 54);

        const stampedUrl = canvas.toDataURL('image/jpeg', 0.9);

        // Update activity
        const updated = activities.map((a) => {
          if (a.id === targetUploadActId) {
            return {
              ...a,
              buktiDukung: {
                id: `bk-${Date.now()}`,
                tipe: 'geotag_photo' as const,
                fileUrl: stampedUrl,
                caption: a.kegiatan,
                timestamp: formattedTimestamp,
                lokasi: `${profile.unitKerja}, Kab. Bekasi (-6.3685, 107.1352)`,
              },
            };
          }
          return a;
        });

        onSaveActivities(updated);
        setTargetUploadActId(null);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate day total duration
  const totalHours = filteredActivities.reduce((acc, curr) => {
    return acc + hitungDurasiJam(curr.waktuMulai, curr.waktuSelesai);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Hidden file input for quick direct upload */}
      <input
        ref={directFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleDirectPhotoUpload}
      />

      {/* Top Toolbar / Filter Controls */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDateByDays(-1)}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
            title="Hari Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && onSelectDate(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => changeDateByDays(1)}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
            title="Hari Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectDate('2026-10-05')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              selectedDate === '2026-10-05'
                ? 'bg-blue-100 text-blue-800'
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            Contoh PDF (5 Okt 2026)
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Segmented view switch */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('print_preview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'print_preview'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Format Hasil PDF (Sesuai Lampiran)
            </button>
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === 'interactive'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mode Kelola & Input
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Kegiatan
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {/* FORMAT RESMI DOKUMEN CETAK (PERSIS 100% SESUAI CONTOH PDF LAMPIRAN) */}
      <div className="print-container bg-white p-6 md:p-12 rounded-xl border border-slate-300 shadow-md max-w-4xl mx-auto">
        {/* Banner Navigasi Layar */}
        <div className="no-print mb-4 pb-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <span className="font-bold text-slate-900">Format Resmi Lembar Jurnal Harian Kinerja</span>
            <span>·</span>
            <span>Bukti Dukung Foto Timemark / Geotag & Keterangan "Selesai 100% (Sesuai Target)"</span>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak ke PDF
          </button>
        </div>

        {/* Kop Surat Resmi Sesuai PDF */}
        <OfficialKop
          title="JURNAL HARIAN KINERJA"
          unitKerja="SMP NEGERI 2 SERANG BARU"
          instansi="DINAS PENDIDIKAN KABUPATEN BEKASI"
          customLogoUrl={profile.customLogoUrl}
        />

        {/* Biodata Pegawai (Sesuai PDF) */}
        <div className="my-5 text-sm font-sans">
          <table className="w-full text-black border-none text-xs md:text-sm">
            <tbody>
              <tr>
                <td className="w-28 md:w-36 py-0.5 font-bold">Nama</td>
                <td className="w-4 py-0.5">:</td>
                <td className="py-0.5 font-semibold uppercase">{profile.nama}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-bold">NIP</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5 font-mono-tabular">{profile.nip}</td>
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
              <tr>
                <td className="py-0.5 font-bold">Hari / Tanggal</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5 font-medium">{formatTanggalLengkap(selectedDate)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabel 5 Kolom Sesuai PDF dengan Header Biru Tua & Bukti Dukung Foto */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border border-slate-400 border-collapse text-xs text-black">
            <thead>
              {/* Header Tabel Berwarna Biru Tua Gelap Sesuai Screenshot PDF */}
              <tr className="bg-[#1c304a] text-white font-bold border-b border-slate-500 [print-color-adjust:exact]">
                <th className="border border-slate-400 py-3 px-2 w-12 text-center text-white">
                  <div>Nom</div>
                  <div>or</div>
                </th>
                <th className="border border-slate-400 py-3 px-3 w-28 text-center text-white">
                  Waktu
                </th>
                <th className="border border-slate-400 py-3 px-4 text-center text-white">
                  Kegiatan
                </th>
                <th className="border border-slate-400 py-3 px-3 w-48 text-center text-white">
                  <div>Bukti Dukung</div>
                  <div className="text-[10px] font-normal italic">
                    (Time Mark / Geotag)
                  </div>
                </th>
                <th className="border border-slate-400 py-3 px-3 w-36 text-center text-white">
                  Keterangan
                </th>
                <th className="no-print border border-slate-400 py-3 px-3 w-28 text-center text-white">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-slate-400 py-12 text-center text-slate-500 italic">
                    Belum ada data kegiatan yang diinput.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act, index) => (
                  <tr key={act.id} className="border-b border-slate-400 hover:bg-slate-50/50 transition-colors">
                    {/* Nomor */}
                    <td className="border border-slate-400 py-3 px-2 text-center align-middle font-bold font-mono-tabular">
                      {index + 1}
                    </td>

                    {/* Waktu (Contoh: 06:30 - 10:00 WIB) */}
                    <td className="border border-slate-400 py-3 px-2 text-center align-middle font-medium font-mono-tabular leading-tight">
                      <div>{act.waktuMulai} - {act.waktuSelesai}</div>
                      <div className="text-[11px] font-semibold text-slate-700">WIB</div>
                    </td>

                    {/* Kegiatan */}
                    <td className="border border-slate-400 py-3 px-4 align-middle text-left font-medium leading-relaxed">
                      {act.kegiatan}
                    </td>

                    {/* Bukti Dukung (Time Mark / Geotag) - Foto Yang Di-upload dengan Watermark */}
                    <td className="border border-slate-400 py-2.5 px-2.5 align-middle text-center">
                      {act.buktiDukung && act.buktiDukung.fileUrl ? (
                        <div className="group relative inline-block max-w-[180px] rounded overflow-hidden shadow-xs border border-slate-300">
                          <img
                            src={act.buktiDukung.fileUrl}
                            alt="Bukti Dukung Time Mark"
                            className="w-full h-28 object-cover cursor-pointer hover:scale-102 transition-transform"
                            onClick={() => setViewingEvidence(act.buktiDukung!)}
                          />
                          {/* Banner TimeMark di bagian bawah foto persis seperti contoh PDF */}
                          <div className="bg-[#0f172a]/90 text-white text-[9px] px-1.5 py-1 text-left leading-tight">
                            <p className="text-amber-300 font-mono font-bold truncate">
                              {act.buktiDukung.timestamp || `${act.waktuMulai} WIB`}
                            </p>
                            <p className="text-[8.5px] text-slate-200 truncate font-sans">
                              {act.buktiDukung.lokasi || 'SMPN 2 Serang Baru, Kab. Bekasi'}
                            </p>
                          </div>

                          {/* Tombol aksi saat di-hover di layar */}
                          <div className="no-print absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setStamperTargetAct(act)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-1.5 py-0.5 rounded shadow flex items-center gap-1"
                              title="Sesuaikan Tanggal/Jam & Foto Stempel"
                            >
                              <Clock className="w-2.5 h-2.5" /> Atur Tanggal
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTargetUploadActId(act.id);
                                directFileInputRef.current?.click();
                              }}
                              className="bg-black/70 hover:bg-black text-white text-[10px] px-1.5 py-0.5 rounded shadow flex items-center gap-1"
                              title="Unggah Foto Baru"
                            >
                              <Upload className="w-2.5 h-2.5" /> Ganti
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2">
                          <button
                            type="button"
                            onClick={() => setStamperTargetAct(act)}
                            className="no-print inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded text-[11px] font-semibold transition-colors"
                          >
                            <Camera className="w-3.5 h-3.5 text-blue-600" />
                            Unggah & Atur Tanggal
                          </button>
                          <p className="text-[10px] text-slate-400 italic mt-1 print:block">
                            (Belum ada foto)
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Keterangan: Selesai 100% (Sesuai Target) */}
                    <td className="border border-slate-400 py-3 px-3 align-middle text-center font-medium leading-tight">
                      <div className="text-slate-900 font-semibold">
                        {act.keterangan || 'Selesai 100% (Sesuai Target)'}
                      </div>
                    </td>

                    {/* Kolom Aksi Edit & Hapus (Hanya tampil di layar, otomatis disembunyikan saat Cetak PDF) */}
                    <td className="no-print border border-slate-400 py-3 px-2 align-middle text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(act)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-semibold shadow-2xs transition-colors"
                          title="Edit Kegiatan Ini"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteActivity(act.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-semibold shadow-2xs transition-colors"
                          title="Hapus Kegiatan Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Area Tanda Tangan (Pegawai Yang Bersangkutan) - Presisi sesuai PDF */}
        <div className="mt-10 flex justify-end">
          <div className="w-72 text-center text-xs md:text-sm font-sans">
            <p className="mb-1">{formatTanggalLengkap(selectedDate)}</p>
            <p className="font-bold">Pegawai Yang Bersangkutan,</p>
            
            {/* Ruang Tanda Tangan */}
            <div className="h-20 flex items-center justify-center my-1">
              {profile.signaturePegawai ? (
                <img
                  src={profile.signaturePegawai}
                  alt="Tanda Tangan Pegawai"
                  className="max-h-16 object-contain"
                />
              ) : (
                <div className="text-slate-300 print:text-transparent select-none text-[10px]">
                  (Tanda Tangan)
                </div>
              )}
            </div>

            <p className="font-bold uppercase tracking-wide text-black text-sm">
              {profile.nama}
            </p>
            <p className="text-xs font-mono-tabular font-medium text-black">
              NIP. {profile.nip}
            </p>
          </div>
        </div>

        {/* Footer Halaman Resmi Dokumen Sesuai OCR & PDF */}
        <div className="mt-14 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 font-sans print:border-slate-300">
          Jurnal Harian Kinerja • {profile.nama} ({formatTanggalLengkap(selectedDate)}) • Halaman 1 dari 1
        </div>
      </div>

      {/* MODAL: Tambah / Edit Kegiatan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                {editingActivity ? 'Edit Kegiatan Jurnal Harian' : 'Tambah Kegiatan Jurnal Harian'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Quick Template Picker */}
              <div>
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Pilih Cepat Uraian Kegiatan (Sesuai PDF):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormKegiatan('Mencatat keluar masuk barang');
                      setFormMulai('06:30');
                      setFormSelesai('10:00');
                    }}
                    className="p-1.5 text-left text-[11px] bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded text-slate-800"
                  >
                    1. Keluar masuk barang
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormKegiatan('Stok opname ATK awal bulan (kertas, tinta, spidol)');
                      setFormMulai('10:00');
                      setFormSelesai('12:00');
                    }}
                    className="p-1.5 text-left text-[11px] bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded text-slate-800"
                  >
                    2. Stok opname ATK
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormKegiatan('Buat laporan barang rusak bulan September');
                      setFormMulai('12:00');
                      setFormSelesai('15:00');
                    }}
                    className="p-1.5 text-left text-[11px] bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded text-slate-800"
                  >
                    3. Laporan barang rusak
                  </button>
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Waktu Mulai
                  </label>
                  <input
                    type="time"
                    value={formMulai}
                    onChange={(e) => setFormMulai(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Waktu Selesai
                  </label>
                  <input
                    type="time"
                    value={formSelesai}
                    onChange={(e) => setFormSelesai(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Activity Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uraian Kegiatan Kinerja <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={formKegiatan}
                  onChange={(e) => setFormKegiatan(e.target.value)}
                  required
                  rows={2}
                  placeholder="Contoh: Mencatat keluar masuk barang"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              {/* Keterangan: Wajib Default "Selesai 100% (Sesuai Target)" */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Keterangan Kegiatan (Wajib Sesuai Target)
                  </label>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Target Tercapai
                  </span>
                </div>
                <input
                  type="text"
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  placeholder="Selesai 100% (Sesuai Target)"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 bg-emerald-50/30"
                />
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {TEMPLATE_KETERANGAN.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setFormKeterangan(k)}
                      className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bukti Dukung (Geotag / Timemark Photo Upload) */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    Bukti Dukung (Time Mark / Geotag) Foto
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsStamperOpen(true)}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-md shadow-xs transition-colors flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Buka Kamera Geotag
                  </button>
                </div>

                {formBukti && formBukti.fileUrl ? (
                  <div className="flex items-center gap-3 bg-white p-2 rounded border border-slate-200">
                    <img
                      src={formBukti.fileUrl}
                      alt="Bukti"
                      className="w-16 h-14 object-cover rounded border shrink-0"
                    />
                    <div className="text-xs flex-1 truncate">
                      <p className="font-semibold text-slate-800 truncate">{formBukti.caption}</p>
                      <p className="text-[10px] text-amber-700 font-mono">{formBukti.timestamp}</p>
                      <p className="text-[10px] text-slate-500 truncate">{formBukti.lokasi}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormBukti(undefined)}
                      className="text-xs text-rose-600 hover:underline px-2"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-3 bg-white rounded border border-dashed border-slate-300">
                    <p className="text-[11px] text-slate-600 mb-2">
                      Foto bukti dukung belum dipilih.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsStamperOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                    >
                      <Upload className="w-3.5 h-3.5" /> Unggah Foto & Pasang Stempel
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  Simpan Kegiatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Geotag Stamper (Form Baru) */}
      {isStamperOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl">
            <GeotagStamper
              profile={profile}
              initialCaption={formKegiatan || 'Mencatat keluar masuk barang'}
              initialDate={selectedDate}
              initialTime={formMulai}
              onSaveEvidence={(data) => {
                setFormBukti({
                  id: `bk-${Date.now()}`,
                  tipe: 'geotag_photo',
                  fileUrl: data.dataUrl,
                  caption: data.caption,
                  timestamp: data.timestamp,
                  lokasi: data.lokasi,
                });
                setIsStamperOpen(false);
              }}
              onClose={() => setIsStamperOpen(false)}
            />
          </div>
        </div>
      )}

      {/* MODAL: Geotag Stamper (Khusus Baris Tabel Terpilih) */}
      {stamperTargetAct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl">
            <GeotagStamper
              profile={profile}
              initialCaption={stamperTargetAct.kegiatan}
              initialDate={stamperTargetAct.tanggal || selectedDate}
              initialTime={stamperTargetAct.waktuMulai}
              onSaveEvidence={(data) => {
                const updated = activities.map((a) => {
                  if (a.id === stamperTargetAct.id) {
                    return {
                      ...a,
                      buktiDukung: {
                        id: `bk-${Date.now()}`,
                        tipe: 'geotag_photo' as const,
                        fileUrl: data.dataUrl,
                        caption: data.caption,
                        timestamp: data.timestamp,
                        lokasi: data.lokasi,
                      },
                    };
                  }
                  return a;
                });
                onSaveActivities(updated);
                setStamperTargetAct(null);
              }}
              onClose={() => setStamperTargetAct(null)}
            />
          </div>
        </div>
      )}

      {/* MODAL: Evidence Detail Viewer */}
      {viewingEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold">Bukti Dukung (Time Mark & Geotag)</span>
              <button
                onClick={() => setViewingEvidence(null)}
                className="text-slate-400 hover:text-white text-xs px-2"
              >
                Tutup
              </button>
            </div>
            <div className="p-4 space-y-3">
              {viewingEvidence.fileUrl && (
                <div className="rounded-lg overflow-hidden border border-slate-300 bg-black flex justify-center">
                  <img
                    src={viewingEvidence.fileUrl}
                    alt="Bukti Dukung Detail"
                    className="max-h-80 w-auto object-contain"
                  />
                </div>
              )}
              <div className="text-xs space-y-1">
                <p className="font-semibold text-slate-800">{viewingEvidence.caption}</p>
                {viewingEvidence.lokasi && (
                  <p className="text-slate-600">📍 {viewingEvidence.lokasi}</p>
                )}
                {viewingEvidence.timestamp && (
                  <p className="font-mono text-slate-500">🕒 {viewingEvidence.timestamp}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
