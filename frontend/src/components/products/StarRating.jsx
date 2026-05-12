import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, count, size = 'h-4 w-4' }) => (
  <div className="flex items-center gap-2">
    <div className="flex text-brand-yellow">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`${size} ${index < Math.round(rating) ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`}
        />
      ))}
    </div>
    {count !== undefined && <span className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark">({count})</span>}
  </div>
);

export default StarRating;
