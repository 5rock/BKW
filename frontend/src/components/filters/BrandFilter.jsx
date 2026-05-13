import { useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { BRAND_OPTIONS } from './filterConfig';

const BrandFilter = ({ selected = [], onToggle, counts = {} }) => {
  const [query, setQuery] = useState('');
  const filteredBrands = useMemo(
    () => BRAND_OPTIONS.filter((brand) => brand.label.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search brands"
          className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm font-bold outline-none transition placeholder:text-gray-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>

      <div className="max-h-64 space-y-1 overflow-y-auto pr-1 no-scrollbar">
        <AnimatePresence initial={false}>
          {filteredBrands.map((brand) => {
            const active = selected.includes(brand.label);
            return (
              <motion.button
                key={brand.label}
                type="button"
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                onClick={() => onToggle(brand.label)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                  active ? 'bg-gray-950 text-white shadow-lg shadow-black/10 dark:bg-white dark:text-gray-950' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <span className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-black ${active ? 'bg-brand-yellow text-gray-950' : 'bg-amber-50 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200'}`}>
                  {brand.logo}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black">{brand.label}</span>
                  <span className={`text-xs ${active ? 'text-white/70 dark:text-gray-600' : 'text-gray-400'}`}>{counts[brand.label] || 0} products</span>
                </span>
                <span className={`grid h-5 w-5 place-items-center rounded-md border ${active ? 'border-brand-yellow bg-brand-yellow text-gray-950' : 'border-gray-300 dark:border-white/20'}`}>
                  {active && <Check className="h-3.5 w-3.5" />}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BrandFilter;
