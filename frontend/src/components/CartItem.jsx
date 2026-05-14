import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

const CartItem = ({ item }) => {
  const { updateItem, removeItem, saveForLater } = useCart();
  const [loading, setLoading] = useState(false);
  const { product, quantity, id: itemId } = item;

  if (!product) return null;
  const unitPrice = item.price || product.finalPrice || product.price || 0;

  const handleQuantity = async (delta) => {
    const newQty = quantity + delta;
    setLoading(true);
    if (newQty <= 0) {
      await removeItem(itemId);
    } else {
      await updateItem(itemId, newQty);
    }
    setLoading(false);
  };

  const handleRemove = async () => {
    setLoading(true);
    await removeItem(itemId);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80, scale: 0.95 }}
      layout
      className={`theme-card flex flex-col gap-6 rounded-2xl p-4 transition-all duration-300 hover:border-amber-600/25 dark:hover:border-amber-200/20 sm:flex-row sm:p-6 ${
        loading ? 'pointer-events-none opacity-50' : ''
      }`}
    >
      {/* Image */}
      <div className="relative h-32 w-full flex-shrink-0 overflow-hidden rounded-xl bg-neutral-900 sm:h-32 sm:w-32">
        <Link to={`/products/${product.id || product._id}`}>
          <img
            src={product.images?.[0] || product.thumbnail || 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=400&q=80'}
            alt={product.name || product.title}
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
            <Link to={`/products/${product.id || product._id}`}>
              <h3 className="theme-text line-clamp-2 font-bold leading-tight transition-colors hover:text-amber-700 dark:hover:text-amber-200">
                {product.name || product.title}
              </h3>
            </Link>
          </div>
          <div className="text-right">
            <span className="theme-text whitespace-nowrap text-xl font-black">
              ${(unitPrice * quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {quantity > 1 && (
              <p className="theme-soft mt-1 text-xs">${unitPrice.toLocaleString()} each</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="theme-card-strong flex items-center rounded-full">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleQuantity(-1)}
              className="theme-text rounded-full p-2 transition hover:bg-black/5 hover:text-amber-700 dark:hover:bg-white/10 dark:hover:text-amber-200"
            >
              <Minus className="h-4 w-4" />
            </motion.button>
            <span className="theme-text min-w-[40px] px-2 text-center font-black">{quantity}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleQuantity(1)}
              className="theme-text rounded-full p-2 transition hover:bg-black/5 hover:text-amber-700 dark:hover:bg-white/10 dark:hover:text-amber-200"
            >
              <Plus className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => saveForLater(itemId, !item.savedForLater)}
              className="theme-muted flex items-center gap-1.5 rounded-lg p-2 text-sm font-semibold transition-colors hover:bg-amber-700/10 hover:text-amber-800 dark:hover:bg-amber-200/10 dark:hover:text-amber-200"
            >
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">{item.savedForLater ? 'Move to cart' : 'Save'}</span>
            </button>
            <button
              onClick={handleRemove}
              className="theme-muted flex items-center gap-1.5 rounded-lg p-2 text-sm font-semibold transition-colors hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
