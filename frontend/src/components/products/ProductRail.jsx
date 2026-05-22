import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import ProductCard from './ProductCard';
import Reveal from '../animations/Reveal';

/**
 * ProductRail — horizontal Swiper carousel of ProductCards.
 *
 * Performance:
 * - Memoized — only re-renders when title/products change
 * - Already lazy-loaded via React.lazy + LazyWhenVisible in HomePage
 * - Swiper itself is in vendor-swiper chunk (split by vite.config.js)
 */
const ProductRail = memo(({ title, eyebrow, copy, products = [] }) => (
  <section className="luxury-shell py-20 sm:py-28 cv-auto">
    <Reveal className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-600 dark:text-amber-200">
          {eyebrow}
        </p>
        <h2 className="mt-4 text-4xl font-black tracking-tight text-gray-950 dark:text-white sm:text-6xl">
          {title}
        </h2>
        {copy && (
          <p className="mt-4 max-w-2xl text-base leading-8 text-gray-600 dark:text-white/[0.52]">
            {copy}
          </p>
        )}
      </div>
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-300"
      >
        View all <ArrowRight className="h-4 w-4" />
      </Link>
    </Reveal>
    <Swiper
      modules={[FreeMode]}
      freeMode
      slidesPerView={1.2}
      spaceBetween={24}
      breakpoints={{
        640: { slidesPerView: 2.2 },
        1024: { slidesPerView: 3.2 },
        1280: { slidesPerView: 4 },
      }}
    >
      {products.map((product) => (
        <SwiperSlide key={product.id || product._id} className="h-auto pb-2">
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
));

ProductRail.displayName = 'ProductRail';

export default ProductRail;
