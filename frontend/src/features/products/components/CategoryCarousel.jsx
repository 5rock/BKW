import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '@/constants/marketplace';
import Reveal from '@/components/ui/Reveal';

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

      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 no-scrollbar sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <div key={category.name} className="w-[42vw] shrink-0 snap-start sm:w-[28vw] lg:w-auto">
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
                    width={220}
                    height={220}
                    sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 183px"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full rounded-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-1/2 grid h-11 w-11 -translate-x-1/2 place-items-center rounded-full bg-amber-400 text-black shadow-xl dark:bg-amber-300">
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
            </div>
          );
        })}
      </div>
    </section>
  );
});

CategoryCarousel.displayName = 'CategoryCarousel';

export default CategoryCarousel;
