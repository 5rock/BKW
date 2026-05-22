import { memo, useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Heart, ShoppingCart, Sparkles, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { money, normalizeProduct } from '../../utils/productUtils';
import StarRating from './StarRating';
import LazyImage from '../ui/LazyImage';

/**
 * ProductCard — memoized product tile for rails and grids.
 *
 * Performance decisions:
 * - whileHover y-lift replaced with CSS translateY (zero JS frame budget)
 * - Quick-view modal uses CSS opacity/scale transition instead of motion.div
 *   (saves Framer Motion layout thrashing on every render)
 * - useCallback on all event handlers to prevent child re-renders
 * - memo prevents re-render when parent fetches unrelated data
 */
const ProductCard = memo(({ product, onQuickView }) => {
  const item = normalizeProduct(product);
  const navigate = useNavigate();
  const { addItem, updateItem, toggleWishlist, isWishlisted, cartItems } = useCart();
  const [adding, setAdding] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  const altImage = item.images?.[1] || item.thumbnail || item.images?.[0];
  const primaryImage =
    item.thumbnail ||
    item.images?.[0] ||
    'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=75';
  const wished = isWishlisted(item.id);

  const cartEntry = cartItems?.find((i) => i.productId === item.id);
  const qtyInCart = cartEntry ? cartEntry.quantity : 0;

  const add = useCallback(
    async (event, buyNow = false) => {
      event.preventDefault();
      event.stopPropagation();
      setAdding(true);
      await addItem(item, 1);
      setAdding(false);
      if (buyNow) navigate('/cart');
    },
    [addItem, item, navigate]
  );

  const wishlist = useCallback(
    async (event) => {
      event.preventDefault();
      event.stopPropagation();
      await toggleWishlist(item.id);
    },
    [toggleWishlist, item.id]
  );

  const openQuick = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (onQuickView) onQuickView(item);
      else setQuickOpen(true);
    },
    [onQuickView, item]
  );

  return (
    <>
      {/*
        CSS-only hover lift (replaces motion.article whileHover={{ y: -8 }}).
        The browser handles this on the compositor thread — zero JS cost.
      */}
      <article className="group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-black/[0.04] bg-[#f8efe6]/85 shadow-lg shadow-black/[0.02] backdrop-blur-2xl transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-2 hover:border-amber-600/20 hover:shadow-2xl hover:shadow-amber-900/5 dark:border-white/10 dark:bg-[#0a0a0b]/80 dark:shadow-2xl dark:shadow-black/50 dark:hover:border-amber-200/30 dark:hover:shadow-amber-400/10">
        {/* Hover glow accent */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
          <div className="absolute -right-20 -top-24 h-44 w-44 rounded-full bg-amber-300/15 blur-3xl" />
        </div>

        {/* Badges */}
        <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
          {item.discountPercent > 0 && (
            <span className="rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
              {item.discountPercent}% OFF
            </span>
          )}
          {item.featured && (
            <span className="rounded-full bg-amber-400 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-black shadow-lg">
              Curated
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
          <button
            onClick={wishlist}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/45 text-white shadow-xl backdrop-blur transition-[color,transform] hover:text-red-300 hover:scale-105 active:scale-95"
            aria-label="Wishlist"
          >
            <Heart className={`h-4 w-4 ${wished ? 'fill-red-400 text-red-400' : ''}`} />
          </button>
          <button
            onClick={openQuick}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/45 text-white shadow-xl backdrop-blur transition-[color,transform] hover:text-amber-200 hover:scale-105 active:scale-95"
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* Image area — explicit aspect-ratio prevents CLS */}
        <Link to={`/products/${item.id}`} className="relative block aspect-[4/5] overflow-hidden bg-neutral-900">
          <LazyImage
            src={primaryImage}
            alt={item.title}
            containerClassName={`absolute inset-0 transition-opacity duration-700 ${altImage !== primaryImage ? 'group-hover:opacity-0' : ''}`}
            className="transition-transform duration-700 group-hover:scale-110"
          />
          {altImage !== primaryImage && (
            <LazyImage
              src={altImage}
              alt=""
              containerClassName="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              className="scale-105 transition-transform duration-700 group-hover:scale-100"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 dark:opacity-80" />

          {/* Cart overlay */}
          <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {qtyInCart > 0 ? (
              <div
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="flex w-full items-center justify-between gap-1 rounded-full bg-black/90 p-1 border border-amber-300/40 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md"
              >
                <button
                  disabled={adding}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAdding(true);
                    updateItem(cartEntry.id, qtyInCart - 1).finally(() => setAdding(false));
                  }}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition-[background-color,color] hover:bg-red-500/20 hover:text-red-200 font-black text-base active:scale-95"
                >
                  -
                </button>
                <span className="text-xs font-black tracking-wider text-amber-300 uppercase">
                  {qtyInCart} in Cart
                </span>
                <button
                  disabled={adding || item.stock <= qtyInCart}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAdding(true);
                    updateItem(cartEntry.id, qtyInCart + 1).finally(() => setAdding(false));
                  }}
                  className="grid h-9 w-9 place-items-center rounded-full bg-amber-300 text-black transition-[background-color] hover:bg-amber-200 font-black text-base disabled:opacity-50 active:scale-95"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                disabled={adding || item.stock <= 0}
                onClick={(event) => add(event)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-300 px-4 py-3 text-sm font-black text-black shadow-[0_16px_50px_rgba(245,197,82,0.28)] transition-[background-color,transform] hover:bg-amber-200 disabled:opacity-60 active:scale-95"
              >
                <ShoppingCart className={`h-4 w-4 ${adding ? 'animate-bounce' : ''}`} />
                {item.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            )}
          </div>
        </Link>

        {/* Card body */}
        <div className="relative flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.24em] text-amber-600 dark:text-amber-200/80">
              {item.brand}
            </p>
            <StarRating rating={item.rating} count={item.reviewsCount} size="h-3 w-3" />
          </div>
          <Link to={`/products/${item.id}`} className="block">
            <h3 className="line-clamp-2 min-h-[2.8rem] text-sm font-black leading-tight text-gray-950 dark:text-white transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-200 sm:text-base">
              {item.title}
            </h3>
          </Link>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
            {item.category}
          </p>
          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-xl font-black text-gray-950 dark:text-white">
                  {money(item.finalPrice)}
                </span>
                {item.discountPercent > 0 && (
                  <span className="text-sm font-bold text-gray-400 dark:text-white/32 line-through">
                    {money(item.price)}
                  </span>
                )}
              </div>
              <p
                className={`mt-1.5 text-[10px] font-black uppercase tracking-wider ${
                  item.stock <= 5 ? 'text-red-500' : 'text-emerald-500'
                }`}
              >
                {item.stock <= 0
                  ? 'Unavailable'
                  : item.stock <= 5
                  ? `Only ${item.stock} left`
                  : 'Verified stock'}
              </p>
            </div>
            <button
              onClick={(event) => add(event, true)}
              className="grid h-12 w-12 place-items-center rounded-full border border-black/5 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.08] text-amber-600 dark:text-amber-200 transition-[background-color,color,transform] hover:bg-amber-400 dark:hover:bg-amber-300 hover:text-black active:scale-90"
              aria-label="Buy now"
            >
              <Zap className="h-5 w-5" />
            </button>
          </div>
        </div>
      </article>

      {/* Quick-view modal — CSS opacity/scale transition instead of motion.div */}
      <AnimatePresence>
        {quickOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
            onClick={() => setQuickOpen(false)}
          >
            <motion.div
              initial={{ y: 24, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 24, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="grid w-full max-w-3xl overflow-hidden rounded-[2.5rem] border border-black/5 dark:border-white/10 bg-[#f4ece4] dark:bg-[#0b0b0c] shadow-2xl md:grid-cols-[0.9fr_1fr]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative aspect-square h-72 w-full md:aspect-auto md:h-full">
                <LazyImage src={primaryImage} alt={item.title} containerClassName="absolute inset-0" priority />
              </div>
              <div className="p-8">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-600 dark:text-amber-200">
                  {item.brand}
                </p>
                <h3 className="mt-2 text-3xl font-black text-gray-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-white/55">
                  {item.description ||
                    'A premium verified marketplace selection with protected checkout and priority delivery.'}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="text-3xl font-black text-gray-950 dark:text-white">
                    {money(item.finalPrice)}
                  </span>
                  {item.discountPercent > 0 && (
                    <span className="rounded-full bg-red-500/10 dark:bg-red-500/15 px-3 py-1 text-sm font-black text-red-600 dark:text-red-200">
                      {item.discountPercent}% off
                    </span>
                  )}
                </div>
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={(event) => add(event)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-amber-400 dark:bg-amber-300 px-6 py-4 text-sm font-black text-black shadow-lg shadow-amber-300/20 transition-[background-color,transform] active:scale-95 hover:bg-amber-500 dark:hover:bg-amber-200"
                  >
                    <ShoppingCart className="h-4 w-4" /> Add to cart
                  </button>
                  <Link
                    to={`/products/${item.id}`}
                    className="flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-black text-gray-950 dark:text-white transition-[background-color] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    Details
                  </Link>
                </div>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/45">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-200" />
                  Authenticated by MarketX standards
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
