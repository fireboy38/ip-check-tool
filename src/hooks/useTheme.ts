import { useState, useEffect } from 'react';
import type { Theme } from '../types';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('theme', theme); } catch (e) {}
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#f4f6fb' : '#070b16');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme, setTheme };
}
