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

// Every page renders under this provider, so blocked storage must fall back to light, never throw.
const readSavedColorMode = (): ColorMode | null => {
  try {
    const saved = localStorage.getItem('app-color-mode');
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Always initialize to 'light' so server and client match during hydration.
  const [colorMode, setColorMode] = useState<ColorMode>('light');

  // Restore saved preference from localStorage after hydration (client-only)
  useEffect(() => {
    const saved = readSavedColorMode();
    if (saved) {
      startTransition(() => setColorMode(saved));
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('app-color-mode', colorMode);
    } catch {
      // Unsaved, the choice lasts until the next page load.
    }

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
