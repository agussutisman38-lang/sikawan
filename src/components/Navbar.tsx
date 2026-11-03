import React from 'react';
import { ActiveTab } from '../types';
import { OfficialLogo } from './OfficialLogo';
import { Printer } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  onQuickPrint: () => void;
  employeeName: string;
  customLogoUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  onQuickPrint,
  employeeName,
  customLogoUrl,
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Brand Wordmark (Single text element wordmark with logo) */}
        <div className="flex items-center gap-3 shrink-0">
          <OfficialLogo size={36} className="w-9 h-9" customLogoUrl={customLogoUrl} />
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('harian');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
          >
            E-Kinerja SMPN 2 Serang Baru
          </a>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean text with underline active state) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('harian')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'harian'
                ? 'border-blue-600 text-blue-900 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Jurnal Harian
          </button>

          <button
            onClick={() => onSelectTab('bulanan')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'bulanan'
                ? 'border-blue-600 text-blue-900 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Rekap Bulanan
          </button>

          <button
            onClick={() => onSelectTab('geotag_camera')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'geotag_camera'
                ? 'border-blue-600 text-blue-900 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Kamera Geotag
          </button>

          <button
            onClick={onOpenSettings}
            className="whitespace-nowrap shrink-0 hover:text-slate-900 transition-colors pb-1 border-b-2 border-transparent"
          >
            Profil & Sekolah
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickPrint}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Format Resmi
          </button>
        </div>
      </div>

      {/* Mobile Subnav Strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-slate-50 px-2 py-1.5 text-xs">
        <button
          onClick={() => onSelectTab('harian')}
          className={`py-1 px-2.5 rounded font-medium ${
            activeTab === 'harian' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600'
          }`}
        >
          Harian
        </button>
        <button
          onClick={() => onSelectTab('bulanan')}
          className={`py-1 px-2.5 rounded font-medium ${
            activeTab === 'bulanan' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600'
          }`}
        >
          Bulanan
        </button>
        <button
          onClick={() => onSelectTab('geotag_camera')}
          className={`py-1 px-2.5 rounded font-medium ${
            activeTab === 'geotag_camera' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600'
          }`}
        >
          Kamera Geotag
        </button>
        <button
          onClick={onOpenSettings}
          className="py-1 px-2.5 text-slate-600 rounded font-medium"
        >
          Profil ({employeeName.split(' ')[0]})
        </button>
      </div>
    </header>
  );
};
