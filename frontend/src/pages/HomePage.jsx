import { lazy, memo, Suspense, useEffect, useMemo, useState } from 'react';
import CountUpModule from 'react-countup';
import { BadgeCheck, Flame, Gauge, LockKeyhole, PackageCheck, Sparkles } from 'lucide-react';

const CinematicMarketHero = lazy(() => import('../components/hero/CinematicMarketHero'));
const CategoryCarousel = lazy(() => import('../components/categories/CategoryCarousel'));
const ProductRail = lazy(() => import('../components/products/ProductRail'));
import Reveal from '../components/animations/Reveal';
import LuxuryButton from '../components/ui/LuxuryButton';
import LazyWhenVisible from '../components/performance/LazyWhenVisible';
import { aboutStats, showcaseProducts, trustItems } from '../constants/marketplace';
import { padTime, useCountdown } from '../hooks/useCountdown';
import { getProducts } from '../services/productService';
import { normalizeProduct, money } from '../utils/productUtils';
import LazyImage from '../components/ui/LazyImage';

const CountUp = CountUpModule.default || CountUpModule;

/* ─── Skeleton placeholders ──────────────────────────────────────────────── */

const SectionSkeleton = memo(() => (
  <div className="luxury-shell grid gap-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="h-[28rem] overflow-hidden rounded-[1.5rem] border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.06]"
      >
        <div className="shimmer h-full w-full" />
      </div>
    ))}
  </div>
));

const CarouselSkeleton = memo(() => (
  <div className="luxury-shell py-16">
    <div className="mb-8 h-20 max-w-xl rounded-3xl bg-black/[0.03] dark:bg-white/[0.05]">
      <div className="shimmer h-full w-full rounded-3xl" />
    </div>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="aspect-square rounded-full bg-black/[0.03] dark:bg-white/[0.05]">
          <div className="shimmer h-full w-full rounded-full" />
        </div>
      ))}
    </div>
  </div>
));

SectionSkeleton.displayName = 'SectionSkeleton';
CarouselSkeleton.displayName = 'CarouselSkeleton';

/* ─── Flash Sale ─────────────────────────────────────────────────────────── */

/**
 * Memoized so it only re-renders when the `products` array reference changes.
 * The countdown ticker updates the timer state, but parent passes stable
 * product references via useMemo — preventing unnecessary re-renders.
 */
