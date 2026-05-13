import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, SunMedium } from 'lucide-react';

const DarkModeToggle = () => {
  const [dark, setDark] = useState(() => localStorage.getItem('goldmarket_theme') !== 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('goldmarket_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      onClick={() => setDark((value) => !value)}
      className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/[0.06] text-white transition hover:border-amber-200/40"
      aria-label="Toggle theme"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.span animate={{ y: dark ? 0 : -34, opacity: dark ? 1 : 0 }} className="absolute inset-0 grid place-items-center">
        <Moon className="h-4 w-4 text-amber-200" />
      </motion.span>
      <motion.span animate={{ y: dark ? 34 : 0, opacity: dark ? 0 : 1 }} className="absolute inset-0 grid place-items-center">
        <SunMedium className="h-4 w-4 text-amber-300" />
      </motion.span>
    </button>
  );
};

export default DarkModeToggle;
