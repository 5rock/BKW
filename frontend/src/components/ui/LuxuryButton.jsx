const variants = {
  gold: 'bg-gradient-to-r from-amber-200 via-yellow-500 to-amber-300 text-black shadow-[0_18px_60px_rgba(245,197,82,0.28)]',
  ghost: 'border border-black/10 bg-white/60 text-gray-900 shadow-black/[0.03] backdrop-blur-xl hover:bg-white/90 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15',
  dark: 'bg-[#111111] text-white hover:bg-[#181818] dark:bg-white dark:text-black dark:hover:bg-amber-100',
};

const LuxuryButton = ({ children, className = '', variant = 'gold', as: Component = 'button', ...props }) => (
  <div className="inline-flex transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97]">
    <Component
      className={`relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] transition ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="absolute inset-0 -translate-x-full shimmer opacity-60" />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </Component>
  </div>
);

export default LuxuryButton;
