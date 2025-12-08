
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { BrandSettings } from '../types';

interface BrandContextType {
  settings: BrandSettings;
  updateSettings: (newSettings: BrandSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
  loading: boolean;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BrandSettings>({
    systemName: 'Tubarão Empréstimo',
    logoUrl: null,
    primaryColor: '#FF0000',
    secondaryColor: '#D4AF37',
    backgroundColor: '#000000'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrand();
  }, []);

  const loadBrand = async () => {
    try {
      const data = await supabaseService.getBrandSettings();
      setSettings(data);
      applyTheme(data);
    } catch (e) {
      console.error("Failed to load brand settings", e);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (data: BrandSettings) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', data.primaryColor);
    root.style.setProperty('--color-secondary', data.secondaryColor);
    root.style.setProperty('--color-background', data.backgroundColor);
    
    // Update Document Title
    document.title = data.systemName;
  };

  const updateSettings = async (newSettings: BrandSettings) => {
    await supabaseService.updateBrandSettings(newSettings);
    setSettings(newSettings);
    applyTheme(newSettings);
  };

  const resetSettings = async () => {
    const defaults = await supabaseService.resetBrandSettings();
    setSettings(defaults);
    applyTheme(defaults);
  };

  return (
    <BrandContext.Provider value={{ settings, updateSettings, resetSettings, loading }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};
