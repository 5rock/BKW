import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Fashion & Apparel', 'Electronics', 'Sneakers', 'Watches', 'Accessories', 'Home Decor'];
const SORT_OPTIONS = [
  { value: '', label: 'Popularity' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest Arrivals' },
];

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const sort = searchParams.get('sort') || '';
  const [priceFilter, setPriceFilter] = useState(25000);

  const loadProducts = async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      if (sort) params.sort = sort;
      if (priceFilter < 25000) params.maxPrice = priceFilter;

      const res = await fetchProducts(params);
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
    } catch {
      setError('Failed to load products. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, [search, category, sort, priceFilter]);

  const updateParam = (key, val) => {
    const params = Object.fromEntries(searchParams.entries());
    if (val) params[key] = val; else delete params[key];
    setSearchParams(params);
  };

  const SidebarContent = () => (
    <div className="space-y-8">
      {/* Category Filter */}
      <section>
        <h3 className="font-bold text-lg text-text-light dark:text-text-dark mb-4 tracking-tight flex items-center gap-2">
          <Filter className="h-5 w-5" /> Categories
        </h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={category === cat}
                onChange={() => updateParam('category', cat === 'All' ? '' : cat)}
                className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-pointer"
              />
              <span className={`text-sm group-hover:text-brand-yellow transition-colors ${category === cat ? 'text-brand-yellow font-bold' : 'text-text-muted-light dark:text-text-muted-dark font-medium'}`}>
                {cat}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Price Range */}
      <section>
        <h3 className="font-bold text-lg text-text-light dark:text-text-dark mb-4 tracking-tight">Price Range</h3>
        <div className="px-1">
          <input
            type="range"
            min={0}
            max={25000}
            step={100}
            value={priceFilter}
            onChange={(e) => setPriceFilter(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none accent-brand-yellow cursor-pointer"
          />
          <div className="flex justify-between mt-3 text-xs font-medium">
            <span className="text-text-muted-light dark:text-text-muted-dark">$0</span>
            <span className="bg-brand-yellow text-text-light px-2 py-0.5 rounded-md font-bold">${priceFilter.toLocaleString()}</span>
            <span className="text-text-muted-light dark:text-text-muted-dark">$25k+</span>
          </div>
        </div>
      </section>

      {/* Rating Filter */}
      <section>
        <h3 className="font-bold text-lg text-text-light dark:text-text-dark mb-4 tracking-tight">Customer Ratings</h3>
        {[4, 3].map((r) => (
          <button key={r} className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 w-full p-2.5 rounded-xl transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
            <div className="flex text-brand-yellow">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < r ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
              ))}
            </div>
            <span className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark">& Up</span>
          </button>
        ))}
      </section>

      <button onClick={loadProducts} className="w-full bg-text-light dark:bg-white text-white dark:text-text-light py-3.5 rounded-full font-bold text-sm active:scale-95 transition-transform hover:shadow-lg mt-4">
        Apply Filters
      </button>
    </div>
  );

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pt-28 pb-20">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">

        {/* Sidebar Filters - Desktop */}
        <aside className="hidden md:block w-64 flex-shrink-0 sticky top-28 h-fit">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <SidebarContent />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div>
              <h1 className="text-2xl font-black text-text-light dark:text-text-dark tracking-tight">
                {category !== 'All' ? category : search ? `Results for "${search}"` : 'All Products'}
              </h1>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1 font-medium">Showing {total} products</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="md:hidden flex items-center justify-center p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-text-light dark:text-text-dark"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
              <div className="flex-1 sm:flex-none flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-1">
                <span className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark whitespace-nowrap hidden sm:inline mr-2">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="bg-transparent w-full text-sm py-2 focus:outline-none dark:text-white font-semibold cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-800">{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Filter Dropdown */}
          <AnimatePresence>
            {isMobileFilterOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden mb-6"
              >
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <SidebarContent />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* States */}
          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-[350px] animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30">
              <span className="text-5xl mb-4">⚠️</span>
              <p className="text-brand-red font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <span className="text-6xl text-gray-300 dark:text-gray-600 mb-6">🔍</span>
              <h3 className="text-2xl font-black text-text-light dark:text-text-dark mb-2 tracking-tight">No products found</h3>
              <p className="text-text-muted-light dark:text-text-muted-dark">Try adjusting your filters or search for something else.</p>
              <button 
                onClick={() => { updateParam('search', ''); updateParam('category', ''); }}
                className="mt-6 text-brand-yellow font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <motion.div 
              layout
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            >
              <AnimatePresence>
                {products.map((p, i) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    key={p.id || p._id}
                    layout
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductListingPage;
