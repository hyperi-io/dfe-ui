'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

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
  // Initialize color mode from localStorage or default to 'light'
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const savedColorMode = localStorage.getItem('app-color-mode');
    return (savedColorMode as ColorMode) || 'light';
  });

  // Save color mode to localStorage when it changes
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
