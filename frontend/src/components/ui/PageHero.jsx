import { motion } from 'framer-motion';

const PageHero = ({ eyebrow, title, copy, image }) => (
  <section className="relative overflow-hidden bg-black pt-28">
    <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-42" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(245,197,82,0.22),transparent_28rem),linear-gradient(90deg,rgba(0,0,0,0.92),rgba(0,0,0,0.55)),linear-gradient(0deg,#050505,transparent_50%)]" />
    <div className="luxury-shell relative z-10 py-20 sm:py-28">
      <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-black uppercase tracking-[0.28em] text-amber-200">{eyebrow}</motion.p>
      <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-5 max-w-4xl text-5xl font-black leading-tight tracking-tight text-white sm:text-7xl">{title}</motion.h1>
      <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mt-6 max-w-2xl text-base leading-8 text-white/62">{copy}</motion.p>
    </div>
  </section>
);

export default PageHero;
