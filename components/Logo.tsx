
import React from 'react';
import { useBrand } from '../contexts/BrandContext';

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, // Mantido para compatibilidade, mas o PNG geralmente já tem texto
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

  // Lógica:
  // 1. Tenta usar o logo enviado pelo Admin (settings.logoUrl)
  // 2. Se não existir, usa o arquivo local na raiz (/logo.png)
  const source = settings.logoUrl || "/logo.png";

  return (
    <img 
      src={source} 
      alt={settings.systemName} 
      className={`object-contain ${className}`}
      style={{ height: heightMap[size] }}
      {...props}
      onError={(e) => {
        // Fallback visual caso a imagem não carregue
        e.currentTarget.style.display = 'none';
        e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', `<span style="color:white;font-weight:bold;">${settings.systemName}</span>`);
      }}
    />
  );
};
