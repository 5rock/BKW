import { useMemo, useState } from 'react';
import { Check, Filter, RotateCcw, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ADVANCED_FILTERS, CATEGORY_OPTIONS } from './filterConfig';
import FilterSection from './FilterSection';
import PriceSlider from './PriceSlider';
import RatingFilter from './RatingFilter';
import BrandFilter from './BrandFilter';
import ColorFilter from './ColorFilter';
import SizeFilter from './SizeFilter';

const DiscountButton = ({ value, active, onClick, count }) => (
  <motion.button
    type="button"
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className={`rounded-2xl border px-3 py-2 text-sm font-black transition ${
      active
        ? 'border-gray-950 bg-gray-950 text-brand-yellow dark:border-brand-yellow dark:bg-brand-yellow dark:text-gray-950'
        : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200'
    }`}
  >
    {value}%+
    <span className="ml-1 text-[11px] opacity-60">({count || 0})</span>
  </motion.button>
);

const FilterSidebar = ({
  filters,
  setFilter,
  toggleArrayFilter,
  toggleBooleanFilter,
  onReset,
  facets = {},
  isLoading = false,
}) => {
  const [categorySearch, setCategorySearch] = useState('');

  const categoryOptions = useMemo(
    () => CATEGORY_OPTIONS.filter((item) => item.label.toLowerCase().includes(categorySearch.trim().toLowerCase())),
    [categorySearch]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/80 p-5 shadow-2xl shadow-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-gray-950/75"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-amber-200/35 to-transparent" />
      <div className="relative space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-600 dark:text-amber-200">MarketX</p>
            <h2 className="mt-1 flex items-center gap-2 text-xl font-black text-gray-950 dark:text-white">
              <Filter className="h-5 w-5" /> Filters
            </h2>
          </div>
          <motion.button
            type="button"
            whileHover={{ rotate: -12, scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={onReset}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-red-200 hover:text-brand-red dark:border-white/10 dark:bg-white/5"
            aria-label="Reset filters"
          >
            <RotateCcw className="h-4 w-4" />
          </motion.button>
        </div>

        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-2xl bg-gradient-to-r from-gray-100 via-white to-gray-100 dark:from-white/5 dark:via-white/10 dark:to-white/5" />
            ))}
          </div>
        )}

        <FilterSection title="Category">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={categorySearch}
                onChange={(event) => setCategorySearch(event.target.value)}
                placeholder="Search categories"
                className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm font-bold outline-none transition placeholder:text-gray-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {categoryOptions.map(({ label, icon: Icon }) => {
                  const active = filters.category === label;
                  return (
                    <motion.button
                      key={label}
                      type="button"
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      onClick={() => setFilter('category', label)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                        active ? 'bg-gray-950 text-white shadow-lg shadow-black/10 dark:bg-white dark:text-gray-950' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className={`grid h-9 w-9 place-items-center rounded-2xl ${active ? 'bg-brand-yellow text-gray-950' : 'bg-amber-50 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200'}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-black">{label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${active ? 'bg-white/15 dark:bg-gray-950/10' : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300'}`}>
                        {facets.categories?.[label] || (label === 'All' ? facets.total || 0 : 0)}
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Price">
          <PriceSlider value={filters.priceRange} onChange={(value) => setFilter('priceRange', value)} />
        </FilterSection>

        <FilterSection title="Rating">
          <RatingFilter value={filters.rating} onChange={(value) => setFilter('rating', value)} counts={facets.ratings} />
        </FilterSection>

        <FilterSection title="Brands">
          <BrandFilter selected={filters.brands} onToggle={(value) => toggleArrayFilter('brands', value)} counts={facets.brands} />
        </FilterSection>

        <FilterSection title="Color">
          <ColorFilter selected={filters.colors} onToggle={(value) => toggleArrayFilter('colors', value)} counts={facets.colors} />
        </FilterSection>

        <FilterSection title="Size">
          <SizeFilter selected={filters.sizes} onToggle={(value) => toggleArrayFilter('sizes', value)} counts={facets.sizes} />
        </FilterSection>

        <FilterSection title="Availability">
          <div className="grid grid-cols-2 gap-2">
            {[
              ['all', 'All'],
              ['in', 'In stock'],
              ['out', 'Out'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter('availability', value)}
                className={`rounded-2xl border px-3 py-2 text-sm font-black transition ${
                  filters.availability === value
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-emerald-200'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Discount">
          <div className="grid grid-cols-3 gap-2">
            {[10, 20, 30, 40, 50, 60].map((discount) => (
              <DiscountButton
                key={discount}
                value={discount}
                active={filters.minDiscount === discount}
                count={facets.discounts?.[discount]}
                onClick={() => setFilter('minDiscount', filters.minDiscount === discount ? 0 : discount)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Advanced">
          <div className="space-y-2">
            {ADVANCED_FILTERS.map(({ key, label, icon: Icon }) => {
              const active = filters[key];
              return (
                <motion.button
                  key={key}
                  type="button"
                  whileHover={{ x: 3 }}
                  onClick={() => toggleBooleanFilter(key)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition ${
                    active
                      ? 'border-amber-300 bg-amber-50 text-gray-950 shadow-sm dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-amber-600 dark:text-amber-200' : 'text-gray-400'}`} />
                  <span className="flex-1 text-sm font-black">{label}</span>
                  <span className={`grid h-5 w-5 place-items-center rounded-md border ${active ? 'border-brand-yellow bg-brand-yellow text-gray-950' : 'border-gray-300 dark:border-white/20'}`}>
                    {active && <Check className="h-3.5 w-3.5" />}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </FilterSection>
      </div>
    </motion.div>
  );
};

export default FilterSidebar;
