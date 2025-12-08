import React from 'react';
import { useBrand } from '../contexts/BrandContext';

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', ...props }) => {
  const { settings } = useBrand();
  const heightMap = { sm: "30px", md: "50px", lg: "80px", xl: "120px" };
  const source = settings.logoUrl || "/logo.png";

  return (
    <img 
      src={source} 
      alt={settings.systemName} 
      className={`object-contain ${className}`}
      style={{ height: heightMap[size] }}
      {...props}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', `<span style="color:white;font-weight:bold;font-size:${heightMap[size] === '30px' ? '1.2rem' : '2rem'}">${settings.systemName}</span>`);
      }}
    />
  );
};