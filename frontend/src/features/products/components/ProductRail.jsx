import { memo } from 'react';
import { Link } from 'react-router-dom';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import ProductCard from '@/features/products/components/ProductCard';
import Reveal from '@/components/ui/Reveal';

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
    <div className="-mx-4 flex min-h-[31rem] snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 scroll-smooth no-scrollbar sm:-mx-6 sm:min-h-[34rem] sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 xl:grid-cols-4">
      {products.map((product) => (
        <div
          key={product.id || product._id}
          className="w-[82vw] shrink-0 snap-start pb-2 sm:w-[44vw] lg:w-auto"
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  </section>
));

ProductRail.displayName = 'ProductRail';

export default ProductRail;
