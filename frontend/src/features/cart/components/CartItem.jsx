import { memo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Minus, Plus, Trash2 } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import { optimizeUnsplash } from '@/utils/imageUtils';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=400&q=75';

const CartItem = memo(({ item }) => {
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const saveForLater = useCartStore((s) => s.saveForLater);
  const [loading, setLoading] = useState(false);

  const { product, quantity, id: itemId, savedForLater } = item;

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

  if (!product) return null;

  const unitPrice = item.price || product.finalPrice || product.price || 0;
  const productId = product.id || product._id;
  const imgSrc = optimizeUnsplash(product.images?.[0] || product.thumbnail) || FALLBACK_IMG;

  return (
    <div
      className={`group flex flex-col sm:flex-row gap-6 p-6 transition-all duration-300 border border-surface-border bg-surface-primary rounded-2xl ${
        loading ? 'pointer-events-none opacity-50' : 'hover:border-text-primary'
      }`}
    >
      {/* Product Image */}
      <div className="relative h-40 w-full sm:h-40 sm:w-32 flex-shrink-0 overflow-hidden rounded-xl bg-bg-primary">
        <Link to={`/products/${productId}`}>
          <img
            src={imgSrc}
            alt={product.name || product.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        {(product.discount > 0 || product.discountPercent > 0) && (
          <span className="absolute top-2 left-2 bg-color-gold text-bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-widest shadow-md">
            -{product.discount || product.discountPercent}%
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col flex-grow justify-between">
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              {product.brand || product.category}
            </p>
            <Link to={`/products/${productId}`}>
              <h3 className="text-lg text-text-primary font-medium tracking-wide transition-colors group-hover:text-color-gold">
                {product.name || product.title}
              </h3>
            </Link>
            {(item.selectedSize || item.selectedColor) && (
              <p className="text-xs text-text-secondary mt-2 flex gap-3">
                {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                {item.selectedColor && <span>Color: {item.selectedColor}</span>}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="text-xl text-text-primary font-light">
              ${(unitPrice * quantity).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            {quantity > 1 && (
              <p className="text-xs text-text-secondary mt-1">${unitPrice.toLocaleString()} each</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-surface-border">
          {/* Quantity Controls */}
          <div className="flex items-center justify-between border border-surface-border rounded-full px-2 py-1 w-28 bg-bg-primary">
            <button
              onClick={decrement}
              aria-label="Decrease quantity"
              className="text-text-secondary hover:text-color-gold p-1.5 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="text-text-primary text-sm font-bold w-6 text-center">{quantity}</span>
            <button
              onClick={increment}
              aria-label="Increase quantity"
              className="text-text-secondary hover:text-color-gold p-1.5 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
            >
              <Bookmark size={14} className={savedForLater ? "fill-current" : ""} />
              <span className="hidden sm:inline">{savedForLater ? 'Move to bag' : 'Save'}</span>
            </button>
            <div className="w-px h-4 bg-surface-border hidden sm:block" />
            <button
              onClick={handleRemove}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
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
