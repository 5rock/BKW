import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CartItem = ({ item }) => {
  const { updateItem, removeItem } = useCart();
  const [loading, setLoading] = useState(false);
  const { product, quantity, id: itemId } = item;

  if (!product) return null;

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
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className={`bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 relative ${loading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Image */}
      <div className="w-full sm:w-32 h-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 relative bg-gray-50 dark:bg-gray-800">
        <Link to={`/products/${product.id || product._id}`}>
          <img src={product.images?.[0] || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
        </Link>
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-grow flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-xs text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider mb-1 font-semibold">{product.category}</p>
            <Link to={`/products/${product.id || product._id}`}>
              <h3 className="font-bold text-text-light dark:text-text-dark hover:text-brand-yellow transition-colors line-clamp-2 leading-tight">
                {product.name}
              </h3>
            </Link>
          </div>
          <div className="text-right">
            <span className="font-black text-xl text-text-light dark:text-text-dark whitespace-nowrap">
              ${(product.price * quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {quantity > 1 && (
              <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">${product.price.toLocaleString()} each</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          {/* Quantity Controls */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-inner">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleQuantity(-1)}
              className="p-2 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all rounded-full text-text-light dark:text-text-dark"
            >
              <Minus className="h-4 w-4" />
            </motion.button>
            <span className="px-4 font-bold text-text-light dark:text-text-dark min-w-[40px] text-center">{quantity}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleQuantity(1)}
              className="p-2 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all rounded-full text-text-light dark:text-text-dark"
            >
              <Plus className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Remove */}
          <button
            onClick={handleRemove}
            className="text-text-muted-light hover:text-brand-red dark:text-text-muted-dark dark:hover:text-brand-red font-semibold text-sm flex items-center gap-1.5 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
