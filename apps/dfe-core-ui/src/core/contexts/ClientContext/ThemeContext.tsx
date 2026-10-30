'use client';

import { readStorageItem, writeStorageItem } from '@/core/utils/storage';
import React, {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from 'react';

// Light/Dark mode type
type ColorMode = 'light' | 'dark';

// Extended theme context interface
interface ThemeContextType {
  colorMode: ColorMode;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const COLOR_MODE_KEY = 'app-color-mode';

const readSavedColorMode = (): ColorMode | null => {
  const saved = readStorageItem(COLOR_MODE_KEY);
  return saved === 'light' || saved === 'dark' ? saved : null;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Always initialize to 'light' so server and client match during hydration.
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  // Nothing is saved until the stored choice has been read, or the first
  // render's 'light' overwrites it.
  const [restored, setRestored] = useState(false);

  // Restore saved preference from localStorage after hydration (client-only)
  useEffect(() => {
    const saved = readSavedColorMode();
    startTransition(() => {
      if (saved) setColorMode(saved);
      setRestored(true);
    });
  }, []);

  useEffect(() => {
    if (!restored) return;
    writeStorageItem(COLOR_MODE_KEY, colorMode);

    // Add/remove dark class for Tailwind dark mode
    if (colorMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [colorMode, restored]);

  const toggleColorMode = () => {
    setColorMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider
      value={{
        colorMode,
        toggleColorMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
