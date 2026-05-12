import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Share2, ShieldCheck, Truck, RotateCcw, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/products/ProductCard';
import StarRating from '../../components/products/StarRating';
import { getProductById, getRelatedProducts } from '../../services/productService';
import { addProductReview, getProductReviews } from '../../services/reviewService';
import { getInventoryLabel, money } from '../../utils/productUtils';

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
        const recently = JSON.parse(localStorage.getItem('marketx_recently_viewed') || '[]').filter((productId) => productId !== item.id);
        localStorage.setItem('marketx_recently_viewed', JSON.stringify([item.id, ...recently].slice(0, 12)));
        const [reviewData, relatedData] = await Promise.all([getProductReviews(item.id), getRelatedProducts(item)]);
        if (!cancelled) {
          setReviews(reviewData);
          setRelated(relatedData);
        }
      } catch (err) {
        setError(err.message || 'Product not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const inventory = useMemo(() => getInventoryLabel(product?.stock || 0), [product]);

  const handleAdd = async (buyNow = false) => {
    if (!product) return;
    await addItem(product, quantity, { selectedSize, selectedColor });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light pt-28 dark:bg-background-dark">
        <div className="mx-auto grid max-w-[1300px] gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="aspect-square animate-pulse rounded-3xl bg-gray-100 dark:bg-gray-800" />
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background-light px-6 text-center dark:bg-background-dark">
        <h1 className="text-3xl font-black text-text-light dark:text-white">{error || 'Product not found'}</h1>
        <Link to="/products" className="mt-6 rounded-full bg-brand-yellow px-6 py-3 font-black text-text-light">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light pt-28 pb-20 dark:bg-background-dark">
      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-text-muted-light dark:text-text-muted-dark">
          <Link to="/">Home</Link><span>/</span><Link to="/products">Products</Link><span>/</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link><span>/</span>
          <span className="text-text-light dark:text-white">{product.title}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-4 sm:grid-cols-[96px_1fr]">
            <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:block sm:space-y-3 sm:overflow-visible">
              {product.images.map((image, index) => (
                <button key={image} onClick={() => setSelectedImage(index)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-white sm:h-24 sm:w-24 ${selectedImage === index ? 'border-brand-yellow' : 'border-transparent'}`}>
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <motion.div layout className="order-1 aspect-square overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/10 dark:bg-gray-900 sm:order-2">
              <img src={product.images[selectedImage] || product.thumbnail} alt={product.title} className="h-full w-full object-cover" />
            </motion.div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <div className="mb-4 flex flex-wrap gap-2">
                {product.featured && <span className="rounded-full bg-brand-yellow px-3 py-1 text-xs font-black text-text-light">Featured</span>}
                {product.discountPercent > 0 && <span className="rounded-full bg-brand-red px-3 py-1 text-xs font-black text-white">Flash Deal</span>}
                <span className={`rounded-full bg-white px-3 py-1 text-xs font-black dark:bg-gray-800 ${inventory.className}`}>{inventory.label}</span>
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark">{product.brand}</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-text-light dark:text-white md:text-5xl">{product.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <StarRating rating={product.rating} count={product.reviewsCount} />
                <span className="text-sm font-bold text-emerald-500">Verified seller: {product.sellerName}</span>
              </div>

              <div className="mt-6 flex flex-wrap items-end gap-3">
                <span className="text-4xl font-black text-text-light dark:text-white">{money(product.finalPrice)}</span>
                {product.discountPercent > 0 && <span className="text-xl font-bold text-gray-400 line-through">{money(product.price)}</span>}
                {product.discountPercent > 0 && <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-black text-brand-red dark:bg-red-950/30">{product.discountPercent}% off</span>}
              </div>

              {product.sizes.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-black text-text-light dark:text-white">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => <button key={size} onClick={() => setSelectedSize(size)} className={`rounded-xl border px-4 py-2 text-sm font-black ${selectedSize === size ? 'border-brand-yellow bg-brand-yellow text-text-light' : 'border-gray-200 dark:border-gray-700 dark:text-white'}`}>{size}</button>)}
                  </div>
                </div>
              )}

              {product.colors.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-black text-text-light dark:text-white">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => <button key={color} onClick={() => setSelectedColor(color)} className={`rounded-full border px-4 py-2 text-sm font-black ${selectedColor === color ? 'border-brand-red bg-brand-red text-white' : 'border-gray-200 dark:border-gray-700 dark:text-white'}`}>{color}</button>)}
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <div className="flex w-full items-center justify-between rounded-full border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900 sm:w-36">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 text-xl font-black dark:text-white">-</button>
                  <span className="font-black dark:text-white">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} className="px-3 text-xl font-black dark:text-white">+</button>
                </div>
                <button disabled={product.stock <= 0} onClick={() => handleAdd(false)} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-yellow px-6 py-4 font-black text-text-light transition hover:bg-yellow-300 disabled:opacity-50">
                  Add to Cart
                </button>
                <button disabled={product.stock <= 0} onClick={() => handleAdd(true)} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-text-light px-6 py-4 font-black text-white transition hover:scale-[1.02] disabled:opacity-50 dark:bg-white dark:text-text-light">
                  <Zap className="h-5 w-5" /> Buy Now
                </button>
              </div>

              <div className="mt-4 flex gap-3">
                <button onClick={() => toggleWishlist(product.id)} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-text-light dark:bg-gray-800 dark:text-white">
                  <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? 'fill-brand-red text-brand-red' : ''}`} /> Wishlist
                </button>
                <button onClick={share} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-text-light dark:bg-gray-800 dark:text-white">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  [Truck, product.deliveryTime || 'Fast delivery'],
                  [ShieldCheck, product.warrantyInfo || 'Warranty backed'],
                  [RotateCcw, 'Easy returns'],
                ].map(([Icon, text]) => (
                  <div key={text} className="rounded-2xl bg-white/70 p-4 text-sm font-bold text-text-light dark:bg-gray-800/70 dark:text-white">
                    <Icon className="mb-2 h-5 w-5 text-brand-red" /> {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:p-8">
            <h2 className="text-2xl font-black text-text-light dark:text-white">Product Details</h2>
            <p className="mt-4 leading-8 text-text-muted-light dark:text-text-muted-dark">{product.description}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ['SKU', product.sku],
                ['Category', product.category],
                ['Brand', product.brand],
                ['Stock', product.stock],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-black uppercase text-text-muted-light dark:text-text-muted-dark">{label}</p>
                  <p className="mt-1 font-black text-text-light dark:text-white">{value || 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:p-8">
            <h2 className="text-2xl font-black text-text-light dark:text-white">Reviews</h2>
            <div className="mt-4 space-y-4">
              {reviews.length === 0 && <p className="text-sm text-text-muted-light dark:text-text-muted-dark">No reviews yet.</p>}
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-text-light dark:text-white">{review.userName}</p>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">{review.comment}</p>
                </div>
              ))}
            </div>
            {user && (
              <form onSubmit={submitReview} className="mt-6 space-y-3">
                <select value={reviewForm.rating} onChange={(e) => setReviewForm((p) => ({ ...p, rating: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                  {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
                </select>
                <textarea required value={reviewForm.comment} onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} placeholder="Write a review" className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                <button className="w-full rounded-full bg-brand-yellow py-3 font-black text-text-light">Submit Review</button>
              </form>
            )}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-2xl font-black text-text-light dark:text-white">Related Products</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {related.map((item) => <ProductCard key={item.id} product={item} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ProductDetailsPage;
