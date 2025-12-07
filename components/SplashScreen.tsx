
import React, { useEffect, useState } from 'react';

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Sequence of animations
    const t1 = setTimeout(() => setStage(1), 500); // Fade in Logo
    const t2 = setTimeout(() => setStage(2), 2000); // Scale out
    const t3 = setTimeout(() => {
        setStage(3); // Fade out
        setTimeout(onFinish, 500); // Unmount
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  if (stage === 3) return null;

  return (
    <div className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-500 ${stage === 3 ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`transition-all duration-1000 transform ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'} ${stage === 2 ? 'scale-110' : ''}`}>
        <div className="relative">
            {/* Pulsing Glow */}
            <div className="absolute inset-0 bg-[#FF0000] blur-3xl opacity-20 animate-pulse rounded-full"></div>
            
            <div className="relative z-10 flex flex-col items-center">
                {/* Logo Icon */}
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#FF0000] mb-4 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">
                    <path d="M22 19.5C22 19.5 19 19.5 17 17.5C15 15.5 14 12 14 12L12 2C12 2 10 11 6 15C2 19 2 22 2 22H22V19.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
                </svg>
                
                {/* Text */}
                <h1 className="text-5xl font-black tracking-tighter text-white">
                    TUBARÃO
                </h1>
                <div className="h-1 w-0 bg-[#D4AF37] mt-2 transition-all duration-1000 ease-out" style={{ width: stage >= 1 ? '100%' : '0%' }}></div>
                <p className="text-[#D4AF37] text-xs font-bold tracking-[0.5em] mt-2 uppercase opacity-80">
                    Empréstimos
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
