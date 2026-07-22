import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PackagePlus from 'lucide-react/dist/esm/icons/package-plus';
import Star from 'lucide-react/dist/esm/icons/star';
import Boxes from 'lucide-react/dist/esm/icons/boxes';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { deleteProduct, getProducts } from '@/services/productService';
import { money } from '@/utils/productUtils';

const SellerDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getProducts({ sellerId: user?.uid, status: 'all', limit: 100, sort: 'latest' });
      setProducts(result.products);
    } catch {
      toast.error('Failed to load seller products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) load();
  }, [user?.uid]);

  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await deleteProduct(id);
    setProducts((prev) => prev.filter((product) => product.id !== id));
    toast.success('Product deleted');
  };

  const stats = [
    { label: 'Products', value: products.length, icon: Boxes },
    { label: 'Low Stock', value: products.filter((p) => p.stock <= 5).length, icon: AlertTriangle },
    { label: 'Avg Rating', value: products.length ? (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1) : '0.0', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background-light pt-28 pb-20 dark:bg-background-dark">
      <main className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-brand-red">Seller Command Center</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-text-light dark:text-white md:text-5xl">Product Management</h1>
            <p className="mt-2 text-text-muted-light dark:text-text-muted-dark">Welcome back, {user?.name}. Manage listings, inventory, and marketplace visibility.</p>
          </div>
          <Link to="/seller/products/new" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-6 py-4 font-black text-text-light shadow-xl shadow-yellow-400/20 transition hover:scale-105">
            <PackagePlus className="h-5 w-5" /> Add Product
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
              <Icon className="mb-4 h-8 w-8 text-brand-red" />
              <p className="text-3xl font-black text-text-light dark:text-white">{value}</p>
              <p className="text-sm font-bold text-text-muted-light dark:text-text-muted-dark">{label}</p>
            </motion.div>
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-800">
            <h2 className="text-xl font-black text-text-light dark:text-white">My Products</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-text-muted-light dark:bg-gray-800 dark:text-text-muted-dark">{products.length} listings</span>
          </div>

          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center">
              <h3 className="text-2xl font-black text-text-light dark:text-white">No products yet</h3>
              <p className="mt-2 text-text-muted-light dark:text-text-muted-dark">Upload your first product and start selling.</p>
              <Link to="/seller/products/new" className="mt-6 inline-flex rounded-full bg-brand-yellow px-6 py-3 font-black text-text-light">Upload Product</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="bg-gray-50 text-left text-xs font-black uppercase tracking-wider text-text-muted-light dark:bg-gray-800 dark:text-text-muted-dark">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={product.thumbnail || product.images[0]} alt={product.title} className="h-14 w-14 rounded-2xl object-cover" />
                          <div>
                            <p className="line-clamp-1 max-w-xs font-black text-text-light dark:text-white">{product.title}</p>
                            <p className="text-xs font-bold text-text-muted-light dark:text-text-muted-dark">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-text-muted-light dark:text-text-muted-dark">{product.category}</td>
                      <td className="px-6 py-4 font-black text-text-light dark:text-white">{money(product.finalPrice)}</td>
                      <td className={`px-6 py-4 font-black ${product.stock <= 5 ? 'text-red-500' : 'text-emerald-500'}`}>{product.stock}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600 dark:bg-emerald-950/30">{product.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link to={`/products/${product.id}`} className="rounded-full bg-gray-100 p-2 text-text-light hover:bg-brand-yellow dark:bg-gray-800 dark:text-white">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <button onClick={() => remove(product.id)} className="rounded-full bg-red-50 p-2 text-brand-red hover:bg-red-100 dark:bg-red-950/30">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;
