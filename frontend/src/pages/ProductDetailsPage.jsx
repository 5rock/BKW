import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true); setError('');
    fetchProductById(id)
      .then((res) => { setProduct(res.data); setSelectedImage(0); })
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    await addItem(product.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setAdding(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <span className="material-symbols-outlined text-6xl text-gray-300">error_outline</span>
      <p className="text-gray-500">{error || 'Product not found'}</p>
      <Link to="/products" className="text-primary hover:underline">Browse Products</Link>
    </div>
  );

  return (
    <div className="bg-surface-container-lowest dark:bg-gray-950 min-h-screen">
      <main className="max-w-[1280px] mx-auto px-6 py-8">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-xs text-gray-500">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <Link to="/products" className="hover:text-primary">Products</Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-primary">{product.category}</Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="text-gray-900 dark:text-white line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Image Gallery */}
          <div className="lg:col-span-7 grid grid-cols-12 gap-4">
            <div className="col-span-2 space-y-4">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-primary' : 'border-surface-variant dark:border-gray-700'} hover:shadow-md`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="col-span-10">
              <div className="aspect-[4/5] bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-surface-variant dark:border-gray-700 overflow-hidden group">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              {product.badge && (
                <span className="bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">{product.badge}</span>
              )}
              {product.discount === 0 && (
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-semibold">FREE SHIPPING</span>
              )}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4 mt-3">
                <StarRating rating={product.rating} count={product.reviews} />
                <span className="text-outline text-sm">|</span>
                <span className="text-sm text-tertiary font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified</span>Verified Seller
                </span>
              </div>
            </div>

            {/* Pricing + Cart */}
            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-surface-variant dark:border-gray-700">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-4xl font-black text-gray-900 dark:text-white">${product.price.toLocaleString()}</span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-2xl text-gray-400 line-through">${product.originalPrice.toLocaleString()}</span>
                    <span className="text-secondary font-bold">(-{product.discount}%)</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-6">Price including taxes. Secure storage options available.</p>

              <div className="flex gap-4 mb-4">
                <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-l-lg">
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span className="px-4 font-bold text-gray-900 dark:text-white">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-r-lg">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={adding || added}
                  className="flex-1 bg-primary-container text-on-primary-container font-bold py-3 rounded-lg hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-80"
                >
                  {added ? (
                    <><span className="material-symbols-outlined text-lg">check_circle</span>Added!</>
                  ) : (
                    <><span className="material-symbols-outlined text-lg">shopping_cart</span>Add to Cart</>
                  )}
                </button>
              </div>
              <button onClick={() => navigate('/cart')} className="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all active:scale-[0.98]">
                Buy Now
              </button>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4">
                {[{ icon: 'verified', label: 'Authenticity', sub: 'Certified Pure' }, { icon: 'security', label: 'Secure Delivery', sub: 'Insured Shipping' }].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container dark:bg-gray-800 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock indicator */}
            {product.stock <= 10 && (
              <p className="text-secondary text-sm font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-base">warning</span>
                Only {product.stock} left in stock!
              </p>
            )}
          </div>
        </div>

        {/* Details & Specs */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-surface-variant dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Product Details</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{product.description}</p>
              {product.specs && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{k}</p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{v}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-surface-variant dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Customer Reviews</h3>
              {[
                { initials: 'JD', name: 'Jonathan D.', rating: 5, date: 'Oct 24, 2023', comment: '"The delivery was incredibly fast and secure. The packaging was top-notch, and the item looks even more impressive in person than it does in the photos."' },
                { initials: 'SM', name: 'Sarah M.', rating: 4, date: 'Sept 12, 2023', comment: '"Very reliable marketplace. The authentication process is world-class. Only wish the shipping was slightly cheaper for smaller orders."' },
              ].map((review) => (
                <div key={review.name} className="pb-6 mb-6 border-b border-gray-100 dark:border-gray-700 last:border-0 last:mb-0 last:pb-0">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-surface-container dark:bg-gray-700 flex items-center justify-center font-bold text-primary">{review.initials}</div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{review.name}</h4>
                      <StarRating rating={review.rating} size="text-sm" />
                    </div>
                    <span className="ml-auto text-xs text-gray-400">{review.date}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 italic">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Summary */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-surface-variant dark:border-gray-700">
              <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Ratings Summary</h4>
              <div className="text-center py-4">
                <span className="text-6xl font-black text-gray-900 dark:text-white">{product.rating}</span>
                <StarRating rating={product.rating} count={product.reviews} size="text-xl" />
              </div>
              <div className="space-y-3 mt-4">
                {[[5, 85], [4, 10], [3, 3], [2, 1], [1, 1]].map(([star, pct]) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-3 text-xs text-gray-500">{star}</span>
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-container rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-xs text-gray-400 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailsPage;
