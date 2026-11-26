import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cf_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
};

const applyThemeToDOM = (theme) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('cf_theme', theme);
  }
};

// Apply immediately on load
const initialTheme = getInitialTheme();
applyThemeToDOM(initialTheme);

export const useThemeStore = create((set) => ({
  theme: initialTheme,

  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      applyThemeToDOM(nextTheme);
      return { theme: nextTheme };
    }),

  setTheme: (newTheme) => {
    applyThemeToDOM(newTheme);
    set({ theme: newTheme });
  },
}));

export default useThemeStore;
