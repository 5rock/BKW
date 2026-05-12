import { useEffect, useState } from 'react';
import ProductCard from '../../components/products/ProductCard';
import { PageSectionSkeleton } from '../../components/ui/LoadingSkeleton';
import { useCart } from '../../context/CartContext';
import { getProductById } from '../../services/productService';

const WishlistPage = () => {
  const { wishlistIds } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const items = await Promise.all(wishlistIds.map((id) => getProductById(id).catch(() => null)));
      setProducts(items.filter(Boolean));
      setLoading(false);
    };
    load();
  }, [wishlistIds]);

  return (
    <div className="min-h-screen bg-background-light pt-28 pb-20 dark:bg-background-dark">
      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-brand-red">Saved Products</p>
          <h1 className="mt-2 text-3xl font-black text-text-light dark:text-white md:text-5xl">Wishlist</h1>
        </div>
        {loading ? (
          <PageSectionSkeleton rows={8} />
        ) : products.length ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-100 bg-white p-16 text-center dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-2xl font-black text-text-light dark:text-white">No wishlist items yet</h2>
            <p className="mt-2 text-text-muted-light dark:text-text-muted-dark">Tap the heart on products to save them here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WishlistPage;
