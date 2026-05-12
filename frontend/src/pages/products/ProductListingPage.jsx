import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../../components/products/ProductCard';
import ProductFilters from '../../components/filters/ProductFilters';
import { PageSectionSkeleton } from '../../components/ui/LoadingSkeleton';
import { getProducts } from '../../services/productService';
import { SORT_OPTIONS } from '../../utils/productUtils';
import { useDebounce } from '../../hooks/useDebounce';

const defaultFilters = {
  category: 'All',
  maxPrice: 5000,
  minRating: '',
  brand: '',
  color: '',
  size: '',
  sort: 'latest',
};

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category: routeCategory } = useParams();
  const [filters, setFilters] = useState({
    ...defaultFilters,
    category: routeCategory ? decodeURIComponent(routeCategory) : searchParams.get('category') || 'All',
    sort: searchParams.get('sort') || 'latest',
  });
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 350);
  const [products, setProducts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [mobileFilters, setMobileFilters] = useState(false);

  const queryFilters = useMemo(() => ({ ...filters, search: debouncedSearch, limit: 20 }), [filters, debouncedSearch]);

  const syncUrl = () => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.category !== 'All') params.category = filters.category;
    if (filters.sort !== 'latest') params.sort = filters.sort;
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
    setFilters(defaultFilters);
    setSearch('');
  };

  return (
    <div className="min-h-screen bg-background-light pt-28 pb-20 dark:bg-background-dark">
      <main className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-red-950 p-6 text-white shadow-2xl md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-brand-yellow">Marketplace</p>
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

        <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-3xl border border-gray-100 bg-white/85 p-6 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80">
              <ProductFilters filters={filters} setFilters={setFilters} onReset={resetFilters} />
            </div>
          </aside>

          <section>
            <div className="mb-6 flex flex-col justify-between gap-3 rounded-3xl border border-gray-100 bg-white/85 p-4 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold text-text-muted-light dark:text-text-muted-dark">{loading ? 'Loading products...' : `${products.length} products shown`}</p>
                <h2 className="text-xl font-black text-text-light dark:text-white">Curated Results</h2>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setMobileFilters((v) => !v)} className="rounded-2xl bg-gray-100 p-3 lg:hidden dark:bg-gray-800">
                  <SlidersHorizontal className="h-5 w-5 dark:text-white" />
                </button>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                  className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-text-light outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
            </div>

            <AnimatePresence>
              {mobileFilters && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-6 overflow-hidden lg:hidden">
                  <div className="rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <ProductFilters filters={filters} setFilters={setFilters} onReset={resetFilters} />
                  </div>
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
                    <ProductCard key={product.id} product={product} />
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
    </div>
  );
};

export default ProductListingPage;
