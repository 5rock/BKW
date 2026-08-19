import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, ShieldCheck, Truck, RotateCcw, Zap, ChevronRight, Box, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import ProductCard from '@/features/products/components/ProductCard';
import Product3DViewer from '@/features/products/components/Product3DViewer';
import StarRating from '@/features/products/components/StarRating';
import { getProductById, getRelatedProducts } from '@/services/productService';
import { addProductReview, getProductReviews } from '@/services/reviewService';
import { getInventoryLabel, money } from '@/utils/productUtils';
import { Helmet } from 'react-helmet-async';

/* ───────── Minimal Skeleton ───────── */
const DetailsSkeleton = () => (
  <div className="min-h-screen bg-bg-primary pt-24 pb-20">
    <div className="luxury-shell grid lg:grid-cols-[1.5fr_1fr] gap-12">
      <div className="h-[70vh] bg-surface-primary border border-surface-border rounded-3xl overflow-hidden relative">
        <div className="shimmer h-full w-full" />
      </div>
      <div className="space-y-6 pt-12">
        <div className="h-4 w-32 bg-surface-primary rounded-full"><div className="shimmer h-full w-full rounded-full" /></div>
        <div className="h-12 w-3/4 bg-surface-primary rounded-xl"><div className="shimmer h-full w-full rounded-xl" /></div>
        <div className="h-8 w-40 bg-surface-primary rounded-full"><div className="shimmer h-full w-full rounded-full" /></div>
        <div className="h-32 w-full bg-surface-primary rounded-2xl"><div className="shimmer h-full w-full rounded-2xl" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-14 bg-surface-primary rounded-full"><div className="shimmer h-full w-full rounded-full" /></div>
          <div className="h-14 bg-surface-primary rounded-full"><div className="shimmer h-full w-full rounded-full" /></div>
        </div>
      </div>
    </div>
  </div>
);

