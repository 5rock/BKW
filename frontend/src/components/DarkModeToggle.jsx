import { motion } from 'framer-motion';
import { Moon, SunMedium } from 'lucide-react';

const DarkModeToggle = ({ darkMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border shadow-sm transition-all duration-300 ${
        darkMode
          ? 'border-white/10 bg-white/[0.07] text-amber-200 shadow-black/25 hover:border-amber-200/40 hover:bg-white/[0.12]'
          : 'border-black/10 bg-white/65 text-amber-700 shadow-black/[0.04] hover:border-amber-700/25 hover:bg-white/90'
      }`}
      aria-label="Toggle theme"
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.span
        key={darkMode ? 'moon' : 'sun'}
        initial={{ rotate: -40, scale: 0.7, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 40, scale: 0.7, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="grid place-items-center"
      >
        {darkMode ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
      </motion.span>
    </button>
  );
};

export default DarkModeToggle;
