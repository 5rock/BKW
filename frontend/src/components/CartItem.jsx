/**
 * CartItem.jsx — Memoized cart item row.
 *
 * Fixes vs original:
 *  1. Removed motion.div with layout + initial/animate/exit — caused DOM
 *     measurement on every cart change (getBoundingClientRect per item)
 *  2. Removed motion.button whileTap — replaced with CSS active:scale-90
 *  3. Added React.memo — only re-renders when the specific item changes
 *  4. useCartActions for stable action references (no re-render on cart state change)
 *  5. Wrapped handlers in useCallback with minimal deps
 *  6. Added loading=lazy + decoding=async on image (CartPage is below fold)
 *  7. Explicit image dimensions prevent CLS
 */
import { memo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Minus, Plus, Trash2 } from 'lucide-react';
import { useCartActions } from '../context/CartContext';
import { optimizeUnsplash } from '../utils/imageUtils';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=400&q=75';

const CartItem = memo(({ item }) => {
  // Only subscribe to actions — this component never needs to read cart state
  // so it will NOT re-render when cartTotal, cartCount, or other items change
  const { updateItem, removeItem, saveForLater } = useCartActions();
  const [loading, setLoading] = useState(false);

  const { product, quantity, id: itemId, savedForLater } = item;
  if (!product) return null;

  const unitPrice = item.price || product.finalPrice || product.price || 0;
  const productId = product.id || product._id;
  const imgSrc = optimizeUnsplash(product.images?.[0] || product.thumbnail) || FALLBACK_IMG;

  const handleQuantity = useCallback(async (delta) => {
    setLoading(true);
    const newQty = quantity + delta;
    if (newQty <= 0) await removeItem(itemId);
    else await updateItem(itemId, newQty);
    setLoading(false);
  }, [quantity, removeItem, updateItem, itemId]);

  const handleRemove = useCallback(async () => {
    setLoading(true);
    await removeItem(itemId);
    setLoading(false);
  }, [removeItem, itemId]);

  const handleSave = useCallback(() => {
    saveForLater(itemId, !savedForLater);
  }, [saveForLater, itemId, savedForLater]);

  const decrement = useCallback(() => handleQuantity(-1), [handleQuantity]);
  const increment = useCallback(() => handleQuantity(1), [handleQuantity]);

  return (
    /* CSS class animation instead of motion.div */
    <div
      className={`theme-card flex flex-col gap-6 rounded-2xl p-4 transition-[border-color,opacity] duration-300 hover:border-amber-600/25 dark:hover:border-amber-200/20 sm:flex-row sm:p-6 ${
        loading ? 'pointer-events-none opacity-50' : ''
      }`}
    >
      {/* Product Image */}
      <div className="relative h-32 w-full flex-shrink-0 overflow-hidden rounded-xl bg-neutral-900 sm:h-32 sm:w-32">
        <Link to={`/products/${productId}`}>
          <img
            src={imgSrc}
            alt={product.name || product.title}
            width={128}
            height={128}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
          />
        </Link>
        {(product.discount > 0 || product.discountPercent > 0) && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
            -{product.discount || product.discountPercent}%
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-grow flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-700/70 dark:text-amber-200/60">
              {product.category}
            </p>
            <Link to={`/products/${productId}`}>
              <h3 className="theme-text line-clamp-2 font-bold leading-tight transition-colors hover:text-amber-700 dark:hover:text-amber-200">
                {product.name || product.title}
              </h3>
            </Link>
          </div>
          <div className="shrink-0 text-right">
            <span className="theme-text whitespace-nowrap text-xl font-black">
              ${(unitPrice * quantity).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            {quantity > 1 && (
              <p className="theme-soft mt-1 text-xs">${unitPrice.toLocaleString()} each</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          {/* Quantity Controls — CSS active:scale-90 replaces motion.button whileTap */}
          <div className="theme-card-strong flex items-center rounded-full">
            <button
              onClick={decrement}
              aria-label="Decrease quantity"
              className="theme-text rounded-full p-2 transition-[background-color,color] hover:bg-black/5 hover:text-amber-700 active:scale-90 dark:hover:bg-white/10 dark:hover:text-amber-200"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="theme-text min-w-[40px] px-2 text-center font-black">{quantity}</span>
            <button
              onClick={increment}
              aria-label="Increase quantity"
              className="theme-text rounded-full p-2 transition-[background-color,color] hover:bg-black/5 hover:text-amber-700 active:scale-90 dark:hover:bg-white/10 dark:hover:text-amber-200"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="theme-muted flex items-center gap-1.5 rounded-lg p-2 text-sm font-semibold transition-[background-color,color] hover:bg-amber-700/10 hover:text-amber-800 dark:hover:bg-amber-200/10 dark:hover:text-amber-200"
            >
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">{savedForLater ? 'Move to cart' : 'Save'}</span>
            </button>
            <button
              onClick={handleRemove}
              className="theme-muted flex items-center gap-1.5 rounded-lg p-2 text-sm font-semibold transition-[background-color,color] hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

CartItem.displayName = 'CartItem';
export default CartItem;
