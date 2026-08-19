import { useEffect } from 'react';
import useThemeStore from '@/store/themeStore';

const ThemeInitializer = () => {
  const darkMode = useThemeStore((state) => state.darkMode);

  useEffect(() => {
    const html = document.documentElement;
    // Add transition class to prevent instant snapping only on manual toggles, but skip on initial render
    if (!html.dataset.themeInitialized) {
      html.dataset.themeInitialized = 'true';
    } else {
      html.classList.add('theme-transition');
    }

    html.classList.toggle('dark', darkMode);
    html.classList.toggle('light', !darkMode);
    html.style.colorScheme = darkMode ? 'dark' : 'light';
    
    // We keep the old localStorage key in sync just in case, but Zustand persist handles it.
    localStorage.setItem('goldmarket_theme', darkMode ? 'dark' : 'light');

    const timeout = setTimeout(() => html.classList.remove('theme-transition'), 360);
    return () => clearTimeout(timeout);
  }, [darkMode]);

  return null;
};

export default ThemeInitializer;
