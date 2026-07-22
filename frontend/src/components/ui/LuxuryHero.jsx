import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Flame from 'lucide-react/dist/esm/icons/flame';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import { Autoplay, EffectFade } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { heroSlides } from '@/constants/marketplace';
import { padTime, useCountdown } from '@/hooks/useCountdown';
import LuxuryButton from '@/components/ui/LuxuryButton';

const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  top: `${18 + ((i * 19) % 70)}%`,
  delay: `${i * 0.4}s`,
}));

const LuxuryHero = () => {
  const timer = useCountdown(10);
            style={{ left: p.left, top: p.top, animationDelay: p.delay }}
          />
        ))}
      </div>

      {/* Content overlay */}
      <div className="relative z-20 flex min-h-[inherit] items-center py-28 sm:py-32 lg:py-36">
        <div className="luxury-shell">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-600/20 bg-amber-600/[0.05] px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.28em] text-amber-800 backdrop-blur-2xl dark:border-amber-200/30 dark:bg-amber-200/10 dark:text-amber-300"
            >
              <Sparkles className="h-3.5 w-3.5" /> GoldMarket / MarketX
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08 }}
              className="max-w-4xl font-black leading-[1.02] tracking-[-0.03em] text-gray-950 dark:text-white [font-size:clamp(3rem,8vw,7rem)]"
            >
              Luxury marketplace.{' '}
              <span className="text-gradient">Engineered to convert.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.16 }}
              className="mt-5 max-w-2xl text-sm leading-7 text-gray-600 dark:text-white/[0.68] sm:text-base sm:leading-8"
            >
              A cinematic premium storefront for verified products, fast buying
              journeys, immersive discovery, and beautiful commerce moments.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.24 }}
              className="mt-7 flex flex-wrap gap-3"
            >
              <LuxuryButton as={Link} to="/products">
                Shop Now <ArrowRight className="h-4 w-4" />
              </LuxuryButton>
              <LuxuryButton as={Link} to="/products?sort=top_rated" variant="ghost">
                Explore Collection
              </LuxuryButton>
              <LuxuryButton as={Link} to="/products?sort=most_popular" variant="ghost" className="hidden sm:inline-flex">
                <TrendingUp className="h-4 w-4" /> Trending Deals
              </LuxuryButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.32 }}
              className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]"
            >
              <div className="rounded-[1.5rem] border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/[0.065] p-5 backdrop-blur-2xl">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-200">
                  <Flame className="h-4 w-4" /> Private sale closes in
                </p>
                <div className="mt-3 flex gap-2">
                  {[
                    [timer.hours, 'Hours'],
                    [timer.minutes, 'Mins'],
                    [timer.seconds, 'Secs'],
                  ].map(([value, label]) => (
                    <div key={label} className="min-w-16 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.03] dark:bg-black/[0.35] p-2.5 text-center sm:min-w-20 sm:p-3">
                      <p className="text-xl font-black text-gray-950 dark:text-white sm:text-2xl">{padTime(value)}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-white/[0.42]">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/[0.065] p-5 backdrop-blur-2xl sm:w-56">
                <p className="text-3xl font-black text-gray-950 dark:text-white">50K+</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-gray-500 dark:text-white/[0.54]">
                  luxury shoppers already using verified marketplace protection.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-20 bg-gradient-to-t from-[#f4ece4] to-transparent dark:from-[#0a0a0a]" />
    </section>
  );
};

export default LuxuryHero;
