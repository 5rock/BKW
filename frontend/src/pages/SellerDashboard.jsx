import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchProducts, createProduct, deleteProduct } from '../services/api';

const EMPTY_FORM = {
  name: '', category: 'Fine Jewelry', price: '', originalPrice: '',
  discount: 0, badge: '', stock: '', description: '',
  images: [''], specs: {},
};

const CATEGORIES = ['Fine Jewelry', 'Watches', 'Investment', 'Electronics', 'Audio', 'Photography', 'Computing'];

const SellerDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchProducts();
      setProducts(res.data.products.filter((p) => p.sellerId === user?.id));
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      await createProduct({
        ...form,
        price: parseFloat(form.price),
        originalPrice: parseFloat(form.originalPrice || form.price),
        stock: parseInt(form.stock),
        discount: parseInt(form.discount) || 0,
        images: form.images.filter(Boolean),
      });
      setSuccess('Product created successfully!');
      setShowForm(false);
      setForm(EMPTY_FORM);
      setTimeout(() => setSuccess(''), 3000);
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSuccess('Product deleted.');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Failed to delete product');
    }
  };


  return (
    <div className="bg-surface-container-lowest dark:bg-gray-950 min-h-screen">
      <main className="max-w-[1280px] mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Seller Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, <strong>{user?.name}</strong> 👋</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary-container text-on-primary-container font-semibold px-6 py-3 rounded-xl hover:shadow-md active:scale-95 transition-all text-sm"
          >
            <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
            {showForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {/* Alerts */}
        {success && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>{success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>{error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { icon: 'inventory_2', label: 'Total Products', value: products.length, color: 'bg-primary-container/20 text-primary' },
            { icon: 'reviews', label: 'Total Reviews', value: products.reduce((s, p) => s + (p.reviews || 0), 0).toLocaleString(), color: 'bg-primary-container/20 text-primary' },
            { icon: 'star', label: 'Avg Rating', value: products.length ? (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1) : '—', color: 'bg-primary-container/20 text-primary' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mb-4`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Add Product Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Add New Product</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 block mb-1">Product Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. 18K Gold Ring"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-container dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Category *</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none dark:text-white">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Stock *</label>
                <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required placeholder="e.g. 10"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-container dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Price ($) *</label>
                <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required placeholder="e.g. 1250.00"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-container dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Original Price ($)</label>
                <input name="originalPrice" type="number" min="0" step="0.01" value={form.originalPrice} onChange={handleChange} placeholder="Leave blank if no discount"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-container dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Badge (optional)</label>
                <input name="badge" value={form.badge} onChange={handleChange} placeholder="e.g. Sale, New, Bestseller"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Discount %</label>
                <input name="discount" type="number" min="0" max="100" value={form.discount} onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none dark:text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 block mb-1">Image URL *</label>
                <input value={form.images[0]} onChange={(e) => setForm((p) => ({ ...p, images: [e.target.value] }))} required placeholder="https://..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-container dark:text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 block mb-1">Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} required rows={3} placeholder="Describe your product..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-container dark:text-white resize-none" />
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button type="submit" disabled={submitting}
                  className="bg-primary-container text-on-primary-container font-bold px-8 py-3 rounded-xl hover:shadow-md active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70">
                  {submitting ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Creating...</> : <>
                    <span className="material-symbols-outlined">add_circle</span>Create Product</>}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 font-medium text-sm px-4">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Products ({products.length})</h2>
          </div>

          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 block mb-3">inventory_2</span>
              <p className="text-gray-500">You haven't added any products yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                          <span className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1 max-w-[160px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-primary-container/20 text-primary text-xs font-semibold px-2 py-1 rounded-full">{p.category}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white text-sm">${p.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${p.stock <= 5 ? 'text-secondary' : 'text-gray-900 dark:text-white'}`}>{p.stock}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined icon-filled text-primary-container text-sm">star</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{p.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-secondary hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors" title="Delete">
                            <span className="material-symbols-outlined text-base">delete</span>
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
