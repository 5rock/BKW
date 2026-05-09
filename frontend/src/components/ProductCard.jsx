import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    
    setIsAdding(true);
    await addItem(product.id || product._id, 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  const discountPercent = product.originalPrice && product.price < product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  return (
    <motion.div 
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-300 relative flex flex-col overflow-hidden h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {discountPercent > 0 && (
          <span className="bg-brand-red text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
        {product.badge && (
          <span className="bg-brand-yellow text-text-light text-xs font-bold px-2 py-1 rounded-md shadow-sm uppercase">
            {product.badge}
          </span>
        )}
      </div>

      {/* Action Buttons (Wishlist & Quick View) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-3 right-3 z-10 flex flex-col gap-2"
          >
            <button className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-text-muted-light dark:text-text-muted-dark hover:text-brand-red dark:hover:text-brand-red hover:bg-white dark:hover:bg-gray-800 shadow-md transition-all">
              <Heart className="h-4 w-4" />
            </button>
            <button className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-text-muted-light dark:text-text-muted-dark hover:text-brand-yellow dark:hover:text-brand-yellow hover:bg-white dark:hover:bg-gray-800 shadow-md transition-all">
              <Eye className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image */}
      <Link to={`/products/${product.id || product._id}`} className="block relative overflow-hidden bg-gray-50 dark:bg-gray-800 pt-[100%]">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* Quick Add Overlay on Image Hover */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/60 to-transparent flex justify-center">
           <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full bg-brand-yellow text-text-light font-bold py-2 rounded-full shadow-lg hover:bg-yellow-400 active:scale-95 transition-all flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 duration-300"
          >
            {isAdding ? (
              <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 animate-bounce" /> Adding...</span>
            ) : (
              <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Quick Add</span>
            )}
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 bg-white dark:bg-gray-900 z-20">
        <p className="text-xs text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider mb-1 font-semibold">{product.category}</p>
        <Link to={`/products/${product.id || product._id}`}>
          <h4 className="font-bold text-text-light dark:text-text-dark line-clamp-2 mb-2 group-hover:text-brand-yellow transition-colors text-sm sm:text-base leading-snug">
            {product.name}
          </h4>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-brand-yellow">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating || 0) ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
            ))}
          </div>
          <span className="text-xs text-text-muted-light dark:text-text-muted-dark">({product.reviews || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-lg font-black text-text-light dark:text-text-dark">
            ${product.price?.toLocaleString()}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-text-muted-light dark:text-text-muted-dark line-through text-sm">
              ${product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
