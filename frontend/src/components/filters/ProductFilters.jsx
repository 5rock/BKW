import { Filter, RotateCcw, Star } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../../utils/productUtils';

const BRANDS = ['All', 'Nike', 'Apple', 'Samsung', 'Sony', 'Levi\'s', 'MarketX', 'Adidas'];
const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Gold', 'Silver'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '6', '7', '8', '9', '10'];

const ProductFilters = ({ filters, setFilters, onReset }) => {
  const set = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-black text-text-light dark:text-text-dark">
          <Filter className="h-5 w-5" /> Filters
        </h2>
        <button onClick={onReset} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-red dark:hover:bg-gray-800">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-black text-text-light dark:text-text-dark">Category</h3>
        <div className="space-y-2">
          {['All', ...PRODUCT_CATEGORIES].map((category) => (
            <label key={category} className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="radio"
                checked={filters.category === category}
                onChange={() => set('category', category)}
                className="accent-brand-yellow"
              />
              <span className={filters.category === category ? 'font-bold text-brand-red' : 'text-text-muted-light dark:text-text-muted-dark'}>
                {category}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-black text-text-light dark:text-text-dark">Price Range</h3>
        <input
          type="range"
          min="0"
          max="5000"
          step="50"
          value={filters.maxPrice}
          onChange={(e) => set('maxPrice', Number(e.target.value))}
          className="w-full accent-brand-yellow"
        />
        <div className="mt-2 flex justify-between text-xs font-bold text-text-muted-light dark:text-text-muted-dark">
          <span>$0</span>
          <span>${Number(filters.maxPrice).toLocaleString()}</span>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-black text-text-light dark:text-text-dark">Rating</h3>
        {[4, 3, 2].map((rating) => (
          <button
            key={rating}
            onClick={() => set('minRating', rating)}
            className={`mb-2 flex w-full items-center gap-2 rounded-xl p-2 text-left transition ${
              filters.minRating === rating ? 'bg-yellow-50 text-text-light dark:bg-yellow-400/10 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="flex text-brand-yellow">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className={`h-4 w-4 ${index < rating ? 'fill-current' : 'text-gray-300'}`} />
              ))}
            </span>
            <span className="text-xs font-bold">& up</span>
          </button>
        ))}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-black text-text-light dark:text-text-dark">Brand</h3>
        <select value={filters.brand} onChange={(e) => set('brand', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
          {BRANDS.map((brand) => <option key={brand} value={brand === 'All' ? '' : brand}>{brand}</option>)}
        </select>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-black text-text-light dark:text-text-dark">Color</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button key={color} onClick={() => set('color', filters.color === color ? '' : color)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${filters.color === color ? 'border-brand-red bg-brand-red text-white' : 'border-gray-200 text-text-muted-light dark:border-gray-700 dark:text-text-muted-dark'}`}>
              {color}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-black text-text-light dark:text-text-dark">Size</h3>
        <div className="grid grid-cols-5 gap-2">
          {SIZES.map((size) => (
            <button key={size} onClick={() => set('size', filters.size === size ? '' : size)} className={`rounded-lg border py-2 text-xs font-black ${filters.size === size ? 'border-brand-yellow bg-brand-yellow text-text-light' : 'border-gray-200 text-text-muted-light dark:border-gray-700 dark:text-text-muted-dark'}`}>
              {size}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductFilters;
