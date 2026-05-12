import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ImagePlus, UploadCloud, X, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { createProduct } from '../../services/productService';
import { PRODUCT_CATEGORIES, splitList } from '../../utils/productUtils';

const initialForm = {
  title: '',
  description: '',
  category: PRODUCT_CATEGORIES[0],
  brand: '',
  price: '',
  discountPrice: '',
  stock: '',
  sizes: '',
  colors: '',
  tags: '',
  sku: '',
  deliveryTime: '',
  warrantyInfo: '',
  featured: false,
  status: 'active',
};

const inputClass = 'w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-text-light outline-none backdrop-blur focus:border-brand-yellow focus:ring-4 focus:ring-yellow-200/40 dark:border-white/10 dark:bg-gray-900/70 dark:text-white dark:focus:ring-yellow-400/10';

const ProductUploadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);

  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const addFiles = (incoming) => {
    const imageFiles = Array.from(incoming).filter((file) => file.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...imageFiles].slice(0, 8));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!files.length) {
      toast.error('Add at least one product image.');
      return;
    }
    setSubmitting(true);
    setUploadProgress(0);
    try {
      await createProduct({
        user,
        files,
        thumbnailIndex,
        onProgress: setUploadProgress,
        data: {
          ...form,
          sizes: splitList(form.sizes),
          colors: splitList(form.colors),
          tags: splitList(form.tags),
        },
      });
      toast.success('Product published successfully');
      navigate('/seller');
    } catch (error) {
      toast.error(error.message || 'Unable to publish product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light pt-28 pb-20 dark:bg-background-dark">
      <main className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-brand-red">Seller Studio</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-text-light dark:text-white md:text-5xl">Upload Product</h1>
            <p className="mt-2 max-w-2xl text-text-muted-light dark:text-text-muted-dark">
              Create marketplace-ready listings with optimized images, inventory, variants, and searchable metadata.
            </p>
          </div>
          <button onClick={() => navigate('/seller')} className="rounded-full bg-gray-100 px-5 py-3 text-sm font-black text-text-light transition hover:bg-gray-200 dark:bg-gray-800 dark:text-white">
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-5 sm:p-8">
            <h2 className="mb-6 text-xl font-black text-text-light dark:text-white">Product Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-2 block text-xs font-black uppercase text-text-muted-light dark:text-text-muted-dark">Product Name</span>
                <input className={inputClass} required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Premium noise cancelling headphones" />
              </label>
              <label>
                <span className="mb-2 block text-xs font-black uppercase text-text-muted-light dark:text-text-muted-dark">Category</span>
                <select className={inputClass} value={form.category} onChange={(e) => update('category', e.target.value)}>
                  {PRODUCT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-xs font-black uppercase text-text-muted-light dark:text-text-muted-dark">Brand</span>
                <input className={inputClass} required value={form.brand} onChange={(e) => update('brand', e.target.value)} placeholder="Sony" />
              </label>
              <label>
                <span className="mb-2 block text-xs font-black uppercase text-text-muted-light dark:text-text-muted-dark">Price</span>
                <input className={inputClass} required type="number" min="0" step="0.01" value={form.price} onChange={(e) => update('price', e.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-xs font-black uppercase text-text-muted-light dark:text-text-muted-dark">Discount Price</span>
                <input className={inputClass} type="number" min="0" step="0.01" value={form.discountPrice} onChange={(e) => update('discountPrice', e.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-xs font-black uppercase text-text-muted-light dark:text-text-muted-dark">Stock Quantity</span>
                <input className={inputClass} required type="number" min="0" value={form.stock} onChange={(e) => update('stock', e.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-xs font-black uppercase text-text-muted-light dark:text-text-muted-dark">SKU</span>
                <input className={inputClass} required value={form.sku} onChange={(e) => update('sku', e.target.value)} placeholder="SKU-2026-001" />
              </label>
              <label>
                <span className="mb-2 block text-xs font-black uppercase text-text-muted-light dark:text-text-muted-dark">Sizes</span>
                <input className={inputClass} value={form.sizes} onChange={(e) => update('sizes', e.target.value)} placeholder="S, M, L, XL" />
              </label>
              <label>
                <span className="mb-2 block text-xs font-black uppercase text-text-muted-light dark:text-text-muted-dark">Colors</span>
                <input className={inputClass} value={form.colors} onChange={(e) => update('colors', e.target.value)} placeholder="Black, White, Gold" />
              </label>
              <label>
                <span className="mb-2 block text-xs font-black uppercase text-text-muted-light dark:text-text-muted-dark">Delivery Time</span>
                <input className={inputClass} value={form.deliveryTime} onChange={(e) => update('deliveryTime', e.target.value)} placeholder="2-4 business days" />
              </label>
              <label>
                <span className="mb-2 block text-xs font-black uppercase text-text-muted-light dark:text-text-muted-dark">Warranty Info</span>
                <input className={inputClass} value={form.warrantyInfo} onChange={(e) => update('warrantyInfo', e.target.value)} placeholder="1 year manufacturer warranty" />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-xs font-black uppercase text-text-muted-light dark:text-text-muted-dark">Tags</span>
                <input className={inputClass} value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="wireless, premium, bestseller" />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-xs font-black uppercase text-text-muted-light dark:text-text-muted-dark">Product Description</span>
                <textarea className={`${inputClass} min-h-36 resize-none`} required value={form.description} onChange={(e) => update('description', e.target.value)} />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 p-4 text-sm font-bold dark:border-white/10 dark:bg-gray-900/60 dark:text-white">
                <input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} className="accent-brand-yellow" />
                Mark as featured
              </label>
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="space-y-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              className={`glass rounded-3xl p-6 text-center transition ${dragging ? 'ring-4 ring-brand-yellow/40' : ''}`}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-yellow/20 text-brand-red">
                <UploadCloud className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-black text-text-light dark:text-white">Product Images</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-text-muted-light dark:text-text-muted-dark">
                Drag and drop up to 8 images. Large images are compressed before Storage upload.
              </p>
              <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-text-light px-5 py-3 text-sm font-black text-white transition hover:scale-105 dark:bg-white dark:text-text-light">
                <ImagePlus className="h-4 w-4" />
                Choose Images
                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => addFiles(e.target.files)} />
              </label>
            </div>

            {previews.length > 0 && (
              <div className="glass rounded-3xl p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-black text-text-light dark:text-white">Preview</h3>
                  <span className="text-xs font-bold text-text-muted-light dark:text-text-muted-dark">{previews.length}/8</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {previews.map((preview, index) => (
                    <button type="button" key={preview.url} onClick={() => setThumbnailIndex(index)} className={`group relative aspect-square overflow-hidden rounded-2xl border-2 ${thumbnailIndex === index ? 'border-brand-yellow' : 'border-transparent'}`}>
                      <img src={preview.url} alt="Preview" className="h-full w-full object-cover" />
                      {thumbnailIndex === index && <CheckCircle2 className="absolute left-2 top-2 h-5 w-5 rounded-full bg-white text-emerald-500" />}
                      <span onClick={(e) => { e.stopPropagation(); setFiles((prev) => prev.filter((_, i) => i !== index)); }} className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100">
                        <X className="h-4 w-4" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {submitting && (
              <div className="glass rounded-3xl p-5">
                <div className="mb-2 flex justify-between text-sm font-black text-text-light dark:text-white">
                  <span>Uploading</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                  <div className="h-full rounded-full bg-brand-yellow transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <button disabled={submitting} className="w-full rounded-full bg-brand-yellow py-4 text-base font-black text-text-light shadow-xl shadow-yellow-400/20 transition hover:bg-yellow-300 disabled:opacity-60">
              {submitting ? 'Publishing Product...' : 'Publish Product'}
            </button>
          </motion.section>
        </form>
      </main>
    </div>
  );
};

export default ProductUploadPage;
