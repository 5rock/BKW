import Star from 'lucide-react/dist/esm/icons/star';

const StarRating = ({ rating = 0, count, size = 'h-4 w-4' }) => (
  <div className="flex items-center gap-2">
    <div className="flex text-amber-400">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`${size} ${index < Math.round(rating) ? 'fill-current' : 'text-black/20 dark:text-white/20'}`}
        />
      ))}
    </div>
    {count !== undefined && <span className="theme-soft text-xs font-medium">({count})</span>}
  </div>
);

export default StarRating;
