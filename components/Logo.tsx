import React from 'react';
import { useBrand } from '../contexts/BrandContext';

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

// Named Export to match import { Logo }
export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  ...props 
}) => {
  const { settings } = useBrand();

  const heightMap = {
    sm: "30px",
    md: "50px",
    lg: "80px",
    xl: "120px"
  };

  // Logic: 
  // 1. Use Admin Uploaded URL (settings.logoUrl)
  // 2. Fallback to local default file (/logo.png)
  const source = settings.logoUrl || "/logo.png";

  return (
    <img 
      src={source} 
      alt={settings.systemName} 
      className={`object-contain ${className}`}
      style={{ height: heightMap[size] }}
      {...props}
      onError={(e) => {
        // Fallback if image fails to load
        e.currentTarget.style.display = 'none';
        e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', `<span style="color:white;font-weight:bold;font-size:${heightMap[size] === '30px' ? '1.2rem' : '2rem'}">${settings.systemName}</span>`);
      }}
    />
  );
};