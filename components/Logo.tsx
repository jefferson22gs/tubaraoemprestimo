
import React from 'react';
import { useBrand } from '../contexts/BrandContext';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  ...props 
}) => {
  // Use Global Context for Colors/Name override
  let brandSettings;
  try {
    const context = useBrand();
    brandSettings = context.settings;
  } catch (e) {
    // Fallback
    brandSettings = { 
        systemName: 'Tubarão Empréstimo', 
        logoUrl: null, 
        primaryColor: '#FF0000', 
        secondaryColor: '#D4AF37' 
    };
  }

  const dimensions = {
    sm: { width: 140, height: 45, imgH: 30 },
    md: { width: 220, height: 75, imgH: 50 },
    lg: { width: 320, height: 110, imgH: 80 },
    xl: { width: 480, height: 160, imgH: 120 },
  };

  const { width, height, imgH } = dimensions[size];

  // 1. IF CUSTOM IMAGE UPLOADED (White Label)
  if (brandSettings.logoUrl) {
      return (
          <div className={`flex flex-col items-center justify-center ${className}`}>
              <img 
                src={brandSettings.logoUrl} 
                alt={brandSettings.systemName} 
                style={{ maxHeight: imgH, objectFit: 'contain' }} 
              />
              {showText && (
                  <span 
                    className="font-bold uppercase mt-2 font-sans tracking-wide text-center"
                    style={{ 
                        fontSize: size === 'sm' ? '10px' : size === 'md' ? '14px' : '18px',
                        color: brandSettings.secondaryColor 
                    }}
                  >
                      {brandSettings.systemName}
                  </span>
              )}
          </div>
      );
  }

  // 2. DEFAULT SVG LOGO (The "Tubarão" Identity)
  const primaryColor = brandSettings.primaryColor || '#FF0000'; // Shark Red
  const secondaryColor = brandSettings.secondaryColor || '#D4AF37'; // Gold Graph
  const textColor = '#FFFFFF';

  // Parse Name for 2-line layout
  const nameParts = brandSettings.systemName.split(' ');
  const mainText = nameParts[0] || 'TUBARÃO';
  const subText = nameParts.slice(1).join(' ') || 'EMPRÉSTIMO';

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 320 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="logo-title"
      className={className}
      {...props}
    >
      <title id="logo-title">{brandSettings.systemName} Logo</title>

      {/* --- ICON COMPOSITION (Shark + Graph) --- */}
      <g transform="translate(0, 5) scale(0.9)">
        
        {/* GRAPH (Rising from behind) */}
        <g id="Graph">
            <rect x="55" y="35" width="10" height="40" fill={secondaryColor} opacity="0.6" rx="1" />
            <rect x="70" y="20" width="10" height="55" fill={secondaryColor} opacity="0.8" rx="1" />
            <rect x="85" y="5" width="10" height="70" fill={secondaryColor} rx="1" />
            
            {/* Arrow */}
            <path 
                d="M45 50 L65 30 L75 40 L95 5" 
                stroke={secondaryColor} 
                strokeWidth="5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill="none"
            />
            <path d="M95 5 L85 5 L95 15 Z" fill={secondaryColor} />
        </g>

        {/* SHARK (Foreground) */}
        <g id="Shark" transform="translate(0, 15)">
            {/* Shark Body - Aggressive Silhouette */}
            <path
                d="M10 50 
                   C 10 30, 30 15, 60 25 
                   C 75 30, 85 45, 100 50
                   L 85 60
                   C 75 55, 65 50, 55 50
                   C 40 50, 30 60, 20 70
                   C 25 75, 40 70, 50 70
                   C 40 85, 25 85, 15 80
                   C 10 70, 10 60, 10 50 Z"
                fill={primaryColor}
            />
            {/* Dorsal Fin */}
            <path d="M45 25 L 55 5 L 65 30 Z" fill={primaryColor} />
            {/* Pectoral Fin */}
            <path d="M50 55 C 50 55, 45 70, 35 75 C 35 75, 45 65, 55 60 Z" fill={primaryColor} opacity="0.8" />
            {/* Eye */}
            <circle cx="35" cy="40" r="2.5" fill="white" />
            {/* Gills */}
            <path d="M45 40 L 45 50" stroke="black" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />
            <path d="M50 42 L 50 52" stroke="black" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />
        </g>
      </g>

      {/* --- TYPOGRAPHY --- */}
      {showText && (
        <g transform="translate(115, 0)">
          {/* Main Title - Heavy Font */}
          <text
            x="0"
            y="55"
            fontSize="46"
            fontWeight="900"
            fontFamily="Arial Black, Roboto, sans-serif"
            fill={textColor}
            letterSpacing="-1px"
          >
            {mainText.toUpperCase()}
          </text>
          
          {/* Subtitle - Spaced out */}
          <text
            x="2"
            y="78"
            fontSize="15"
            fontWeight="700"
            fontFamily="Arial, sans-serif"
            letterSpacing="0.4em"
            fill={secondaryColor}
          >
            {subText.toUpperCase()}
          </text>
        </g>
      )}
    </svg>
  );
};
