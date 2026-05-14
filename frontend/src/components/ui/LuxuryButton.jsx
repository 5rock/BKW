import { motion } from 'framer-motion';

const variants = {
  gold: 'bg-gradient-to-r from-amber-200 via-yellow-500 to-amber-300 text-black shadow-[0_18px_60px_rgba(245,197,82,0.28)]',
  ghost: 'border border-black/10 dark:border-white/15 bg-black/[0.05] dark:bg-white/10 text-gray-900 dark:text-white backdrop-blur-xl hover:bg-black/10 dark:hover:bg-white/15',
  dark: 'bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-amber-100',
};

const LuxuryButton = ({ children, className = '', variant = 'gold', as: Component = 'button', ...props }) => (
  <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }} className="inline-flex">
    <Component
      className={`relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] transition ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="absolute inset-0 -translate-x-full shimmer opacity-60" />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </Component>
  </motion.div>
);

export default LuxuryButton;
