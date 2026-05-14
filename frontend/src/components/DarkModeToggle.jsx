import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, SunMedium } from 'lucide-react';

const DarkModeToggle = () => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('goldmarket_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('theme-transition');
    if (dark) {
      html.classList.add('dark');
      html.classList.remove('light');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
    }
    localStorage.setItem('goldmarket_theme', dark ? 'dark' : 'light');
    const timeout = setTimeout(() => html.classList.remove('theme-transition'), 500);
    return () => clearTimeout(timeout);
  }, [dark]);

  return (
    <button
      onClick={() => setDark((value) => !value)}
      className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-black/[0.12] bg-amber-900/90 text-amber-100 shadow-sm transition hover:bg-amber-800 dark:border-white/10 dark:bg-white/[0.06] dark:text-amber-200 dark:hover:border-amber-200/40"
      aria-label="Toggle theme"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.span
        key={dark ? 'moon' : 'sun'}
        initial={{ rotate: -40, scale: 0.7, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 40, scale: 0.7, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="grid place-items-center"
      >
        {dark ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
      </motion.span>
    </button>
  );
};

export default DarkModeToggle;
