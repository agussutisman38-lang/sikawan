import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  MapPin, 
  Clock, 
  RefreshCw, 
  Check, 
  Sparkles, 
  Image as ImageIcon,
  Calendar as CalendarIcon,
  SlidersHorizontal
} from 'lucide-react';
import { EmployeeProfile } from '../types';
import { formatTanggalLengkap } from '../utils/dateFormatter';

interface GeotagStamperProps {
  profile: EmployeeProfile;
  initialCaption?: string;
  initialDate?: string; // YYYY-MM-DD
  initialTime?: string; // HH:mm
  initialLocation?: string;
  onSaveEvidence: (data: {
    dataUrl: string;
    caption: string;
    timestamp: string;
    lokasi: string;
  }) => void;
  onClose?: () => void;
}

export const GeotagStamper: React.FC<GeotagStamperProps> = ({
  profile,
  initialCaption = 'Mencatat keluar masuk barang',
  initialDate,
  initialTime,
  initialLocation = 'SMPN 2 Serang Baru, Kab. Bekasi (-6.3685, 107.1352)',
  onSaveEvidence,
  onClose,
}) => {
  // Preset photo selection
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [useCamera, setUseCamera] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [caption, setCaption] = useState<string>(initialCaption);
  const [lokasi, setLokasi] = useState<string>(initialLocation);
  
  // Date & Time configuration (Customizable)
  const defaultDate = initialDate || '2026-10-05';
  const defaultTime = initialTime || '06:30';
  
  const [stampDate, setStampDate] = useState<string>(defaultDate);
  const [stampTime, setStampTime] = useState<string>(defaultTime);
  const [isLiveClock, setIsLiveClock] = useState<boolean>(false);
  const [customTimestampText, setCustomTimestampText] = useState<string>('');
  const [isAdvancedEdit, setIsAdvancedEdit] = useState<boolean>(false);
  const [previewStampedUrl, setPreviewStampedUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Compute formatted timestamp string
  const activeFormattedTimestamp = React.useMemo(() => {
    if (customTimestampText && isAdvancedEdit) {
      return customTimestampText;
    }
    const dateFormatted = formatTanggalLengkap(stampDate) || stampDate;
    return `${stampTime} WIB, ${dateFormatted}`;
  }, [stampDate, stampTime, customTimestampText, isAdvancedEdit]);

  // If live clock mode is active, tick every second
  useEffect(() => {
    if (!isLiveClock) return;
    const interval = setInterval(() => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const y = now.getFullYear();
      const m = pad(now.getMonth() + 1);
      const d = pad(now.getDate());
      const hh = pad(now.getHours());
      const mm = pad(now.getMinutes());
      setStampDate(`${y}-${m}-${d}`);
      setStampTime(`${hh}:${mm}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLiveClock]);

  // Set to today's date & time
  const handleSetCurrentDateTime = () => {
    setIsLiveClock(false);
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const hh = pad(now.getHours());
    const mm = pad(now.getMinutes());
    setStampDate(`${y}-${m}-${d}`);
    setStampTime(`${hh}:${mm}`);
  };

  // Set to default initialDate
  const handleResetToJournalDate = () => {
    setIsLiveClock(false);
    setStampDate(defaultDate);
    setStampTime(defaultTime);
  };

  // Preset photos using high-fidelity local assets
  const PRESET_PHOTOS = [
    {
      id: 'inventory',
      title: '1. Keluar Masuk Barang',
      url: '/src/assets/images/inventory_goods_staff_1793671378198.jpg',
    },
    {
      id: 'atk',
      title: '2. Stok Opname ATK',
      url: '/src/assets/images/office_stock_opname_1793671379938.jpg',
    },
    {
      id: 'report',
      title: '3. Laporan Barang Komputer',
      url: '/src/assets/images/office_computer_report_1793671379130.jpg',
    },
  ];

  // Try real GPS if available
  const handleGetLiveGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(5);
          const lon = pos.coords.longitude.toFixed(5);
          setLokasi(`SMP Negeri 2 Serang Baru (${lat}, ${lon})`);
        },
        () => {
          setLokasi('SMPN 2 Serang Baru, Kab. Bekasi (-6.3685, 107.1352)');
        }
      );
    }
  };

  // Start web camera
  const startCamera = async () => {
    try {
      setUseCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
      alert('Tidak dapat mengakses kamera. Silakan pilih foto dari galeri/berkas komputer.');
      setUseCamera(false);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setUseCamera(false);
  };

  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw stamped photo on canvas
  const renderStampedCanvas = useCallback(() => {
    if (!selectedImage) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      const maxDim = 960;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original photo
      ctx.drawImage(img, 0, 0, w, h);

      // Draw TimeMark watermark overlay at bottom (Matching official Indonesian Timemark format)
      const overlayHeight = Math.max(80, Math.round(h * 0.22));
      const grad = ctx.createLinearGradient(0, h - overlayHeight - 20, 0, h);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.25, 'rgba(15, 23, 42, 0.88)');
      grad.addColorStop(1, 'rgba(2, 6, 23, 0.96)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, h - overlayHeight - 20, w, overlayHeight + 20);

      // Amber accent line
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(0, h - overlayHeight - 2, w, 2.5);

      // Watermark Text positioning
      const padLeft = Math.round(w * 0.04);
      let currentY = h - overlayHeight + 18;

      // 1. Time & Date in Bright Yellow Monospace (Matching PDF)
      ctx.fillStyle = '#FDE047'; // Bright Yellow
      ctx.font = `bold ${Math.max(12, Math.round(w * 0.024))}px 'JetBrains Mono', monospace`;
      ctx.fillText(`🕒 ${activeFormattedTimestamp}`, padLeft, currentY);

      // 2. School Brand & Agency
      currentY += Math.max(16, Math.round(w * 0.021));
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.max(11, Math.round(w * 0.021))}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillText(`📍 ${profile.unitKerja.toUpperCase()} - DINAS PENDIDIKAN KAB. BEKASI`, padLeft, currentY);

      // 3. Location / Coordinates
      currentY += Math.max(15, Math.round(w * 0.019));
      ctx.fillStyle = '#CBD5E1';
      ctx.font = `500 ${Math.max(10, Math.round(w * 0.018))}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillText(`${lokasi}`, padLeft, currentY);

      // 4. Employee signature stamp
      currentY += Math.max(14, Math.round(w * 0.017));
      ctx.fillStyle = '#94A3B8';
      ctx.font = `normal ${Math.max(9, Math.round(w * 0.016))}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillText(`Pegawai: ${profile.nama} (NIP. ${profile.nip})`, padLeft, currentY);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setPreviewStampedUrl(dataUrl);
    };
    img.src = selectedImage;
  }, [selectedImage, activeFormattedTimestamp, lokasi, profile]);

  useEffect(() => {
    if (selectedImage) {
      renderStampedCanvas();
    }
  }, [selectedImage, activeFormattedTimestamp, lokasi, renderStampedCanvas]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleConfirm = () => {
    if (!previewStampedUrl) {
      alert('Pilih atau ambil foto terlebih dahulu.');
      return;
    }
    onSaveEvidence({
      dataUrl: previewStampedUrl,
      caption,
      timestamp: activeFormattedTimestamp,
      lokasi,
    });
    if (onClose) onClose();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-2xl mx-auto">
      {/* Header Modal */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Camera className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-bold text-sm sm:text-base">Stempel Bukti Dukung (Time Mark & Geotag)</h3>
            <p className="text-xs text-slate-300">Sesuaikan tanggal, jam, dan foto sesuai target dokumen</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-400 hover:text-white text-sm font-medium px-2 py-1"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Source selector buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={startCamera}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-colors ${
              useCamera && cameraActive
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <Camera className="w-4 h-4" />
            Ambil Foto Kamera
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4" />
            Unggah Dari Berkas / Galeri
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Live camera view */}
        {useCamera && (
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 flex items-center gap-3">
              <button
                type="button"
                onClick={captureCameraFrame}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-full shadow-lg flex items-center gap-2 text-xs transition-transform active:scale-95"
              >
                <Camera className="w-4 h-4" />
                Jepret Sekarang
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-2 bg-black/60 hover:bg-black/80 text-white text-xs rounded-full"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Preset quick selection if no image yet */}
        {!selectedImage && !useCamera && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Atau pilih contoh foto kegiatan sekolah (Sesuai PDF):</span>
              <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Siap pakai
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_PHOTOS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedImage(preset.url)}
                  className="group relative rounded-lg overflow-hidden border border-slate-200 hover:border-blue-500 text-left transition-all"
                >
                  <img
                    src={preset.url}
                    alt={preset.title}
                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="p-1.5 bg-slate-900/90 text-white text-[11px] font-medium truncate">
                    {preset.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Preview with Watermark */}
        {selectedImage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                Hasil Foto dengan Stempel TimeMark
              </span>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="text-xs text-rose-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Ganti Foto
              </button>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-slate-300 shadow-sm bg-slate-950 flex justify-center max-h-64">
              <img
                src={previewStampedUrl || selectedImage}
                alt="Stamped Evidence Preview"
                className="max-h-64 w-auto object-contain"
              />
            </div>
          </div>
        )}

        {/* PENGATURAN TANGGAL & WAKTU STEMPEL (FITUR SESUAI PERMINTAAN USER) */}
        <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-700" />
              Sesuaikan Tanggal & Jam Stempel Waktu (Time Mark)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetToJournalDate}
                className="text-[11px] text-blue-700 hover:underline font-semibold"
                title="Gunakan tanggal kegiatan yang dipilih"
              >
                Sesuai Kegiatan ({defaultDate})
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleSetCurrentDateTime}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-medium"
              >
                Waktu Sekarang
              </button>
            </div>
          </div>

          {/* Date & Time Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                Pilih Tanggal Stempel
              </label>
              <input
                type="date"
                value={stampDate}
                onChange={(e) => {
                  setIsLiveClock(false);
                  setStampDate(e.target.value);
                }}
                className="w-full px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Pilih Jam Stempel (WIB)
              </label>
              <input
                type="time"
                value={stampTime}
                onChange={(e) => {
                  setIsLiveClock(false);
                  setStampTime(e.target.value);
                }}
                className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-slate-300 rounded-lg text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Teks Hasil Stempel Waktu Real-Time */}
          <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-xs">
            <div className="flex-1 truncate mr-2">
              <span className="text-[11px] text-slate-600 font-medium">Pratinjau Stempel: </span>
              <span className="font-mono font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                {activeFormattedTimestamp}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAdvancedEdit(!isAdvancedEdit)}
              className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 shrink-0"
            >
              <SlidersHorizontal className="w-3 h-3" />
              {isAdvancedEdit ? 'Mode Standar' : 'Ubah Teks Manual'}
            </button>
          </div>

          {/* Optional manual text override */}
          {isAdvancedEdit && (
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Edit Teks Stempel Lengkap Secara Bebas:
              </label>
              <input
                type="text"
                value={customTimestampText || activeFormattedTimestamp}
                onChange={(e) => setCustomTimestampText(e.target.value)}
                placeholder="Contoh: 06:30 WIB, Senin, 5 Oktober 2026"
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg text-slate-800 bg-white"
              />
            </div>
          )}
        </div>

        {/* Lokasi & Keterangan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Lokasi / Geotag
              </label>
              <button
                type="button"
                onClick={handleGetLiveGPS}
                className="text-[11px] text-blue-600 hover:underline font-medium"
              >
                Gunakan GPS
              </button>
            </div>
            <input
              type="text"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Kegiatan
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Contoh: Mencatat keluar masuk barang"
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Hidden Canvas for rendering */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Batal
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!previewStampedUrl}
            className={`px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              previewStampedUrl
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            Terapkan Sebagai Bukti Dukung
          </button>
        </div>
      </div>
    </div>
  );
};
