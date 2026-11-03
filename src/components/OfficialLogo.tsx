import React from 'react';

interface OfficialLogoProps {
  className?: string;
  size?: number;
  customLogoUrl?: string;
}

export const OfficialLogo: React.FC<OfficialLogoProps> = ({ 
  className = 'w-16 h-16', 
  size = 64,
  customLogoUrl 
}) => {
  if (customLogoUrl) {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        <img
          src={customLogoUrl}
          alt="Logo Sekolah / Instansi"
          className="w-full h-full object-contain drop-shadow-xs"
          style={{ maxWidth: size, maxHeight: size }}
        />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {/* High-resolution vector emblem of Pemkab Bekasi / Dinas Pendidikan */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Atas: Pendopo / Kubah Biru khas Pemkab Bekasi */}
        <path
          d="M60 10 L84 32 L78 35 L78 45 L42 45 L42 35 L36 32 Z"
          fill="#1E40AF"
        />
        <rect x="52" y="16" width="16" height="12" fill="#3B82F6" rx="1" />
        <path d="M48 34 L72 34 L70 42 L50 42 Z" fill="#60A5FA" />
        
        {/* Pilar/Dinding Tengah */}
        <rect x="44" y="44" width="32" height="6" fill="#1D4ED8" />

        {/* Pita Lingkaran Kembar Kuning Emas & Biru Tua */}
        <circle cx="48" cy="68" r="20" stroke="#F59E0B" strokeWidth="8" fill="none" />
        <circle cx="72" cy="68" r="20" stroke="#2563EB" strokeWidth="8" fill="none" />
        
        {/* Irisan tengah pita dinamis */}
        <path
          d="M60 52 C54 62 54 74 60 84 C66 74 66 62 60 52 Z"
          fill="#D97706"
        />

        {/* Pita Dasar Bawah */}
        <path
          d="M26 95 L94 95 L88 106 L32 106 Z"
          fill="#1E3A8A"
        />
        <text
          x="60"
          y="103"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="6.5"
          fontWeight="bold"
          letterSpacing="0.5"
          fontFamily="sans-serif"
        >
          KAB. BEKASI
        </text>
        <text
          x="60"
          y="114"
          textAnchor="middle"
          fill="#1E3A8A"
          fontSize="5"
          fontWeight="600"
          fontFamily="sans-serif"
        >
          DINAS PENDIDIKAN
        </text>
      </svg>
    </div>
  );
};
