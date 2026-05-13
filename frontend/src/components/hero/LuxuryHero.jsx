import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Flame, Sparkles, TrendingUp } from 'lucide-react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import { heroSlides } from '../../constants/marketplace';
import { padTime, useCountdown } from '../../hooks/useCountdown';
import LuxuryButton from '../ui/LuxuryButton';

const LuxuryHero = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.35], [0, 120]);
  const scale = useTransform(scrollYProgress, [0, 0.35], [1, 1.08]);
  const timer = useCountdown(10);

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-black pt-20">
      <Swiper modules={[Autoplay, EffectFade, Pagination]} effect="fade" loop autoplay={{ delay: 5200, disableOnInteraction: false }} pagination={{ clickable: true }} className="absolute inset-0">
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.title}>
            <motion.img style={{ scale, y }} src={slide.image} alt="" className="h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,197,82,0.20),transparent_28rem),linear-gradient(90deg,rgba(0,0,0,0.92),rgba(0,0,0,0.62),rgba(0,0,0,0.18)),linear-gradient(0deg,rgba(0,0,0,0.92),transparent_48%)]" />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 24 }).map((_, index) => (
          <span key={index} className="floating-particle absolute h-1 w-1 rounded-full bg-amber-200/70" style={{ left: `${(index * 37) % 100}%`, top: `${18 + ((index * 19) % 70)}%`, animationDelay: `${index * 0.28}s` }} />
        ))}
      </div>

      <div className="absolute inset-0 z-20 flex items-start pt-32 sm:pt-36">
        <div className="luxury-shell">
        <div className="max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-amber-100 backdrop-blur-xl">
            <Sparkles className="h-4 w-4" /> GoldMarket / MarketX
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08 }} className="max-w-4xl text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Luxury marketplace. <span className="text-gradient">Engineered to convert.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.16 }} className="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
            A cinematic premium storefront for verified products, fast buying journeys, immersive discovery, and beautiful commerce moments.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.24 }} className="mt-8 flex flex-wrap gap-3">
            <LuxuryButton as={Link} to="/products">Shop Now <ArrowRight className="h-4 w-4" /></LuxuryButton>
            <LuxuryButton as={Link} to="/products?sort=top_rated" variant="ghost">Explore Collection</LuxuryButton>
            <LuxuryButton as={Link} to="/products?sort=most_popular" variant="ghost"><TrendingUp className="h-4 w-4" /> Trending Deals</LuxuryButton>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.32 }} className="mt-7 grid max-w-3xl gap-3 sm:grid-cols-[1fr_auto]">
            <div className="glass rounded-[1.5rem] p-4">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-amber-200"><Flame className="h-4 w-4" /> Private sale closes in</p>
              <div className="mt-3 flex gap-2">
                {[
                  [timer.hours, 'Hours'],
                  [timer.minutes, 'Mins'],
                  [timer.seconds, 'Secs'],
                ].map(([value, label]) => (
                  <div key={label} className="min-w-20 rounded-2xl border border-white/10 bg-black/35 p-3 text-center">
                    <p className="text-2xl font-black text-white">{padTime(value)}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/42">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-[1.5rem] p-4 sm:w-60">
              <p className="text-3xl font-black text-white">50K+</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-white/54">luxury shoppers already using verified marketplace protection.</p>
            </div>
          </motion.div>
        </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050505] to-transparent" />
    </section>
  );
};

export default LuxuryHero;
