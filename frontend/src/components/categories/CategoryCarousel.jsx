import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import { categories } from '../../constants/marketplace';
import Reveal from '../animations/Reveal';

/**
 * CategoryCarousel — Swiper-based category browser.
 *
 * Performance decisions:
 * - Replaced motion.button whileHover={{ y: -8 }} with CSS hover:-translate-y-2
 *   (compositor thread — zero JS cost)
 * - Replaced staggered motion.button initial/whileInView animations with
 *   CSS animation-delay (no Framer Motion per-item JS)
 * - Memoized the whole component so it only re-renders if categories change
 * - This component is already lazy-loaded via LazyWhenVisible in HomePage
 */
const CategoryCarousel = memo(() => {
  const navigate = useNavigate();

  return (
    <section className="luxury-shell py-16">
      <Reveal className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-600 dark:text-amber-200">
            Shop by Category
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-5xl">
            Curated departments
          </h2>
        </div>
        <p className="max-w-md text-sm leading-7 text-gray-600 dark:text-white/50">
          Circular premium cards, fast touch controls, and category signals for better discovery.
        </p>
      </Reveal>

      <Swiper
        modules={[FreeMode]}
        freeMode
        slidesPerView={2.2}
        spaceBetween={16}
        breakpoints={{
          640: { slidesPerView: 3.4 },
          1024: { slidesPerView: 5.2 },
          1280: { slidesPerView: 6.2 },
        }}
      >
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <SwiperSlide key={category.name}>
              {/*
                CSS-only hover lift — avoids Framer Motion on each item.
                CSS animation-delay for staggered reveal (no JS timer).
              */}
              <button
                onClick={() =>
                  navigate(`/products?category=${encodeURIComponent(category.name)}`)
                }
                className="group w-full opacity-0 animate-[fadeSlideUp_0.5s_ease_forwards]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative mx-auto aspect-square overflow-hidden rounded-full border border-black/[0.03] bg-white/40 p-2 shadow-lg shadow-black/[0.02] transition-transform duration-300 group-hover:-translate-y-2 dark:border-white/10 dark:bg-white/[0.06] dark:shadow-2xl dark:shadow-black/25">
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full rounded-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-1/2 grid h-11 w-11 -translate-x-1/2 place-items-center rounded-full bg-amber-400 dark:bg-amber-300 text-black shadow-xl">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-5 text-center text-sm font-black text-gray-950 dark:text-white">
                  {category.name}
                </p>
                <p className="mt-1 text-center text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-200/70">
                  {category.count} items
                </p>
              </button>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
});

CategoryCarousel.displayName = 'CategoryCarousel';

export default CategoryCarousel;
