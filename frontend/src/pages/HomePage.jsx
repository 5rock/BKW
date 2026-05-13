import { useEffect, useMemo, useState } from 'react';
import CountUpModule from 'react-countup';
import { motion } from 'framer-motion';
import { BadgeCheck, Flame, Gauge, LockKeyhole, PackageCheck, Sparkles, TrendingUp } from 'lucide-react';
import LuxuryHero from '../components/hero/LuxuryHero';
import CategoryCarousel from '../components/categories/CategoryCarousel';
import ProductRail from '../components/products/ProductRail';
import Reveal from '../components/animations/Reveal';
import LuxuryButton from '../components/ui/LuxuryButton';
import { aboutStats, showcaseProducts, trustItems } from '../constants/marketplace';
import { padTime, useCountdown } from '../hooks/useCountdown';
import { getProducts } from '../services/productService';

const CountUp = CountUpModule.default || CountUpModule;

const SectionSkeleton = () => (
  <div className="luxury-shell grid gap-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="h-[28rem] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.06]">
        <div className="shimmer h-full w-full" />
      </div>
    ))}
  </div>
);

const FlashSale = ({ products }) => {
  const timer = useCountdown(7);

  return (
    <section className="luxury-shell py-14">
      <Reveal className="relative overflow-hidden rounded-[2rem] border border-amber-200/20 bg-[radial-gradient(circle_at_20%_20%,rgba(245,197,82,0.22),transparent_25rem),linear-gradient(135deg,#180d04,#080808_52%,#2a0505)] p-6 shadow-2xl shadow-amber-950/20 sm:p-10">
        <div className="absolute inset-0 opacity-30">
          <div className="shimmer h-full w-full" />
        </div>
        <div className="relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
              <Flame className="h-4 w-4" /> Flash Sale Live
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-6xl">Urgency, but make it elegant.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/62">Animated stock signals, premium sale badges, and a conversion-focused product carousel with just enough drama.</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {[
                [timer.hours, 'Hours'],
                [timer.minutes, 'Minutes'],
                [timer.seconds, 'Seconds'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-center">
                  <p className="text-3xl font-black text-white">{padTime(value)}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-7">
              <LuxuryButton as="a" href="/products?sort=most_popular">Shop limited deals</LuxuryButton>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {products.slice(0, 4).map((product, index) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="rounded-[1.4rem] border border-white/10 bg-black/36 p-3 backdrop-blur-xl">
                <div className="relative aspect-[5/4] overflow-hidden rounded-[1rem]">
                  <img src={product.thumbnail} alt={product.title} className="h-full w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-black">Limited</span>
                </div>
                <div className="mt-3">
                  <p className="line-clamp-1 font-black text-white">{product.title}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${90 - index * 16}%` }} viewport={{ once: true }} className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-300" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-red-200">{5 + index * 3} items left at this price</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
};

const TrustSection = () => (
  <section className="luxury-shell py-14">
    <Reveal className="mb-8 text-center">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">Trust Layer</p>
      <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">Premium commerce, protected.</h2>
    </Reveal>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {trustItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div key={item.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} whileHover={{ y: -6 }} className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20 backdrop-blur-xl transition hover:border-amber-200/30">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-amber-300 text-black">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-black text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/52">{item.copy}</p>
          </motion.div>
        );
      })}
    </div>
  </section>
);

const StatsBand = () => (
  <section className="luxury-shell py-12">
    <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
      {aboutStats.map((stat) => (
        <div key={stat.label} className="rounded-[1.3rem] bg-black/25 p-5">
          <p className="text-4xl font-black text-white"><CountUp end={stat.value} enableScrollSpy scrollSpyOnce />{stat.suffix}</p>
          <p className="mt-2 text-sm font-bold text-white/50">{stat.label}</p>
        </div>
      ))}
    </div>
  </section>
);

const HomePage = () => {
  const [products, setProducts] = useState(showcaseProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getProducts({ sort: 'top_rated', limit: 12 })
      .then((res) => {
        if (alive && res.products?.length) setProducts(res.products.slice(0, 12));
      })
      .catch(() => setProducts(showcaseProducts))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const railProducts = useMemo(() => (products.length >= 4 ? products : showcaseProducts), [products]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <LuxuryHero />
      <CategoryCarousel />
      {loading ? <SectionSkeleton /> : <ProductRail title="Trending Products" eyebrow="Market signals" copy="High-intent products with ratings, quick view, wishlist, add-to-cart, hover image swaps, and stock urgency." products={railProducts} />}
      <FlashSale products={railProducts} />
      <ProductRail title="New Arrivals" eyebrow="Freshly listed" copy="A premium carousel optimized for discovery across mobile, tablet, desktop, and ultra-wide layouts." products={[...railProducts].reverse()} />
      <TrustSection />
      <StatsBand />
      <section className="luxury-shell py-16">
        <Reveal className="grid gap-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-6 backdrop-blur-xl lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">Luxury operating system</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">Scalable UI components for every premium marketplace flow.</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [Gauge, 'Performance first'],
                [LockKeyhole, 'Secure checkout'],
                [BadgeCheck, 'Verified sellers'],
                [PackageCheck, 'Delivery visibility'],
              ].map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/24 p-4 text-sm font-black text-white/78">
                  <Icon className="h-5 w-5 text-amber-200" /> {label}
                </div>
              ))}
            </div>
          </div>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="rounded-full border border-amber-200/20 bg-amber-200/10 p-8 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-amber-200" />
            <p className="mt-3 text-sm font-black uppercase tracking-[0.2em] text-amber-100">Production ready</p>
          </motion.div>
        </Reveal>
      </section>
    </div>
  );
};

export default HomePage;
