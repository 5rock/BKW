import { CLOTHING_SIZES, SHOE_SIZES } from './filterConfig';

const SizeGroup = ({ title, sizes, selected, onToggle, counts }) => (
  <div className="space-y-2">
    <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-400">{title}</p>
    <div className="grid grid-cols-5 gap-2">
      {sizes.map((size) => {
        const active = selected.includes(size);
        return (
          <button
            key={size}
            type="button"
            onClick={() => onToggle(size)}
            className={`min-h-11 rounded-2xl border text-xs font-black transition-[background-color,border-color,color,transform] hover:-translate-y-0.5 active:scale-95 ${
              active
                ? 'border-gray-950 bg-gray-950 text-brand-yellow shadow-lg shadow-black/10 dark:border-brand-yellow dark:bg-brand-yellow dark:text-gray-950'
                : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-amber-300/10'
            }`}
            title={`${size} (${counts[size] || 0})`}
          >
            {size}
          </button>
        );
      })}
    </div>
  </div>
);

const SizeFilter = ({ selected = [], onToggle, counts = {} }) => (
  <div className="space-y-4">
    <SizeGroup title="Clothing" sizes={CLOTHING_SIZES} selected={selected} onToggle={onToggle} counts={counts} />
    <SizeGroup title="Shoes" sizes={SHOE_SIZES} selected={selected} onToggle={onToggle} counts={counts} />
  </div>
);

export default SizeFilter;
