import { useState, useEffect } from 'react';

const DarkModeToggle = () => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('goldmarket_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('goldmarket_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('goldmarket_theme', 'light');
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
      aria-label="Toggle dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="material-symbols-outlined text-gray-700 dark:text-gray-200 text-xl">
        {dark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};

export default DarkModeToggle;
