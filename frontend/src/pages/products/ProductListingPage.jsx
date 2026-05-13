import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../../components/products/ProductCard';
import FilterSidebar from '../../components/filters/FilterSidebar';
import MobileFilterDrawer from '../../components/filters/MobileFilterDrawer';
import { PageSectionSkeleton } from '../../components/ui/LoadingSkeleton';
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

  const queryFilters = useMemo(() => ({ ...debouncedFilters, search: debouncedSearch, limit: 24 }), [debouncedFilters, debouncedSearch]);
  const facets = useMemo(() => buildFacets(products), [products]);

  useEffect(() => {
    const category = routeCategory ? decodeURIComponent(routeCategory) : searchParams.get('category') || 'All';
    const sort = searchParams.get('sort') || 'latest';
    setFilters({ category, sort });
  }, [routeCategory]);

  const syncUrl = () => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (queryFilters.category !== 'All') params.category = queryFilters.category;
    if (queryFilters.sort !== 'latest') params.sort = queryFilters.sort;
    setSearchParams(params, { replace: true });
  };

  const load = async (append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    setError('');
    try {
      const result = await getProducts({ ...queryFilters, cursor: append ? cursor : null });
      setProducts((prev) => (append ? [...prev, ...result.products] : result.products));
      setCursor(result.lastDoc);
      setHasMore(result.hasMore);
      syncUrl();
    } catch (err) {
      console.error(err);
      setError('Products could not be loaded. Check Firebase indexes/rules and try again.');
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.14),transparent_34%),linear-gradient(180deg,#fff,#f8fafc)] pt-28 pb-20 dark:bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.12),transparent_34%),linear-gradient(180deg,#050505,#111827)]">
      <main className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-r from-gray-950 via-black to-[#302406] p-6 text-white shadow-2xl shadow-black/20 md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-brand-yellow">GoldMarket</p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                {filters.category !== 'All' ? filters.category : 'Premium Product Catalog'}
              </h1>
              <p className="mt-2 max-w-2xl text-gray-300">Search, filter, compare, wishlist, and cart products from verified sellers.</p>
            </div>
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands, SKU..."
                className="w-full rounded-full border border-white/15 bg-white/10 py-4 pl-12 pr-4 text-white outline-none backdrop-blur placeholder:text-gray-400 focus:border-brand-yellow"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1 no-scrollbar">
              <FilterSidebar {...filterProps} />
            </div>
          </aside>

          <section>
            <div className="mb-4 flex flex-col justify-between gap-3 rounded-[1.5rem] border border-white/70 bg-white/85 p-4 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/70 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold text-text-muted-light dark:text-text-muted-dark">{loading ? 'Loading products...' : `${products.length} products shown`}</p>
                <h2 className="text-xl font-black text-text-light dark:text-white">Curated Results</h2>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setMobileFilters(true)} className="relative rounded-2xl bg-gray-100 p-3 lg:hidden dark:bg-gray-800">
                  <SlidersHorizontal className="h-5 w-5 dark:text-white" />
                  {activeCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand-yellow text-[10px] font-black text-gray-950">{activeCount}</span>}
                </button>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilter('sort', e.target.value)}
                  className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-text-light outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
            </div>

            <AnimatePresence>
              {appliedChips.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-6 flex flex-wrap gap-2">
                  {appliedChips.map((chip) => (
                    <button
                      key={`${chip.key}-${chip.value || chip.label}`}
                      type="button"
                      onClick={() => clearFilter(chip.key, chip.value)}
                      className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100"
                    >
                      {chip.label}
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ))}
                  <button type="button" onClick={resetFilters} className="rounded-full px-3 py-2 text-xs font-black text-gray-500 hover:text-brand-red dark:text-gray-300">
                    Reset all
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {loading && <PageSectionSkeleton rows={12} />}

            {error && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center font-bold text-red-600 dark:border-red-900/40 dark:bg-red-950/20">
                {error}
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="rounded-3xl border border-gray-100 bg-white p-16 text-center dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-2xl font-black text-text-light dark:text-white">No products found</h3>
                <p className="mt-2 text-text-muted-light dark:text-text-muted-dark">Adjust the filters or search for another product.</p>
                <button onClick={resetFilters} className="mt-6 rounded-full bg-brand-yellow px-6 py-3 font-black text-text-light">Clear Filters</button>
              </div>
            )}

            {!loading && products.length > 0 && (
              <>
                <motion.div layout className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3 2xl:grid-cols-4">
                  {products.map((product) => (
                    <motion.div key={product.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
                {hasMore && (
                  <div className="mt-10 flex justify-center">
                    <button disabled={loadingMore} onClick={() => load(true)} className="rounded-full bg-text-light px-8 py-4 font-black text-white transition hover:scale-105 disabled:opacity-60 dark:bg-white dark:text-text-light">
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
      <MobileFilterDrawer open={mobileFilters} onClose={() => setMobileFilters(false)} resultCount={products.length} {...filterProps} />
    </div>
  );
};

export default ProductListingPage;