/* ───────── Main Component ───────── */
const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { addItem, toggleWishlist, isWishlisted } = useCartStore();
  
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [adding, setAdding] = useState(false);
  const [viewMode, setViewMode] = useState('3d'); // Defaults to 3d if available

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const item = await getProductById(id);
        if (cancelled) return;
        setProduct(item);
        setSelectedImage(0);
        setQuantity(1);
        setViewMode(item.model3d?.enabled && item.model3d?.url ? '3d' : 'image');
        setLoading(false);
        
        const recently = JSON.parse(localStorage.getItem('marketx_recently_viewed') || '[]').filter((pid) => pid !== item.id);
        localStorage.setItem('marketx_recently_viewed', JSON.stringify([item.id, ...recently].slice(0, 12)));
        
        try {
          const [reviewData, relatedData] = await Promise.all([getProductReviews(item.id), getRelatedProducts(item)]);
          if (!cancelled) {
            setReviews(reviewData);
            setRelated(relatedData);
          }
        } catch (err) {
          console.warn('Could not load reviews/related:', err.message);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Product not found');
          setLoading(false);
        }
      }
    };
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { cancelled = true; };
  }, [id]);

  const inventory = useMemo(() => getInventoryLabel(product?.stock || 0), [product]);

  const handleAdd = async (buyNow = false) => {
    if (!product) return;
    setAdding(true);
    await addItem(product, quantity, { selectedSize, selectedColor });
    setAdding(false);
    if (buyNow) navigate('/cart');
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: product.title, url });
    else {
      await navigator.clipboard.writeText(url);
      toast.success('Product link copied');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const newReview = await addProductReview(id, reviewForm);
      setReviews(prev => [newReview, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Experience submitted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to submit experience');
    }
  };

  if (loading) return <DetailsSkeleton />;

  if (error || !product) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6 text-center pt-24">
        <h1 className="text-display text-4xl text-text-primary mb-4">{error || 'Product not found'}</h1>
        <p className="text-text-secondary">The exceptional piece you are looking for is currently unavailable.</p>
        <Link to="/products" className="luxury-button mt-8">
          Explore Collection
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.thumbnail].filter(Boolean);
  const has3D = product.model3d?.enabled && product.model3d?.url;

  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-24">
      <Helmet>
        <title>{`${product.title} - GoldMarket`}</title>
        <meta name="description" content={product.description?.substring(0, 160)} />
      </Helmet>

      <main className="luxury-shell">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-sans font-medium tracking-widest uppercase text-text-muted mb-8">
          <Link to="/" className="hover:text-color-gold transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/collections" className="hover:text-color-gold transition-colors">Collections</Link>
          <ChevronRight size={14} />
          <Link to={`/collections?category=${encodeURIComponent(product.category)}`} className="hover:text-color-gold transition-colors">{product.category}</Link>
          <ChevronRight size={14} />
          <span className="text-color-gold">{product.title}</span>
        </nav>

        {/* Cinematic Layout: Left Showroom, Right Details */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12 lg:gap-20 items-start">
          
          {/* Left: Interactive Showroom */}
          <div className="lg:sticky lg:top-32 w-full flex flex-col gap-6">
            <div className="relative w-full aspect-square lg:aspect-[4/3] rounded-[2rem] overflow-hidden bg-surface-primary border border-surface-border shadow-2xl flex items-center justify-center group">
              
              {/* View Toggle */}
              {has3D && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 p-1.5 rounded-full bg-bg-primary/80 backdrop-blur-md border border-surface-border shadow-lg">
                  <button 
                    onClick={() => setViewMode('3d')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === '3d' ? 'bg-text-primary text-bg-primary shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    <Box size={14} /> 3D View
                  </button>
                  <button 
                    onClick={() => setViewMode('image')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === 'image' ? 'bg-text-primary text-bg-primary shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    <ImageIcon size={14} /> Images
                  </button>
                </div>
              )}

              {/* Viewer */}
              {viewMode === '3d' && has3D ? (
                <Product3DViewer 
                  modelUrl={product.model3d.url} 
                  fallbackImage={images[0]} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={images[selectedImage]}
                    src={images[selectedImage] || product.thumbnail}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </AnimatePresence>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {viewMode === 'image' && images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === idx ? 'border-color-gold shadow-[0_0_15px_rgba(201,162,39,0.3)]' : 'border-surface-border opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Specification */}
          <div className="flex flex-col pt-4 lg:pt-12">
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-sans font-bold tracking-[0.2em] uppercase text-color-gold">
                {product.brand}
              </span>
              <div className="flex items-center gap-3">
                {product.featured && <span className="px-3 py-1 rounded-full border border-color-gold text-color-gold text-[10px] font-bold uppercase tracking-widest">Curated</span>}
              </div>
            </div>

            <h1 className="text-display text-4xl lg:text-5xl text-text-primary leading-tight mb-4">
              {product.title}
            </h1>

            <div className="flex items-center gap-6 mb-8">
              <StarRating rating={product.rating} count={product.reviewsCount} />
              <span className="text-xs text-text-secondary font-medium tracking-widest uppercase">Verified: {product.sellerName || 'MarketX'}</span>
            </div>

            <div className="flex items-end gap-4 mb-10">
              <span className="text-4xl text-text-primary font-sans font-light tracking-tight">
                {money(product.finalPrice || product.discountPrice || product.price)}
              </span>
              {product.discountPercent > 0 && (
                <>
                  <span className="text-xl text-text-muted line-through mb-1 font-light">{money(product.price)}</span>
                  <span className="text-xs text-bg-primary bg-color-gold px-2 py-1 rounded mb-2 font-bold uppercase tracking-widest">
                    {product.discountPercent}% Off
                  </span>
                </>
              )}
            </div>

            <p className="text-text-secondary text-sm leading-relaxed mb-10 pb-10 border-b border-surface-border">
              {product.description || 'An exceptional piece engineered with precision and crafted from the finest materials. Authenticated and securely delivered.'}
            </p>

            {/* Selectors */}
            {product.sizes?.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-text-primary uppercase tracking-widest font-bold">Select Size</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-full border text-xs font-bold tracking-widest uppercase transition-all duration-300 ${selectedSize === size ? 'border-text-primary bg-text-primary text-bg-primary' : 'border-surface-border text-text-secondary hover:border-text-primary hover:text-text-primary'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4 mt-4">
              
              <div className="flex gap-4">
                <div className="flex items-center justify-between border border-surface-border rounded-full px-4 py-2 w-32">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-text-secondary hover:text-color-gold p-2 text-lg transition-colors">−</button>
                  <span className="text-text-primary text-sm font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} className="text-text-secondary hover:text-color-gold p-2 text-lg transition-colors">+</button>
                </div>
                
                <button
                  disabled={product.stock <= 0 || adding}
                  onClick={() => handleAdd(false)}
                  className="luxury-button flex-1"
                >
                  {adding ? 'Adding...' : 'Add to Bag'}
                </button>
              </div>

              <button
                disabled={product.stock <= 0}
                onClick={() => handleAdd(true)}
                className="luxury-button-outline w-full flex justify-center items-center gap-2"
              >
                <Zap size={16} /> Purchase Instantly
              </button>

              <div className="flex justify-between items-center mt-4 text-xs font-bold tracking-widest uppercase">
                <span className={`${product.stock <= 5 ? 'text-red-400' : 'text-color-gold'}`}>
                   {inventory.label}
                </span>
                
                <div className="flex gap-4">
                  <button onClick={() => toggleWishlist(product.id)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
                    <Heart size={14} className={isWishlisted(product.id) ? 'fill-color-gold text-color-gold' : ''} />
                    Save
                  </button>
                  <button onClick={share} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
                    <Share2 size={14} />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-10 border-t border-surface-border">
              {[
                [Truck, product.deliveryTime || 'Insured Delivery'],
                [ShieldCheck, product.warrantyInfo || 'Authenticated'],
                [RotateCcw, 'Complimentary Returns'],
              ].map(([Icon, text], i) => (
                <div key={i} className="flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-surface-border flex items-center justify-center text-color-gold">
                    <Icon size={16} />
                  </div>
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold max-w-[80px]">{text}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Details & Reviews Sections */}
        <div className="mt-32 grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-20">
          
          {/* Description / Specs */}
          <div>
            <h2 className="text-display text-3xl text-text-primary mb-8 pb-4 border-b border-surface-border">Specifications</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                ['Reference', product.sku],
                ['Category', product.category],
                ['Brand', product.brand],
                ['Availability', `${product.stock} Units`],
              ].map(([label, value]) => (
                <div key={label} className="p-6 bg-surface-primary border border-surface-border rounded-2xl">
                  <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold mb-2">{label}</p>
                  <p className="text-sm text-text-primary font-medium tracking-wide">{value || 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-display text-3xl text-text-primary mb-8 pb-4 border-b border-surface-border">Client Reviews</h2>
            
            <div className="space-y-8 mb-10">
              {reviews.length === 0 && <p className="text-sm text-text-secondary">No reviews yet for this piece.</p>}
              {reviews.map((review) => (
                <div key={review.id} className="pb-6 border-b border-surface-border last:border-0">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-text-primary tracking-wide">{review.userName}</p>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>

            {user && (
              <div className="bg-surface-primary border border-surface-border p-6 rounded-3xl">
                <h3 className="text-xs font-bold tracking-widest uppercase text-text-primary mb-6">Leave a Review</h3>
                <form onSubmit={submitReview} className="space-y-4">
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm((p) => ({ ...p, rating: Number(e.target.value) }))}
                    className="w-full bg-bg-primary border border-surface-border rounded-xl p-4 text-sm text-text-primary focus:border-color-gold outline-none appearance-none"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} Stars - {r === 5 ? 'Exceptional' : 'Standard'}</option>
                    ))}
                  </select>
                  <textarea
                    required
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                    placeholder="Share your experience..."
                    className="w-full bg-bg-primary border border-surface-border rounded-xl p-4 text-sm text-text-primary focus:border-color-gold outline-none resize-none min-h-[120px]"
                  />
                  <button type="submit" className="luxury-button w-full">
                    Submit Experience
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};

export default ProductDetailsPage;
