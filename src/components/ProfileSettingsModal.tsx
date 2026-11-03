import React, { useState, useRef } from 'react';
import { 
  User, 
  Building, 
  PenTool, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Save, 
  ShieldCheck,
  Award,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { DailyActivity, EmployeeProfile } from '../types';
import { DEFAULT_ACTIVITIES, DEFAULT_PROFILE } from '../utils/storage';
import { OfficialLogo } from './OfficialLogo';

interface ProfileSettingsModalProps {
  profile: EmployeeProfile;
  onSaveProfile: (profile: EmployeeProfile) => void;
  activities: DailyActivity[];
  onRestoreActivities: (activities: DailyActivity[]) => void;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  profile,
  onSaveProfile,
  activities,
  onRestoreActivities,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'profil' | 'logo' | 'ttd' | 'data'>('profil');

  // Form Fields
  const [nama, setNama] = useState(profile.nama);
  const [nip, setNip] = useState(profile.nip);
  const [jabatan, setJabatan] = useState(profile.jabatan);
  const [unitKerja, setUnitKerja] = useState(profile.unitKerja);
  const [instansi, setInstansi] = useState(profile.instansi);
  const [pangkatGolongan, setPangkatGolongan] = useState(profile.pangkatGolongan || 'Pengatur Muda / II/a');
  const [alamatSekolah, setAlamatSekolah] = useState(profile.alamatSekolah);
  const [customLogoUrl, setCustomLogoUrl] = useState<string | undefined>(profile.customLogoUrl);
  
  // Atasan Langsung (Kepala Sekolah) - Pangkat/Golongan dihilangkan sesuai permintaan user
  const [kepalaSekolahNama, setKepalaSekolahNama] = useState(profile.kepalaSekolahNama);
  const [kepalaSekolahNip, setKepalaSekolahNip] = useState(profile.kepalaSekolahNip);

  // Signatures
  const [signaturePegawai, setSignaturePegawai] = useState<string | undefined>(profile.signaturePegawai);
  const [signatureKepalaSekolah, setSignatureKepalaSekolah] = useState<string | undefined>(profile.signatureKepalaSekolah);

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const ttdPegawaiInputRef = useRef<HTMLInputElement | null>(null);
  const ttdKepsekInputRef = useRef<HTMLInputElement | null>(null);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0F172A';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setSignaturePegawai(canvasRef.current.toDataURL('image/png'));
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignaturePegawai(undefined);
  };

  // Upload Logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload Tanda Tangan Pegawai (JPG/PNG)
  const handleTtdPegawaiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSignaturePegawai(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload Tanda Tangan Kepala Sekolah (JPG/PNG)
  const handleTtdKepsekUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSignatureKepalaSekolah(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = () => {
    const updated: EmployeeProfile = {
      ...profile,
      nama,
      nip,
      jabatan,
      unitKerja,
      instansi,
      pangkatGolongan,
      alamatSekolah,
      customLogoUrl,
      kepalaSekolahNama,
      kepalaSekolahNip,
      signaturePegawai,
      signatureKepalaSekolah,
    };

    onSaveProfile(updated);
    onClose();
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      profile,
      activities,
      exportedAt: new Date().toISOString(),
      app: 'E-Kinerja SMP Negeri 2 Serang Baru',
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Ekinerja_SMPN2SB_${profile.nama.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.profile) {
          onSaveProfile(parsed.profile);
        }
        if (Array.isArray(parsed.activities)) {
          onRestoreActivities(parsed.activities);
        }
        alert('Data berhasil dipulihkan dari cadangan!');
        onClose();
      } catch {
        alert('Berkas cadangan tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  // Reset to default sample
  const handleResetToDefault = () => {
    if (window.confirm('Pulihkan ke data awal (SMP Negeri 2 Serang Baru - Agus Sutisman)?')) {
      onSaveProfile(DEFAULT_PROFILE);
      onRestoreActivities(DEFAULT_ACTIVITIES);
      alert('Data telah dikembalikan ke contoh awal.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Pengaturan Profil, Logo & Tanda Tangan
            </h3>
            <p className="text-xs text-slate-300">
              Konfigurasi biodata, logo instansi, dan tanda tangan digital JPG/PNG
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 flex-wrap">
          <button
            onClick={() => setActiveTab('profil')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'profil'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Biodata Pegawai & Sekolah
          </button>
          <button
            onClick={() => setActiveTab('logo')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'logo'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Unggah Logo Instansi
          </button>
          <button
            onClick={() => setActiveTab('ttd')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'ttd'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tanda Tangan Digital (JPG/PNG)
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'data'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Cadangkan Data
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'profil' && (
            <div className="space-y-4">
              {/* Pegawai Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  Identitas Pegawai
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap & Gelar
                    </label>
                    <input
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 font-semibold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      NIP
                    </label>
                    <input
                      type="text"
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jabatan
                    </label>
                    <input
                      type="text"
                      value={jabatan}
                      onChange={(e) => setJabatan(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pangkat / Golongan Ruang
                    </label>
                    <input
                      type="text"
                      value={pangkatGolongan}
                      onChange={(e) => setPangkatGolongan(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sekolah Section */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-amber-600" />
                  Instansi & Unit Kerja
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Unit Kerja
                    </label>
                    <input
                      type="text"
                      value={unitKerja}
                      onChange={(e) => setUnitKerja(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dinas / Instansi Pembina
                    </label>
                    <input
                      type="text"
                      value={instansi}
                      onChange={(e) => setInstansi(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alamat Sekolah
                    </label>
                    <input
                      type="text"
                      value={alamatSekolah}
                      onChange={(e) => setAlamatSekolah(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Atasan Langsung (Kepala Sekolah) - Pangkat/Golongan sudah dihilangkan */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Atasan Langsung (Kepala Sekolah)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={kepalaSekolahNama}
                      onChange={(e) => setKepalaSekolahNama(e.target.value)}
                      placeholder="Drs. H. Mamat Rohimat, M.Pd."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      NIP Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={kepalaSekolahNip}
                      onChange={(e) => setKepalaSekolahNip(e.target.value)}
                      placeholder="196805121994121002"
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Upload Logo Sekolah / Instansi */}
          {activeTab === 'logo' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Kustomisasi Logo Kop Surat (JPG / PNG)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Unggah logo resmi sekolah Anda (SMP Negeri 2 Serang Baru atau Dinas Pendidikan Kab. Bekasi). Logo ini akan tampil pada Kop Surat dokumen Jurnal Harian Kinerja dan Rekap Bulanan.
                  </p>
                </div>

                {/* Logo Preview */}
                <div className="flex items-center gap-6 p-4 bg-white rounded-lg border border-slate-300">
                  <div className="w-20 h-20 border border-slate-200 rounded-lg p-2 bg-slate-50 flex items-center justify-center shrink-0">
                    <OfficialLogo size={64} className="w-16 h-16" customLogoUrl={customLogoUrl} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-800">
                      {customLogoUrl ? 'Logo Kustom Aktif' : 'Menggunakan Logo Default Dinas Pendidikan Kab. Bekasi'}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Unggah Logo Baru (JPG / PNG)
                      </button>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />

                      {customLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setCustomLogoUrl(undefined)}
                          className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" /> Kembalikan ke Logo Bawaan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Tanda Tangan Digital (Bisa Gambar atau Upload JPG/PNG) */}
          {activeTab === 'ttd' && (
            <div className="space-y-6">
              {/* Tanda Tangan Pegawai */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-blue-600" />
                    Tanda Tangan Pegawai ({nama})
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => ttdPegawaiInputRef.current?.click()}
                      className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Upload className="w-3.5 h-3.5" /> Unggah File (JPG / PNG)
                    </button>
                    <input
                      ref={ttdPegawaiInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                      onChange={handleTtdPegawaiUpload}
                    />
                    {signaturePegawai && (
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    )}
                  </div>
                </div>

                {signaturePegawai ? (
                  <div className="p-3 bg-white rounded-lg border border-slate-300 flex flex-col items-center justify-center">
                    <img
                      src={signaturePegawai}
                      alt="Tanda Tangan Pegawai"
                      className="max-h-20 object-contain my-2"
                    />
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Tanda tangan aktif terpasang
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-2 bg-white flex flex-col items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      width={380}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="bg-white rounded border border-slate-200 cursor-crosshair touch-none"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Goreskan tanda tangan di atas, atau klik "Unggah File (JPG/PNG)"
                    </p>
                  </div>
                )}
              </div>

              {/* Tanda Tangan & Stempel Kepala Sekolah */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Tanda Tangan & Stempel Kepala Sekolah ({kepalaSekolahNama})
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => ttdKepsekInputRef.current?.click()}
                      className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Upload className="w-3.5 h-3.5" /> Unggah Scan TTD / Stempel (JPG/PNG)
                    </button>
                    <input
                      ref={ttdKepsekInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                      onChange={handleTtdKepsekUpload}
                    />
                    {signatureKepalaSekolah && (
                      <button
                        type="button"
                        onClick={() => setSignatureKepalaSekolah(undefined)}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    )}
                  </div>
                </div>

                {signatureKepalaSekolah ? (
                  <div className="p-3 bg-white rounded-lg border border-slate-300 flex flex-col items-center justify-center">
                    <img
                      src={signatureKepalaSekolah}
                      alt="Tanda Tangan Kepala Sekolah"
                      className="max-h-20 object-contain my-2"
                    />
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Tanda tangan / stempel Kepsek terpasang di lembar bulanan
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-lg border border-dashed border-slate-300 text-center">
                    <p className="text-xs text-slate-600 mb-2">
                      Belum ada scan tanda tangan / stempel Kepala Sekolah.
                    </p>
                    <button
                      type="button"
                      onClick={() => ttdKepsekInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" /> Unggah Foto TTD / Stempel Kepsek
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Cadangkan Data Jurnal
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Simpan seluruh data profil, logo, tanda tangan, dan riwayat kegiatan ke berkas JSON di komputer / perangkat Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Unduh Berkas Cadangan (.JSON)
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Pulihkan Data Dari Berkas
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Unggah kembali berkas cadangan JSON yang sebelumnya pernah diunduh.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  Pilih Berkas JSON Cadangan
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 space-y-2">
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Reset Data ke Default
                </h4>
                <p className="text-xs text-rose-700">
                  Mengembalikan profil ke Agus Sutisman (SMPN 2 Serang Baru) dan memuat kembali contoh kegiatan Oktober 2026.
                </p>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Kembalikan ke Contoh Bawaan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};
