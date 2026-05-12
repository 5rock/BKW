import { memo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, ShoppingCart, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { money, normalizeProduct } from '../../utils/productUtils';
import StarRating from './StarRating';

const ProductCard = memo(({ product, onQuickView }) => {
  const item = normalizeProduct(product);
  const navigate = useNavigate();
  const { addItem, toggleWishlist, isWishlisted } = useCart();
  const [adding, setAdding] = useState(false);
  const wished = isWishlisted(item.id);

  const handleAdd = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAdding(true);
    await addItem(item, 1);
    setAdding(false);
  };

  const handleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await toggleWishlist(item.id);
  };

  return (
    <motion.article
      whileHover={{ y: -6 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/85 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-black/10 dark:border-white/10 dark:bg-gray-900/80"
    >
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
        {item.discountPercent > 0 && (
          <span className="rounded-full bg-brand-red px-2.5 py-1 text-[11px] font-black text-white shadow-sm">
            {item.discountPercent}% OFF
          </span>
        )}
        {item.featured && (
          <span className="rounded-full bg-brand-yellow px-2.5 py-1 text-[11px] font-black text-text-light shadow-sm">
            Featured
          </span>
        )}
        {Date.now() - (item.createdAt?.toMillis?.() || 0) < 1000 * 60 * 60 * 24 * 14 && (
          <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-black text-white shadow-sm">
            New
          </span>
        )}
      </div>

      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        <button
          onClick={handleWishlist}
          className="rounded-full bg-white/90 p-2 text-gray-600 shadow-md backdrop-blur hover:text-brand-red dark:bg-gray-800/90 dark:text-gray-200"
          aria-label="Wishlist"
        >
          <Heart className={`h-4 w-4 ${wished ? 'fill-brand-red text-brand-red' : ''}`} />
        </button>
        <button
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onQuickView ? onQuickView(item) : navigate(`/products/${item.id}`);
          }}
          className="rounded-full bg-white/90 p-2 text-gray-600 shadow-md backdrop-blur hover:text-brand-yellow dark:bg-gray-800/90 dark:text-gray-200"
          aria-label="Quick view"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      <Link to={`/products/${item.id}`} className="relative block aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={item.thumbnail || item.images[0] || 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80'}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 flex translate-y-3 justify-center bg-gradient-to-t from-black/65 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={handleAdd}
            disabled={adding || item.stock <= 0}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-yellow px-4 py-2.5 text-sm font-black text-text-light shadow-lg transition hover:bg-yellow-300 disabled:opacity-60"
          >
            {adding ? <ShoppingCart className="h-4 w-4 animate-bounce" /> : <ShoppingCart className="h-4 w-4" />}
            {item.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="truncate text-xs font-bold uppercase tracking-wide text-text-muted-light dark:text-text-muted-dark">{item.brand}</p>
          <StarRating rating={item.rating} count={item.reviewsCount} size="h-3.5 w-3.5" />
        </div>
        <Link to={`/products/${item.id}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-black leading-snug text-text-light transition-colors group-hover:text-brand-red dark:text-text-dark sm:text-base">
            {item.title}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-text-muted-light dark:text-text-muted-dark">{item.category}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-text-light dark:text-text-dark">{money(item.finalPrice)}</span>
              {item.discountPercent > 0 && <span className="text-sm text-gray-400 line-through">{money(item.price)}</span>}
            </div>
            <p className={`mt-1 text-xs font-bold ${item.stock <= 5 ? 'text-red-500' : 'text-emerald-500'}`}>
              {item.stock <= 0 ? 'Unavailable' : item.stock <= 5 ? `Only ${item.stock} left` : 'In stock'}
            </p>
          </div>
          <button
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              addItem(item, 1);
              navigate('/cart');
            }}
            className="rounded-full bg-gray-100 p-2.5 text-text-light transition hover:bg-brand-yellow dark:bg-gray-800 dark:text-white"
            aria-label="Buy now"
          >
            <Zap className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