const FlashSale = memo(({ products }) => {
  const timer = useCountdown(7);

  return (
    <section className="luxury-shell py-14 cv-auto">
      <Reveal className="relative overflow-hidden rounded-[3rem] border border-amber-200/20 bg-[radial-gradient(circle_at_20%_20%,rgba(245,197,82,0.15),transparent_25rem),linear-gradient(135deg,#f3e5d8,#ebdccb_52%,#dfccb7)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(245,197,82,0.22),transparent_25rem),linear-gradient(135deg,#180d04,#080808_52%,#2a0505)] p-6 shadow-2xl shadow-amber-900/5 dark:shadow-amber-950/20 sm:p-12">
        <div className="absolute inset-0 opacity-20 dark:opacity-30">
          <div className="shimmer h-full w-full" />
        </div>
        <div className="relative z-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-lg">
              <Flame className="h-4 w-4" /> Flash Sale Live
            </p>
            <h2 className="mt-6 text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Urgency, but make it elegant.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-gray-600 dark:text-white/62">
              Animated stock signals, premium sale badges, and a conversion-focused product carousel with just enough drama.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                [timer.hours, 'Hours'],
                [timer.minutes, 'Minutes'],
                [timer.seconds, 'Seconds'],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.03] dark:bg-black/35 px-6 py-5 text-center backdrop-blur-md"
                >
                  <p className="text-4xl font-black text-gray-900 dark:text-white">{padTime(value)}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 dark:text-white/42">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-7">
              <LuxuryButton as="a" href="/products?sort=most_popular">
                Shop limited deals
              </LuxuryButton>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {products.slice(0, 4).map((product, index) => {
              const item = normalizeProduct(product);
              const img =
                item.thumbnail ||
                item.images?.[0] ||
                'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=75';
              const stockLeft = 5 + index * 3;
              return (
                <a
                  href={`/products/${item.id}`}
                  key={item.id || index}
                  className="group block rounded-[1.8rem] border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 p-4 backdrop-blur-xl transition-[border-color,background-color,transform] duration-300 hover:-translate-y-1 hover:border-amber-600/20 dark:hover:border-amber-200/30 hover:bg-white/60 dark:hover:bg-black/60 shadow-xl shadow-black/[0.02] dark:shadow-none"
                >
                  <div className="relative aspect-[5/4] overflow-hidden rounded-[1rem]">
                    <LazyImage
                      src={img}
                      alt={item.title}
                      width={500}
                      height={400}
                      containerClassName="absolute inset-0"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-black shadow">
                      Limited
                    </span>
                    {item.discountPercent > 0 && (
                      <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-black text-white shadow">
                        -{item.discountPercent}%
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-black text-gray-900 dark:text-white transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-200">
                        {item.title}
                      </p>
                      <span className="text-sm font-black text-gray-950 dark:text-white shrink-0">
                        {money(item.finalPrice)}
                      </span>
                    </div>
                    {/* CSS-animated stock bar — replaces motion.div whileInView width animation */}
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-300 transition-[width] duration-700"
                        style={{ width: `${90 - index * 16}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[11px] font-bold text-red-300">{stockLeft} items left at this price</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </Reveal>
    </section>
  );
});

FlashSale.displayName = 'FlashSale';

/* ─── Trust Section ──────────────────────────────────────────────────────── */

const TrustSection = memo(() => (
  <section className="luxury-shell py-14 cv-auto">
    <Reveal className="mb-8 text-center">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-[#7a4f28] dark:text-amber-300/95">
        Trust Layer
      </p>
      <h2 className="mt-3 text-3xl font-black text-gray-950 dark:text-white sm:text-5xl">
        Premium commerce, protected.
      </h2>
    </Reveal>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {trustItems.map((item, index) => {
        const Icon = item.icon;
        return (
          /* CSS hover lift — replaces motion.div whileHover + whileInView */
          <div
            key={item.title}
            className="rounded-[1.5rem] border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.06] p-5 shadow-xl shadow-black/[0.03] dark:shadow-black/20 backdrop-blur-xl transition-[border-color,transform] duration-300 hover:-translate-y-1.5 hover:border-amber-600/30 dark:hover:border-amber-200/30"
            style={{
              opacity: 0,
              animation: `fadeSlideUp 0.5s ease ${index * 60}ms forwards`,
            }}
          >
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-amber-400 dark:bg-amber-300 text-black">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-black text-gray-900 dark:text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-white/52">{item.copy}</p>
          </div>
        );
      })}
    </div>
  </section>
));

TrustSection.displayName = 'TrustSection';

/* ─── Stats Band ─────────────────────────────────────────────────────────── */

const StatsBand = memo(() => (
  <section className="luxury-shell py-12">
    <div className="grid gap-4 rounded-[2rem] border border-black/[0.07] dark:border-white/[0.1] bg-white/[0.55] dark:bg-[linear-gradient(145deg,#161514_0%,#0c0c0d_100%)] p-5 shadow-xl shadow-black/[0.04] backdrop-blur-xl dark:shadow-none sm:grid-cols-2 lg:grid-cols-4">
      {aboutStats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-[1.3rem] border border-transparent bg-[#f4f0eb]/90 dark:border-white/[0.06] dark:bg-white/[0.04] p-5"
        >
          <p className="text-4xl font-black text-gray-950 dark:text-white">
            <CountUp end={stat.value} enableScrollSpy scrollSpyOnce />
            {stat.suffix}
          </p>
          <p className="mt-2 text-sm font-bold text-gray-400 dark:text-white/50">{stat.label}</p>
        </div>
      ))}
    </div>
  </section>
));

StatsBand.displayName = 'StatsBand';

/* ─── Home Page ──────────────────────────────────────────────────────────── */

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

  // Stable references — prevents FlashSale/ProductRail re-renders when other state changes
  const railProducts = useMemo(
    () => (products.length >= 4 ? products : showcaseProducts),
    [products]
  );
  const reversedProducts = useMemo(() => [...railProducts].reverse(), [railProducts]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#f4ece4] text-[#2d2926] transition-colors duration-500 dark:bg-[#0a0a0a] dark:text-white">
      {/* Hero — eager, above the fold */}
      <Suspense fallback={<div className="min-h-[92svh] bg-[#070b0a]" aria-hidden />}>
        <CinematicMarketHero />
      </Suspense>

      {/* Category carousel — lazy-mount when entering viewport */}
      <LazyWhenVisible fallback={<CarouselSkeleton />} rootMargin="240px 0px">
        <Suspense fallback={<CarouselSkeleton />}>
          <CategoryCarousel />
        </Suspense>
      </LazyWhenVisible>

      {/* Trending products */}
      {loading ? (
        <SectionSkeleton />
      ) : (
        <LazyWhenVisible fallback={<SectionSkeleton />} rootMargin="240px 0px">
          <Suspense fallback={<SectionSkeleton />}>
            <ProductRail
              title="Trending Products"
              eyebrow="Market signals"
              copy="High-intent products with ratings, quick view, wishlist, add-to-cart, hover image swaps, and stock urgency."
              products={railProducts}
            />
          </Suspense>
        </LazyWhenVisible>
      )}

      {/* Flash sale — memoized, only re-renders when railProducts changes */}
      <LazyWhenVisible fallback={null} rootMargin="200px 0px">
        <FlashSale products={railProducts} />
      </LazyWhenVisible>

      {/* New arrivals */}
      <LazyWhenVisible fallback={<SectionSkeleton />} rootMargin="200px 0px">
        <Suspense fallback={<SectionSkeleton />}>
          <ProductRail
            title="New Arrivals"
            eyebrow="Freshly listed"
            copy="A premium carousel optimized for discovery across mobile, tablet, desktop, and ultra-wide layouts."
            products={reversedProducts}
          />
        </Suspense>
      </LazyWhenVisible>

      {/* Trust & Stats — defer with cv-auto for off-screen paint savings */}
      <LazyWhenVisible fallback={null} rootMargin="200px 0px">
        <TrustSection />
        <StatsBand />
      </LazyWhenVisible>

      {/* CTA Banner */}
      <section className="luxury-shell py-16 cv-auto">
        <Reveal className="grid gap-6 rounded-[2rem] border border-black/[0.08] bg-white/[0.88] p-6 shadow-xl shadow-black/[0.06] backdrop-blur-xl dark:border-white/[0.12] dark:bg-[linear-gradient(152deg,#1c1b1a_0%,#121211_38%,#080807_100%)] dark:shadow-none lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#7a4f28] dark:text-amber-300/95">
              Luxury operating system
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-5xl">
              Scalable UI components for every premium marketplace flow.
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [Gauge, 'Performance first'],
                [LockKeyhole, 'Secure checkout'],
                [BadgeCheck, 'Verified sellers'],
                [PackageCheck, 'Delivery visibility'],
              ].map(([Icon, label]) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-[#faf7f3]/95 p-4 text-sm font-black text-[#2d2926] dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-white/90"
                >
                  <Icon className="h-5 w-5 shrink-0 text-amber-800 dark:text-amber-300" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* CSS animation replaces infinite motion.div animate={{ y }} */}
          <div className="animate-bounce rounded-full border border-amber-700/25 bg-amber-500/[0.14] p-8 text-center dark:border-amber-400/30 dark:bg-amber-400/[0.12]" style={{ animationDuration: '4s' }}>
            <Sparkles className="mx-auto h-10 w-10 text-amber-900 dark:text-amber-300" />
            <p className="mt-3 text-sm font-black uppercase tracking-[0.2em] text-amber-950 dark:text-amber-100">
              Production ready
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default HomePage;
