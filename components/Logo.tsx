
import React from 'react';
import { useBrand } from '../contexts/BrandContext';

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean; // Mantido na interface para compatibilidade, mas ignorado na renderização
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showText, ...props }) => {
  const { settings } = useBrand();
  const heightMap = { sm: "30px", md: "50px", lg: "80px", xl: "120px" };
  
  // Força o uso da imagem. Prioriza a customizada, senão usa a padrão da raiz.
  const source = settings.logoUrl || "/Logo.png";

  return (
    <img 
      src={source} 
      alt="Logo" // Alt genérico para não mostrar o nome da empresa em caso de erro visual
      className={`object-contain ${className}`}
      style={{ height: heightMap[size] }}
      {...props}
      onError={(e) => {
        const target = e.currentTarget;
        // Se a imagem atual falhar e não for a padrão, tenta a padrão
        if (!target.src.endsWith('/Logo.png')) {
            target.src = "/Logo.png";
        } else {
            // Se até a padrão falhar, esconde a imagem totalmente.
            // NÃO insere texto de fallback.
            target.style.display = 'none';
        }
      }}
    />
  );
};
