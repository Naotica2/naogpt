import { useState, useEffect, useCallback } from 'react';
import { getTheme, setTheme as saveTheme } from '../utils/storage';

export function useTheme() {
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = getTheme();
    if (saved) return saved;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
