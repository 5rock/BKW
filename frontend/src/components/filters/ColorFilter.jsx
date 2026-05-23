import { Check } from 'lucide-react';
import { COLOR_OPTIONS } from './filterConfig';

const ColorFilter = ({ selected = [], onToggle, counts = {} }) => (
  <div className="grid grid-cols-4 gap-3">
    {COLOR_OPTIONS.map((color) => {
      const active = selected.includes(color.label);
      return (
        <button
          key={color.label}
          type="button"
          onClick={() => onToggle(color.label)}
          title={`${color.label} (${counts[color.label] || 0})`}
          className="group flex flex-col items-center gap-2 transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.04] active:scale-95"
        >
          <span
            className={`relative grid h-10 w-10 place-items-center rounded-full border shadow-sm transition ${
              active ? `ring-4 ring-offset-2 ${color.ring} ring-offset-white dark:ring-offset-gray-950` : 'border-gray-200 group-hover:shadow-lg'
            }`}
            style={{ backgroundColor: color.value }}
          >
            {active && (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-gray-950/80 text-white">
                <Check className="h-3 w-3" />
              </span>
            )}
          </span>
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{counts[color.label] || 0}</span>
        </button>
      );
    })}
  </div>
);

export default ColorFilter;
