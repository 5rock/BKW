import { memo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Heart, ShoppingCart, Sparkles, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { money, normalizeProduct } from '../../utils/productUtils';
import StarRating from './StarRating';

const ProductCard = memo(({ product, onQuickView }) => {
  const item = normalizeProduct(product);
  const navigate = useNavigate();
  const { addItem, toggleWishlist, isWishlisted } = useCart();
  const [adding, setAdding] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const altImage = item.images?.[1] || item.thumbnail || item.images?.[0];
  const primaryImage = item.thumbnail || item.images?.[0] || 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80';
  const wished = isWishlisted(item.id);

  const add = async (event, buyNow = false) => {
    event.preventDefault();
    event.stopPropagation();
    setAdding(true);
    await addItem(item, 1);
    setAdding(false);
    if (buyNow) navigate('/cart');
  };

  const wishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await toggleWishlist(item.id);
  };

  const openQuick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (onQuickView) onQuickView(item);
    else setQuickOpen(true);
  };

  return (
    <>
      <motion.article
        layout
        whileHover={{ y: -8 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111]/80 shadow-2xl shadow-black/25 backdrop-blur-xl transition duration-300 hover:border-amber-200/30 hover:shadow-amber-300/10"
      >
        <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
          <div className="absolute -right-20 -top-24 h-44 w-44 rounded-full bg-amber-300/15 blur-3xl" />
        </div>

        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
          {item.discountPercent > 0 && <span className="rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-black text-white">{item.discountPercent}% OFF</span>}
          {item.featured && <span className="rounded-full bg-amber-300 px-2.5 py-1 text-[11px] font-black text-black">Curated</span>}
        </div>

        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
          <button onClick={wishlist} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/45 text-white shadow-xl backdrop-blur transition hover:text-red-300" aria-label="Wishlist">
            <Heart className={`h-4 w-4 ${wished ? 'fill-red-400 text-red-400' : ''}`} />
          </button>
          <button onClick={openQuick} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/45 text-white shadow-xl backdrop-blur transition hover:text-amber-200" aria-label="Quick view">
            <Eye className="h-4 w-4" />
          </button>
        </div>

        <Link to={`/products/${item.id}`} className="relative block aspect-[4/5] overflow-hidden bg-neutral-900">
          <img src={primaryImage} alt={item.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110 group-hover:opacity-0" />
          <img src={altImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition duration-700 group-hover:scale-100 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-80" />
          <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button disabled={adding || item.stock <= 0} onClick={(event) => add(event)} className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-300 px-4 py-3 text-sm font-black text-black shadow-[0_16px_50px_rgba(245,197,82,0.28)] transition hover:bg-amber-200 disabled:opacity-60">
              <ShoppingCart className={`h-4 w-4 ${adding ? 'animate-bounce' : ''}`} />
              {item.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </Link>

        <div className="relative flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="truncate text-[11px] font-black uppercase tracking-[0.2em] text-amber-200/80">{item.brand}</p>
            <StarRating rating={item.rating} count={item.reviewsCount} size="h-3.5 w-3.5" />
          </div>
          <Link to={`/products/${item.id}`} className="block">
            <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-black leading-snug text-white transition group-hover:text-amber-100 sm:text-base">{item.title}</h3>
          </Link>
          <p className="mt-2 text-xs font-semibold text-white/45">{item.category}</p>
          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-lg font-black text-white">{money(item.finalPrice)}</span>
                {item.discountPercent > 0 && <span className="text-sm font-bold text-white/32 line-through">{money(item.price)}</span>}
              </div>
              <p className={`mt-1 text-xs font-black ${item.stock <= 5 ? 'text-red-300' : 'text-emerald-300'}`}>
                {item.stock <= 0 ? 'Unavailable' : item.stock <= 5 ? `Only ${item.stock} left` : 'Verified stock'}
              </p>
            </div>
            <button onClick={(event) => add(event, true)} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.08] text-amber-200 transition hover:bg-amber-300 hover:text-black" aria-label="Buy now">
              <Zap className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.article>

      <AnimatePresence>
        {quickOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setQuickOpen(false)}>
            <motion.div initial={{ y: 28, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 28, scale: 0.96 }} className="grid w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0c] shadow-2xl md:grid-cols-[0.9fr_1fr]" onClick={(event) => event.stopPropagation()}>
              <img src={primaryImage} alt={item.title} className="h-72 w-full object-cover md:h-full" />
              <div className="p-6">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200">{item.brand}</p>
                <h3 className="mt-2 text-3xl font-black text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{item.description || 'A premium verified marketplace selection with protected checkout and priority delivery.'}</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="text-3xl font-black text-white">{money(item.finalPrice)}</span>
                  {item.discountPercent > 0 && <span className="rounded-full bg-red-500/15 px-3 py-1 text-sm font-black text-red-200">{item.discountPercent}% off</span>}
                </div>
                <div className="mt-6 flex gap-3">
                  <button onClick={(event) => add(event)} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-amber-300 px-5 py-3 font-black text-black"><ShoppingCart className="h-4 w-4" /> Add to cart</button>
                  <Link to={`/products/${item.id}`} className="flex items-center justify-center rounded-full border border-white/10 px-5 py-3 font-black text-white">Details</Link>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-white/45"><Sparkles className="h-4 w-4 text-amber-200" /> Authenticated by MarketX standards</div>
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
