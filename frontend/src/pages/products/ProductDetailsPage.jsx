import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, ShieldCheck, Truck, RotateCcw, Zap, ChevronRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/products/ProductCard';
import StarRating from '../../components/products/StarRating';
import Reveal from '../../components/animations/Reveal';
import { getProductById, getRelatedProducts } from '../../services/productService';
import { addProductReview, getProductReviews } from '../../services/reviewService';
import { getInventoryLabel, money } from '../../utils/productUtils';

/* ───────── Premium Skeleton ───────── */
const DetailsSkeleton = () => (
  <div className="theme-page min-h-screen pt-28">
    <div className="mx-auto grid max-w-[1400px] gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-[80px_1fr]">
        <div className="order-2 flex gap-3 sm:order-1 sm:flex-col">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="theme-card h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
              <div className="shimmer h-full w-full" />
            </div>
          ))}
        </div>
        <div className="theme-card order-1 aspect-square overflow-hidden rounded-3xl sm:order-2">
          <div className="shimmer h-full w-full" />
        </div>
      </div>
      <div className="space-y-5">
        <div className="theme-card h-5 w-28 rounded-full"><div className="shimmer h-full w-full rounded-full" /></div>
        <div className="theme-card h-10 w-3/4 rounded-xl"><div className="shimmer h-full w-full rounded-xl" /></div>
        <div className="theme-card h-6 w-40 rounded-full"><div className="shimmer h-full w-full rounded-full" /></div>
        <div className="theme-card h-12 w-48 rounded-xl"><div className="shimmer h-full w-full rounded-xl" /></div>
        <div className="theme-card h-32 w-full rounded-2xl"><div className="shimmer h-full w-full rounded-2xl" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="theme-card h-14 rounded-full"><div className="shimmer h-full w-full rounded-full" /></div>
          <div className="theme-card h-14 rounded-full"><div className="shimmer h-full w-full rounded-full" /></div>
        </div>
      </div>
    </div>
  </div>
);

