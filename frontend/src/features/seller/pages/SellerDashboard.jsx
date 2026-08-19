import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackagePlus, Star, Boxes, AlertTriangle, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { deleteProduct, getProducts } from '@/services/productService';
import { money } from '@/utils/productUtils';
import { Helmet } from 'react-helmet-async';

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
    if (!window.confirm('Delete this piece from your catalog?')) return;
    await deleteProduct(id);
    setProducts((prev) => prev.filter((product) => product.id !== id));
    toast.success('Piece removed from catalog');
  };

  const stats = [
    { label: 'Total Pieces', value: products.length, icon: Boxes },
    { label: 'Low Inventory', value: products.filter((p) => p.stock <= 5).length, icon: AlertTriangle },
    { label: 'Avg Rating', value: products.length ? (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1) : '0.0', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-24">
      <Helmet>
        <title>Seller Control Center - GoldMarket</title>
      </Helmet>

      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end border-b border-surface-border pb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-color-gold mb-3">Artisan Command Center</p>
            <h1 className="text-display text-4xl text-text-primary tracking-tight">Catalog Management</h1>
            <p className="mt-4 text-sm text-text-secondary">Welcome back, {user?.name}. Oversee your exclusive pieces and marketplace presence.</p>
          </div>
          <Link to="/seller/products/new" className="luxury-button flex items-center gap-2">
            <PackagePlus size={18} /> Offer New Piece
          </Link>
        </div>

        <div className="mb-12 grid gap-6 sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-surface-primary border border-surface-border rounded-3xl p-8 transition-transform hover:-translate-y-1 duration-500">
              <Icon size={24} className="mb-6 text-color-gold" />
              <p className="text-display text-4xl text-text-primary mb-2">{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{label}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-surface-border bg-surface-primary shadow-2xl">
          <div className="flex items-center justify-between border-b border-surface-border p-6 lg:p-8">
            <h2 className="text-display text-2xl text-text-primary">Curated Pieces</h2>
            <span className="rounded-full border border-surface-border bg-bg-primary px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-text-secondary">{products.length} listed</span>
          </div>

          {loading ? (
            <div className="space-y-4 p-6 lg:p-8">
              {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-bg-primary" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="p-20 text-center">
              <h3 className="text-display text-3xl text-text-primary mb-4">No pieces offered yet</h3>
              <p className="text-text-secondary max-w-sm mx-auto mb-10">Upload your first exclusive piece to begin showcasing your craftsmanship to our clientele.</p>
              <Link to="/seller/products/new" className="luxury-button">Offer New Piece</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="bg-bg-primary text-left text-[10px] font-bold uppercase tracking-widest text-text-muted border-b border-surface-border">
                  <tr>
                    <th className="px-8 py-6">Piece</th>
                    <th className="px-6 py-6">Classification</th>
                    <th className="px-6 py-6">Value</th>
                    <th className="px-6 py-6">Inventory</th>
                    <th className="px-6 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {products.map((product) => (
                    <tr key={product.id} className="transition-colors hover:bg-bg-primary">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-xl bg-bg-primary border border-surface-border overflow-hidden shrink-0">
                             <img src={product.thumbnail || product.images[0]} alt={product.title} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="line-clamp-1 max-w-[200px] text-sm font-bold text-text-primary mb-1">{product.title}</p>
                            <p className="text-[10px] uppercase tracking-widest text-text-muted">Ref: {product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-[10px] uppercase tracking-widest font-bold text-text-secondary">{product.category}</td>
                      <td className="px-6 py-6 font-light text-text-primary">{money(product.finalPrice)}</td>
                      <td className={`px-6 py-6 text-sm font-bold ${product.stock <= 5 ? 'text-red-400' : 'text-text-primary'}`}>{product.stock}</td>
                      <td className="px-6 py-6">
                        <span className="rounded-full border border-surface-border bg-bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-text-secondary">{product.status}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link to={`/products/${product.id}`} className="rounded-full bg-bg-primary border border-surface-border p-2 text-text-secondary hover:text-color-gold transition-colors">
                            <ExternalLink size={16} />
                          </Link>
                          <button type="button" onClick={() => remove(product.id)} className="rounded-full bg-bg-primary border border-surface-border p-2 text-text-secondary hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
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
