import { memo, useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Heart, ShoppingBag, Zap } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import { money, normalizeProduct } from '@/utils/productUtils';
import StarRating from '@/features/products/components/StarRating';
import LazyImage from '@/components/ui/LazyImage';

const ProductCard = memo(({ product, onQuickView }) => {
  const item = normalizeProduct(product);
  const navigate = useNavigate();
  
  const addItem = useCartStore((s) => s.addItem);
  const updateItem = useCartStore((s) => s.updateItem);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const isWishlisted = useCartStore((s) => s.isWishlisted);
  const cartItems = useCartStore((s) => s.cartItems);
  
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
      <article className="group relative flex h-full flex-col overflow-hidden bg-bg-primary rounded-none transition-all duration-700 hover:shadow-2xl hover:shadow-black/20">
        
        {/* Badges */}
        <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
          {item.discountPercent > 0 && (
            <span className="bg-color-gold text-bg-primary px-3 py-1 text-[9px] font-bold uppercase tracking-widest">
              {item.discountPercent}% Off
            </span>
          )}
          {item.featured && (
            <span className="bg-surface-primary text-text-primary px-3 py-1 text-[9px] font-bold uppercase tracking-widest border border-surface-border">
              Curated
            </span>
          )}
        </div>

        {/* Hover Action Buttons */}
        <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:translate-x-4 lg:transition-all lg:duration-300 lg:group-hover:opacity-100 lg:group-hover:translate-x-0">
          <button
            type="button"
            onClick={wishlist}
            className="grid h-10 w-10 place-items-center rounded-full bg-surface-primary/80 backdrop-blur-md text-text-primary hover:text-color-gold transition-colors border border-surface-border"
            aria-label="Wishlist"
          >
            <Heart size={16} className={wished ? 'fill-color-gold text-color-gold' : ''} />
          </button>
          <button
            type="button"
            onClick={openQuick}
            className="grid h-10 w-10 place-items-center rounded-full bg-surface-primary/80 backdrop-blur-md text-text-primary hover:text-color-gold transition-colors border border-surface-border"
            aria-label="Quick view"
          >
            <Eye size={16} />
          </button>
        </div>

        {/* Image Area with Parallax Effect */}
        <Link to={`/products/${item.id}`} className="relative block aspect-[3/4] overflow-hidden bg-surface-primary">
          <div className="absolute inset-0 transition-transform duration-1000 ease-out group-hover:scale-110">
            <LazyImage
              src={primaryImage}
              alt={item.title}
              width={400}
              height={533}
              containerClassName={`absolute inset-0 transition-opacity duration-700 ${altImage !== primaryImage ? 'group-hover:opacity-0' : ''}`}
              className="w-full h-full object-cover"
            />
            {altImage !== primaryImage && (
              <LazyImage
                src={altImage}
                alt=""
                width={400}
                height={533}
                containerClassName="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Subtle gradient overlay for text readability at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          
          {/* Add to Cart Overlay Button */}
          <div className="absolute inset-x-6 bottom-6 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            {qtyInCart > 0 ? (
               <div
               onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
               className="flex w-full items-center justify-between gap-1 rounded-none bg-surface-primary p-1 border border-surface-border shadow-2xl backdrop-blur-md"
             >
               <button
                 type="button"
                 disabled={adding}
                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateItem(cartEntry.id, qtyInCart - 1); }}
                 className="grid h-10 w-10 place-items-center text-text-primary hover:text-color-gold transition-colors"
               >
                 −
               </button>
               <span className="text-xs font-bold tracking-widest text-color-gold uppercase">
                 {qtyInCart} in Bag
               </span>
               <button
                 type="button"
                 disabled={adding || item.stock <= qtyInCart}
                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateItem(cartEntry.id, qtyInCart + 1); }}
                 className="grid h-10 w-10 place-items-center text-text-primary hover:text-color-gold transition-colors"
               >
                 +
               </button>
             </div>
            ) : (
              <button
                type="button"
                disabled={adding || item.stock <= 0}
                onClick={(event) => add(event)}
                className="w-full bg-text-primary text-bg-primary py-4 text-xs font-bold uppercase tracking-widest hover:bg-color-gold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag size={14} className={adding ? 'animate-bounce' : ''} />
                {item.stock <= 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>
            )}
          </div>
        </Link>

        {/* Product Details Section */}
        <div className="relative flex flex-col pt-6 pb-4 px-2">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted">
              {item.brand}
            </span>
            <StarRating rating={item.rating} count={item.reviewsCount} size="h-2.5 w-2.5" />
          </div>
          
          <Link to={`/products/${item.id}`} className="block mb-2">
            <h3 className="line-clamp-2 text-sm font-medium text-text-primary transition-colors group-hover:text-color-gold">
              {item.title}
            </h3>
          </Link>
          
          <div className="mt-auto flex items-end justify-between pt-4 border-t border-surface-border">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="text-base text-text-primary font-light">
                  {money(item.finalPrice)}
                </span>
                {item.discountPercent > 0 && (
                  <span className="text-xs text-text-muted line-through font-light">
                    {money(item.price)}
                  </span>
                )}
              </div>
            </div>
            
            <button
              type="button"
              onClick={(event) => add(event, true)}
              className="text-text-secondary hover:text-color-gold transition-colors"
              aria-label="Buy now"
            >
              <Zap size={16} />
            </button>
          </div>
        </div>
      </article>

      {/* Quick-view modal (CSS transitions only) */}
      {quickOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-bg-primary/90 p-4 backdrop-blur-md animate-[fadeIn_200ms_ease-out]"
          onClick={() => setQuickOpen(false)}
        >
          <div
            className="relative grid w-full max-w-4xl overflow-hidden rounded-none border border-surface-border bg-bg-primary shadow-2xl animate-[menuIn_300ms_cubic-bezier(0.22,1,0.36,1)] md:grid-cols-2"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" onClick={() => setQuickOpen(false)} className="absolute top-4 right-4 z-10 text-text-secondary hover:text-text-primary">✕</button>
            <div className="relative aspect-square h-full w-full bg-surface-primary">
              <LazyImage src={primaryImage} alt={item.title} width={800} height={800} containerClassName="absolute inset-0" className="object-cover w-full h-full" priority />
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-color-gold mb-3">
                {item.brand}
              </p>
              <h3 className="text-display text-3xl text-text-primary mb-4">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary mb-8">
                {item.description || 'A premium verified marketplace selection with protected checkout and priority delivery.'}
              </p>
              <div className="flex items-center gap-4 mb-10">
                <span className="text-2xl font-light text-text-primary">
                  {money(item.finalPrice)}
                </span>
                {item.discountPercent > 0 && (
                  <span className="text-xs bg-color-gold text-bg-primary px-2 py-1 font-bold uppercase tracking-widest">
                    {item.discountPercent}% Off
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={(event) => add(event)}
                  className="luxury-button w-full justify-center"
                >
                  Add to Bag
                </button>
                <Link
                  to={`/products/${item.id}`}
                  className="luxury-button-outline w-full justify-center text-center"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
