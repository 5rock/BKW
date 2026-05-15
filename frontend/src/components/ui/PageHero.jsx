import { motion } from 'framer-motion';

const PageHero = ({ eyebrow, title, copy, image }) => (
  <section className="theme-page relative overflow-hidden pt-28">
    <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-24 dark:opacity-40" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(184,120,54,0.18),transparent_28rem),linear-gradient(90deg,rgba(244,236,228,0.96),rgba(244,236,228,0.72),rgba(244,236,228,0.34)),linear-gradient(0deg,#f4ece4,transparent_50%)] dark:bg-[radial-gradient(circle_at_25%_15%,rgba(245,197,82,0.22),transparent_28rem),linear-gradient(90deg,rgba(10,10,10,0.92),rgba(10,10,10,0.55)),linear-gradient(0deg,#0a0a0a,transparent_50%)]" />
    <div className="luxury-shell relative z-10 py-20 sm:py-28">
      <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-black uppercase tracking-[0.28em] text-amber-700 dark:text-amber-200">{eyebrow}</motion.p>
      <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="theme-text mt-5 max-w-4xl text-5xl font-black leading-tight tracking-tight sm:text-7xl">{title}</motion.h1>
      <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="theme-muted mt-6 max-w-2xl text-base leading-8">{copy}</motion.p>
    </div>
  </section>
);

export default PageHero;
