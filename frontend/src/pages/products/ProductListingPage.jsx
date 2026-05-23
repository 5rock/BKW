import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../../components/products/ProductCard';
import FilterSidebar from '../../components/filters/FilterSidebar';
import MobileFilterDrawer from '../../components/filters/MobileFilterDrawer';
import { PageSectionSkeleton } from '../../components/ui/LoadingSkeleton';
import Reveal from '../../components/animations/Reveal';
import { getProducts } from '../../services/productService';
import { SORT_OPTIONS } from '../../utils/productUtils';
import { useDebounce } from '../../hooks/useDebounce';
import { useFilters } from '../../hooks/useFilters';
import { useFilterStore } from '../../store/filterStore';

const increment = (target, key) => {
  if (!key) return;
  target[key] = (target[key] || 0) + 1;
};

const buildFacets = (products) => {
  const facets = {
    total: products.length,
    categories: { All: products.length },
    brands: {},
    colors: {},
    sizes: {},
    ratings: {},
    discounts: {},
  };

  products.forEach((product) => {
    increment(facets.categories, product.category);
    increment(facets.brands, product.brand);
    product.colors?.forEach((color) => increment(facets.colors, color));
    product.sizes?.forEach((size) => increment(facets.sizes, size));
    [1, 2, 3, 4, 5].forEach((rating) => {
      if (product.rating >= rating) increment(facets.ratings, rating);
    });
    [10, 20, 30, 40, 50, 60].forEach((discount) => {
      if (product.discountPercent >= discount) increment(facets.discounts, discount);
    });
  });

  return facets;
};

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category: routeCategory } = useParams();
  const filters = useFilterStore((state) => state.filters);
  const setFilter = useFilterStore((state) => state.setFilter);
  const setFilters = useFilterStore((state) => state.setFilters);
  const toggleArrayFilter = useFilterStore((state) => state.toggleArrayFilter);
  const toggleBooleanFilter = useFilterStore((state) => state.toggleBooleanFilter);
  const clearFilter = useFilterStore((state) => state.clearFilter);
  const resetFilterStore = useFilterStore((state) => state.resetFilters);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 350);
  const debouncedFilters = useDebounce(filters, 250);
  const [products, setProducts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [mobileFilters, setMobileFilters] = useState(false);
  const { appliedChips, activeCount } = useFilters(filters);

  const queryFilters = useMemo(
    () => ({ ...debouncedFilters, search: debouncedSearch, limit: 24 }),
    [debouncedFilters, debouncedSearch]
  );
  const facets = useMemo(() => buildFacets(products), [products]);

  useEffect(() => {
    const category = routeCategory ? decodeURIComponent(routeCategory) : searchParams.get('category') || 'All';
    const sort = searchParams.get('sort') || 'latest';
    setFilters({ category, sort });
  }, [routeCategory]);

  const syncUrl = useCallback(
    (currentFilters, currentSearch) => {
      const params = {};
      if (currentSearch) params.search = currentSearch;
      if (currentFilters.category !== 'All') params.category = currentFilters.category;
      if (currentFilters.sort !== 'latest') params.sort = currentFilters.sort;
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  const load = async (append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    setError('');
    try {
      const result = await getProducts({ ...queryFilters, cursor: append ? cursor : null });
      setProducts((prev) => (append ? [...prev, ...result.products] : result.products));
      setCursor(result.lastDoc);
      setHasMore(result.hasMore);
      syncUrl(queryFilters, debouncedSearch);
    } catch (err) {
      console.error(err);
      setError('Products could not be loaded. Check connection and try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    load(false);
  }, [queryFilters]);

  const resetFilters = () => {
    resetFilterStore();
    setSearch('');
  };

  const filterProps = {
    filters,
    setFilter,
    toggleArrayFilter,
    toggleBooleanFilter,
    onReset: resetFilters,
    facets,
    isLoading: loading,
  };

  return (
    <div className="min-h-screen bg-[#f4ece4] pt-28 pb-20 text-[#2d2926] transition-colors duration-500 dark:bg-[#0a0a0a] dark:text-white">
      <main className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <Reveal className="mb-8 overflow-hidden rounded-[2rem] border border-black/10 bg-[#f5efe7]/85 p-6 text-black shadow-2xl shadow-black/[0.06] backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-[#0a0a0a]/88 dark:text-white dark:shadow-black/30 md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">GoldMarket</p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                {filters.category !== 'All' ? filters.category : 'Premium Product Catalog'}
              </h1>
              <p className="mt-2 max-w-2xl text-gray-600 dark:text-white/50">
                Search, filter, compare, wishlist, and cart products from verified sellers.
              </p>
            </div>
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-700 dark:text-amber-200" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands, SKU..."
                className="w-full rounded-full border border-black/10 bg-white/75 py-4 pl-12 pr-4 text-black outline-none backdrop-blur transition-all duration-300 placeholder:text-gray-500 focus:border-amber-700/40 focus:ring-2 focus:ring-amber-700/10 dark:border-white/15 dark:bg-[#111111]/85 dark:text-white dark:placeholder:text-white/35 dark:focus:border-amber-400/60 dark:focus:ring-amber-400/20"
              />
            </div>
          </div>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1 no-scrollbar">
              <FilterSidebar {...filterProps} />
            </div>
          </aside>

          <section>
            {/* Results bar */}
            <div className="mb-4 flex flex-col justify-between gap-3 rounded-[2rem] border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] p-5 shadow-xl shadow-black/[0.02] dark:shadow-none backdrop-blur-xl sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-white/40">
                  {loading ? 'Processing...' : `${products.length} products found`}
                </p>
                <h2 className="text-xl font-black text-gray-950 dark:text-white">Curated Collection</h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMobileFilters(true)}
                  className="relative rounded-2xl border border-black/5 bg-black/[0.03] p-3 dark:border-white/10 dark:bg-white/[0.06] lg:hidden"
                >
                  <SlidersHorizontal className="h-5 w-5 text-gray-950 dark:text-white" />
                  {activeCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-amber-300 text-[10px] font-black text-black">
                      {activeCount}
                    </span>
                  )}
                </button>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilter('sort', e.target.value)}
                  className="rounded-2xl border border-black/5 bg-black/[0.03] px-4 py-3 text-sm font-bold text-gray-950 outline-none transition focus:border-amber-400/50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-white text-gray-950 dark:bg-[#111] dark:text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {appliedChips.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2 animate-[fadeSlideUp_180ms_ease-out]">
                  {appliedChips.map((chip) => (
                    <button
                      key={`${chip.key}-${chip.value || chip.label}`}
                      type="button"
                      onClick={() => clearFilter(chip.key, chip.value)}
                      className="flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-xs font-black text-amber-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-200/15 dark:text-amber-100"
                    >
                      {chip.label}
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-full px-3 py-2 text-xs font-black text-gray-500 hover:text-red-400 dark:text-white/40 dark:hover:text-red-300"
                  >
                    Reset all
                  </button>
                </div>
              )}

            {loading && <PageSectionSkeleton rows={12} />}

            {error && (
              <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-10 text-center font-bold text-red-300">
                {error}
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="rounded-[3rem] border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] p-16 text-center backdrop-blur-xl shadow-xl shadow-black/[0.02]">
                <h3 className="text-2xl font-black text-gray-950 dark:text-white">No products found</h3>
                <p className="mt-2 text-gray-500 dark:text-white/45">Adjust the filters or search for another product.</p>
                <button
                  onClick={resetFilters}
                  className="mt-6 rounded-full bg-amber-300 px-6 py-3 font-black text-black transition hover:bg-amber-200"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {!loading && products.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
                  {products.map((product, index) => (
                    <div
                      key={product.id || product._id}
                      className="h-full opacity-0 animate-[fadeSlideUp_0.42s_ease_forwards]"
                      style={{ animationDelay: `${Math.min(index * 24, 240)}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-10 flex justify-center">
                    <button
                      disabled={loadingMore}
                      onClick={() => load(true)}
                      className="rounded-full border border-black/5 bg-white px-8 py-4 font-black text-gray-950 shadow-md transition hover:scale-105 hover:bg-black/5 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:shadow-none dark:hover:bg-white/10"
                    >
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
      <MobileFilterDrawer
        open={mobileFilters}
        onClose={() => setMobileFilters(false)}
        resultCount={products.length}
        {...filterProps}
      />
    </div>
  );
};

export default ProductListingPage;
