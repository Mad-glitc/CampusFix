import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Theme & Accessibility Context demonstrating:
 * - Unit III: createContext, useContext, useState, useEffect
 * - Unit VI: Context API usage alongside Zustand for scoped app-wide preferences
 */
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(() => {
    return localStorage.getItem('cf_high_contrast') === 'true';
  });

  const [compactMode, setCompactMode] = useState(() => {
    return localStorage.getItem('cf_compact_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('cf_high_contrast', String(isHighContrast));
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  useEffect(() => {
    localStorage.setItem('cf_compact_mode', String(compactMode));
  }, [compactMode]);

  const toggleHighContrast = () => setIsHighContrast((prev) => !prev);
  const toggleCompactMode = () => setCompactMode((prev) => !prev);

  return (
    <ThemeContext.Provider
      value={{
        isHighContrast,
        compactMode,
        toggleHighContrast,
        toggleCompactMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
