import React from 'react';
import { OfficialLogo } from './OfficialLogo';

interface OfficialKopProps {
  title?: string;
  subTitle?: string;
  unitKerja?: string;
  instansi?: string;
  customLogoUrl?: string;
}

export const OfficialKop: React.FC<OfficialKopProps> = ({
  title = 'JURNAL HARIAN KINERJA',
  subTitle,
  unitKerja = 'SMP NEGERI 2 SERANG BARU',
  instansi = 'DINAS PENDIDIKAN KABUPATEN BEKASI',
  customLogoUrl,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-2 relative">
        {/* Logo Instansi Kiri */}
        <div className="w-20 flex-shrink-0 flex items-center justify-start">
          <OfficialLogo size={68} className="w-16 h-16" customLogoUrl={customLogoUrl} />
        </div>

        {/* Teks Kop Tengah Sesuai Format PDF */}
        <div className="flex-1 text-center px-2">
          <h2 className="text-sm md:text-base font-bold tracking-wider text-black uppercase font-sans">
            {instansi}
          </h2>
          <h1 className="text-xl md:text-2xl font-black text-black tracking-wide my-0.5 uppercase font-sans">
            {title}
          </h1>
          <p className="text-sm md:text-base font-bold text-black uppercase tracking-wider font-sans">
            {unitKerja}
          </p>
          {subTitle && (
            <p className="text-xs text-slate-700 italic mt-0.5">
              {subTitle}
            </p>
          )}
        </div>

        {/* Penyeimbang kanan */}
        <div className="w-20 flex-shrink-0 hidden md:block"></div>
      </div>

      {/* Garis Ganda Pembatas Kop Surat Resmi Standar Pemerintah */}
      <div className="w-full mb-5">
        <div className="border-b-[2.5px] border-black w-full"></div>
        <div className="border-b-[0.8px] border-black w-full mt-[1.5px]"></div>
      </div>
    </div>
  );
};
