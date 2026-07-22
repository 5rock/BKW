import { useState } from 'react';
import Star from 'lucide-react/dist/esm/icons/star';

const RatingFilter = ({ value, onChange, counts = {} }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => {
        const active = value === rating;
        return (
          <button
            key={rating}
            type="button"
            onMouseEnter={() => setHovered(rating)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(active ? 0 : rating)}
            className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left transition-[background-color,border-color,box-shadow,transform] hover:translate-x-1 ${
              active
                ? 'border-amber-300 bg-amber-50 shadow-sm shadow-amber-200/70 dark:border-amber-300/40 dark:bg-amber-300/10'
                : 'border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:border-white/10 dark:hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="flex text-brand-yellow">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${index < rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'} ${hovered === rating ? 'drop-shadow-sm' : ''}`}
                  />
                ))}
              </span>
              <span className="text-xs font-black text-gray-700 dark:text-gray-200">& up</span>
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-black text-gray-500 dark:bg-white/10 dark:text-gray-300">
              {counts[rating] || 0}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default RatingFilter;
