'use client';

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

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Always initialize to 'light' so server and client match during hydration.
  const [colorMode, setColorMode] = useState<ColorMode>('light');

  // Restore saved preference from localStorage after hydration (client-only)
  useEffect(() => {
    const saved = localStorage.getItem('app-color-mode') as ColorMode | null;
    if (saved && (saved === 'light' || saved === 'dark')) {
      startTransition(() => setColorMode(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('app-color-mode', colorMode);

    // Add/remove dark class for Tailwind dark mode
    if (colorMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [colorMode]);

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