/* ───────── Main Component ───────── */
const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, toggleWishlist, isWishlisted } = useCart();
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
        setLoading(false);
        const recently = JSON.parse(localStorage.getItem('marketx_recently_viewed') || '[]').filter((pid) => pid !== item.id);
        localStorage.setItem('marketx_recently_viewed', JSON.stringify([item.id, ...recently].slice(0, 12)));
        // Load supplementary data in background — don't block product render
        try {
          const [reviewData, relatedData] = await Promise.all([getProductReviews(item.id), getRelatedProducts(item)]);
          if (!cancelled) {
            setReviews(reviewData);
            setRelated(relatedData);
          }
        } catch (supplementaryError) {
          console.warn('Could not load reviews/related:', supplementaryError.message);
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

  const submitReview = async (event) => {
    event.preventDefault();
    try {
      await addProductReview(product.id, user, reviewForm);
      setReviews(await getProductReviews(product.id));
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted');
    } catch (err) {
      toast.error(err.message || 'Could not submit review');
    }
  };

  if (loading) return <DetailsSkeleton />;

  if (error || !product) {
    return (
      <div className="theme-page flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="theme-text text-3xl font-black">{error || 'Product not found'}</h1>
        <p className="theme-muted mt-3 text-sm">The product you're looking for is unavailable.</p>
        <Link to="/products" className="mt-6 rounded-full bg-amber-300 px-6 py-3 font-black text-black transition hover:bg-amber-200">
          Browse Products
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.thumbnail].filter(Boolean);

  return (
    <div className="theme-page min-h-screen pt-28 pb-20">
      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Reveal>
          <nav className="theme-muted mb-6 flex flex-wrap items-center gap-1.5 text-sm font-medium">
            <Link to="/" className="transition hover:text-amber-700 dark:hover:text-amber-200">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/products" className="transition hover:text-amber-700 dark:hover:text-amber-200">Products</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="transition hover:text-amber-700 dark:hover:text-amber-200">{product.category}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="theme-text">{product.title}</span>
          </nav>
        </Reveal>

        {/* Product Grid */}
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Image Gallery */}
          <Reveal className="grid gap-4 sm:grid-cols-[80px_1fr]">
            <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:block sm:space-y-3 sm:overflow-visible no-scrollbar">
              {images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setSelectedImage(index)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition sm:h-24 sm:w-full ${
                    selectedImage === index
                      ? 'border-amber-400 shadow-[0_0_20px_rgba(245,197,82,0.2)]'
                      : 'border-[var(--color-border)] hover:border-amber-500/25'
                  }`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
            <div className="order-1 overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl sm:order-2">
              <AnimatePresence mode="wait">
                <motion.img
                  key={images[selectedImage]}
                  src={images[selectedImage] || product.thumbnail}
                  alt={product.title}
                  className="aspect-square w-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </div>
          </Reveal>

          {/* Product Info */}
          <Reveal delay={0.1} className="lg:sticky lg:top-28 lg:self-start">
            <div className="theme-card rounded-3xl p-6 sm:p-8">
              {/* Badges */}
              <div className="mb-4 flex flex-wrap gap-2">
                {product.featured && (
                  <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-black">Featured</span>
                )}
                {product.discountPercent > 0 && (
                  <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white">Flash Deal</span>
                )}
                <span className={`theme-card rounded-full px-3 py-1 text-xs font-black ${inventory.className}`}>
                  {inventory.label}
                </span>
              </div>

              {/* Brand */}
              <p className="text-sm font-black uppercase tracking-widest text-amber-700 dark:text-amber-200/80">{product.brand}</p>

              {/* Title */}
              <h1 className="theme-text mt-2 text-3xl font-black tracking-tight md:text-4xl">{product.title}</h1>

              {/* Rating + Seller */}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <StarRating rating={product.rating} count={product.reviewsCount} />
                <span className="text-sm font-bold text-emerald-400">Verified: {product.sellerName || 'MarketX Seller'}</span>
              </div>

              {/* Price */}
              <div className="mt-6 flex flex-wrap items-end gap-3">
                <span className="theme-text text-4xl font-black">{money(product.finalPrice || product.discountPrice || product.price)}</span>
                {product.discountPercent > 0 && (
                  <>
                    <span className="theme-soft text-xl font-bold line-through">{money(product.price)}</span>
                    <span className="rounded-full bg-red-500/15 px-3 py-1 text-sm font-black text-red-300">{product.discountPercent}% off</span>
                  </>
                )}
              </div>

              {/* Size Selector */}
              {product.sizes?.length > 0 && (
                <div className="mt-6">
                  <h3 className="theme-text mb-2 text-sm font-black">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`rounded-xl border px-4 py-2 text-sm font-black transition ${
                          selectedSize === size
                            ? 'border-amber-400 bg-amber-400 text-black'
                            : 'border-[var(--color-border)] text-[var(--color-text)] hover:border-amber-500/30'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors?.length > 0 && (
                <div className="mt-6">
                  <h3 className="theme-text mb-2 text-sm font-black">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                          selectedColor === color
                            ? 'border-amber-400 bg-amber-400/15 text-amber-800 dark:text-amber-200'
                            : 'border-[var(--color-border)] text-[var(--color-text)] hover:border-amber-500/30'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <div className="theme-card-strong flex items-center justify-between rounded-full px-3 py-2 sm:w-36">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 text-xl font-black text-white transition hover:text-amber-200">−</button>
                  <span className="theme-text font-black">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} className="px-3 text-xl font-black text-white transition hover:text-amber-200">+</button>
                </div>
                <button
                  disabled={product.stock <= 0 || adding}
                  onClick={() => handleAdd(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-amber-300 px-6 py-4 font-black text-black transition hover:bg-amber-200 hover:shadow-[0_0_30px_rgba(245,197,82,0.25)] disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  disabled={product.stock <= 0}
                  onClick={() => handleAdd(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-[#ead9c8] px-6 py-4 font-black text-[#2d2926] transition hover:scale-[1.02] disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  <Zap className="h-5 w-5" /> Buy Now
                </button>
              </div>

              {/* Wishlist + Share */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="theme-card flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black transition hover:border-amber-500/30"
                >
                  <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? 'fill-red-400 text-red-400' : ''}`} /> Wishlist
                </button>
                <button
                  onClick={share}
                  className="theme-card flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black transition hover:border-amber-500/30"
                >
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>

              {/* Trust badges */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  [Truck, product.deliveryTime || 'Fast delivery'],
                  [ShieldCheck, product.warrantyInfo || 'Warranty backed'],
                  [RotateCcw, 'Easy returns'],
                ].map(([Icon, text]) => (
                  <div key={text} className="theme-card rounded-2xl p-4 text-sm font-bold">
                    <Icon className="mb-2 h-5 w-5 text-amber-300" /> {text}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* Details + Reviews */}
        <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <Reveal className="theme-card rounded-3xl p-6 sm:p-8">
            <h2 className="theme-text text-2xl font-black">Product Details</h2>
            <p className="theme-muted mt-4 leading-8">{product.description || 'Premium verified marketplace selection with protected checkout and priority delivery.'}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ['SKU', product.sku],
                ['Category', product.category],
                ['Brand', product.brand],
                ['Stock', product.stock],
              ].map(([label, value]) => (
                <div key={label} className="theme-card-strong rounded-2xl p-4">
                  <p className="theme-soft text-xs font-black uppercase">{label}</p>
                  <p className="theme-text mt-1 font-black">{value || 'N/A'}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="theme-card rounded-3xl p-6 sm:p-8">
            <h2 className="theme-text text-2xl font-black">Reviews</h2>
            <div className="mt-4 space-y-4">
              {reviews.length === 0 && <p className="theme-soft text-sm">No reviews yet. Be the first to review.</p>}
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-[var(--color-border)] pb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="theme-text font-black">{review.userName}</p>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="theme-muted mt-2 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
            {user && (
              <form onSubmit={submitReview} className="mt-6 space-y-3">
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((p) => ({ ...p, rating: Number(e.target.value) }))}
                  className="theme-input w-full rounded-xl p-3"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>{r} stars</option>
                  ))}
                </select>
                <textarea
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                  placeholder="Write a review"
                  className="theme-input w-full resize-none rounded-xl p-3"
                />
                <button className="w-full rounded-full bg-amber-300 py-3 font-black text-black transition hover:bg-amber-200">
                  Submit Review
                </button>
              </form>
            )}
          </Reveal>
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <Reveal className="mt-12">
            <h2 className="theme-text mb-6 text-2xl font-black">Related Products</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {related.map((item) => <ProductCard key={item.id} product={item} />)}
            </div>
          </Reveal>
        )}
      </main>
    </div>
  );
};

export default ProductDetailsPage;
