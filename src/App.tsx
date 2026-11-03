/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DailyJournalView } from './components/DailyJournalView';
import { MonthlyRecapView } from './components/MonthlyRecapView';
import { GeotagStamper } from './components/GeotagStamper';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { ActiveTab, DailyActivity, EmployeeProfile } from './types';
import { 
  loadProfile, 
  saveProfile, 
  loadActivities, 
  saveActivities 
} from './utils/storage';
import { formatTanggalLengkap } from './utils/dateFormatter';
import { Building2, UserCheck, ShieldCheck, Check } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<EmployeeProfile>(loadProfile);
  const [activities, setActivities] = useState<DailyActivity[]>(loadActivities);
  const [activeTab, setActiveTab] = useState<ActiveTab>('harian');
  
  // Set default date to 2026-10-05 matching user's PDF document
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-05');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 9 = October (0-indexed)

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync selectedMonth and selectedYear when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split('-').map(Number);
      setSelectedYear(y);
      setSelectedMonth(m - 1);
    }
  }, [selectedDate]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleUpdateProfile = (newProfile: EmployeeProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
    showToast('Profil pegawai & sekolah berhasil disimpan.');
  };

  const handleUpdateActivities = (newActivities: DailyActivity[]) => {
    setActivities(newActivities);
    saveActivities(newActivities);
  };

  const handleQuickPrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onQuickPrint={handleQuickPrint}
        employeeName={profile.nama}
        customLogoUrl={profile.customLogoUrl}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Subtle Institutional Context Banner (Quiet, unboxed metadata) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 text-xs text-slate-500 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{profile.unitKerja}</span>
            <span aria-hidden="true">·</span>
            <span>{profile.instansi}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">Tahun Ajaran 2026/2027</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-medium text-slate-900">{profile.nama}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">NIP. {profile.nip}</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-blue-600 hover:underline font-medium"
            >
              Ubah Data
            </button>
          </div>
        </div>

        {/* Tab 1: Jurnal Harian Kinerja */}
        {activeTab === 'harian' && (
          <DailyJournalView
            profile={profile}
            activities={activities}
            onSaveActivities={handleUpdateActivities}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}

        {/* Tab 2: Rekap Bulanan Kinerja */}
        {activeTab === 'bulanan' && (
          <MonthlyRecapView
            profile={profile}
            activities={activities}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onChangeMonth={(y, m) => {
              setSelectedYear(y);
              setSelectedMonth(m);
            }}
          />
        )}

        {/* Tab 3: Dedicated Geotag Camera Studio */}
        {activeTab === 'geotag_camera' && (
          <div className="no-print space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
              <h2 className="text-base font-bold text-slate-900">
                Studio Bukti Dukung (Time Mark & Geotag)
              </h2>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Ambil foto kamera atau unggah berkas dari ponsel / komputer Anda untuk dibubuhi stempel otomatis koordinat GPS, nama sekolah SMP Negeri 2 Serang Baru, stempel waktu, dan NIP Anda. Foto yang dihasilkan dapat langsung diterapkan ke jurnal harian kerja.
              </p>

              <GeotagStamper
                profile={profile}
                initialCaption="Kegiatan Pelayanan dan Administrasi Sekolah"
                initialDate={selectedDate}
                initialTime="06:30"
                onSaveEvidence={(data) => {
                  // Create a new activity for today with this evidence
                  const newAct: DailyActivity = {
                    id: `act-${Date.now()}`,
                    tanggal: selectedDate,
                    waktuMulai: '06:30',
                    waktuSelesai: '10:00',
                    kegiatan: data.caption || 'Aktivitas Kinerja Terverifikasi Geotag',
                    kategori: 'Administrasi Persuratan',
                    outputVolume: '1 Kegiatan',
                    buktiDukung: {
                      id: `bk-${Date.now()}`,
                      tipe: 'geotag_photo',
                      fileUrl: data.dataUrl,
                      caption: data.caption,
                      timestamp: data.timestamp,
                      lokasi: data.lokasi,
                    },
                    keterangan: 'Selesai 100% (Sesuai Target)',
                    status: 'selesai',
                    createdAt: new Date().toISOString(),
                  };
                  handleUpdateActivities([...activities, newAct]);
                  showToast('Bukti foto Time Mark berhasil dibuat dan ditambahkan ke Jurnal Harian!');
                  setActiveTab('harian');
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © 2026 SMP Negeri 2 Serang Baru · Dinas Pendidikan Kabupaten Bekasi
          </p>
          <p className="text-slate-400">
            Aplikasi Jurnal Harian Kinerja & Rekapitulasi Bulanan Pegawai
          </p>
        </div>
      </footer>

      {/* Profile & Settings Modal */}
      {isSettingsOpen && (
        <ProfileSettingsModal
          profile={profile}
          onSaveProfile={handleUpdateProfile}
          activities={activities}
          onRestoreActivities={handleUpdateActivities}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 border border-slate-800 transition-transform">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
