import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, UploadCloud, X, CheckCircle2, Box, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { createProduct, uploadProductImage, uploadProductModel } from '@/services/productService';
import { PRODUCT_CATEGORIES, splitList } from '@/utils/productUtils';
import { Helmet } from 'react-helmet-async';

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

const inputClass = "w-full bg-surface-primary border border-surface-border rounded-xl px-4 py-3 text-sm font-medium text-text-primary outline-none focus:border-color-gold transition-colors placeholder:text-text-muted";

const ProductUploadPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [modelFile, setModelFile] = useState(null);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [draggingModel, setDraggingModel] = useState(false);

  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  
  const addFiles = (incoming) => {
    const imageFiles = Array.from(incoming).filter((file) => file.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...imageFiles].slice(0, 8));
  };

  const addModel = (incoming) => {
    const file = Array.from(incoming).find((f) => f.name.endsWith('.glb') || f.name.endsWith('.gltf'));
    if (file) {
       setModelFile(file);
    } else {
       toast.error("Please provide a valid .glb or .gltf file");
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!files.length) {
      toast.error('Add at least one product image.');
      return;
    }
    setSubmitting(true);
    setUploadProgress(10);
    try {
      
      // 1. Upload Images
      const uploadedImageUrls = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadProductImage(files[i], user.uid);
        uploadedImageUrls.push(url);
        setUploadProgress(10 + (40 * ((i + 1) / files.length)));
      }
      
      // Ensure thumbnail is first
      if (thumbnailIndex > 0 && thumbnailIndex < uploadedImageUrls.length) {
        const thumb = uploadedImageUrls.splice(thumbnailIndex, 1)[0];
        uploadedImageUrls.unshift(thumb);
      }

      // 2. Upload Model
      let modelData = { enabled: false };
      if (modelFile) {
         setUploadProgress(70);
         const modelUrl = await uploadProductModel(modelFile, user.uid);
         modelData = {
           enabled: true,
           url: modelUrl,
           format: modelFile.name.endsWith('.glb') ? 'glb' : 'gltf',
           sizeBytes: modelFile.size
         };
         setUploadProgress(90);
      }

      // 3. Create Product
      await createProduct({
        user,
        data: {
          ...form,
          images: uploadedImageUrls,
          model3d: modelData,
          sizes: splitList(form.sizes),
          colors: splitList(form.colors),
          tags: splitList(form.tags),
        },
      });
      
      setUploadProgress(100);
      toast.success('Piece added to catalog');
      navigate('/seller');
    } catch (error) {
      toast.error(error.message || 'Unable to publish product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-24">
      <Helmet>
        <title>Offer New Piece - GoldMarket</title>
      </Helmet>
      
      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-surface-border pb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-color-gold mb-3">Artisan Studio</p>
            <h1 className="text-display text-4xl text-text-primary tracking-tight">Offer New Piece</h1>
            <p className="mt-4 max-w-2xl text-sm text-text-secondary">
              Curate your latest creation. Ensure high-fidelity imagery and provide a 3D model to offer clients the ultimate showroom experience.
            </p>
          </div>
          <button type="button" onClick={() => navigate('/seller')} className="text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-color-gold transition-colors">
            Discard & Return
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-12 lg:grid-cols-[1fr_400px]">
          
          <div className="space-y-12">
             <section className="bg-surface-primary border border-surface-border rounded-3xl p-8">
               <h2 className="mb-8 text-sm font-bold uppercase tracking-widest text-text-primary border-b border-surface-border pb-4">Piece Specifics</h2>
               <div className="grid gap-6 md:grid-cols-2">
                 <label className="md:col-span-2">
                   <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-secondary">Piece Name</span>
                   <input className={inputClass} required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="E.g. Royal Oak Chronograph" />
                 </label>
                 <label>
                   <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-secondary">Category</span>
                   <select className={inputClass} value={form.category} onChange={(e) => update('category', e.target.value)}>
                     {PRODUCT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                   </select>
                 </label>
                 <label>
                   <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-secondary">Atelier / Brand</span>
                   <input className={inputClass} required value={form.brand} onChange={(e) => update('brand', e.target.value)} placeholder="Audemars Piguet" />
                 </label>
                 <label>
                   <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-secondary">Value (USD)</span>
                   <input className={inputClass} required type="number" min="0" step="0.01" value={form.price} onChange={(e) => update('price', e.target.value)} />
                 </label>
                 <label>
                   <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-secondary">Discounted Value</span>
                   <input className={inputClass} type="number" min="0" step="0.01" value={form.discountPrice} onChange={(e) => update('discountPrice', e.target.value)} />
                 </label>
                 <label>
                   <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-secondary">Inventory Count</span>
                   <input className={inputClass} required type="number" min="0" value={form.stock} onChange={(e) => update('stock', e.target.value)} />
                 </label>
                 <label>
                   <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-secondary">Reference / SKU</span>
                   <input className={inputClass} required value={form.sku} onChange={(e) => update('sku', e.target.value)} placeholder="REF-26331ST" />
                 </label>
                 <label>
                   <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-secondary">Available Sizes</span>
                   <input className={inputClass} value={form.sizes} onChange={(e) => update('sizes', e.target.value)} placeholder="41mm" />
                 </label>
                 <label>
                   <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-secondary">Materials / Colors</span>
                   <input className={inputClass} value={form.colors} onChange={(e) => update('colors', e.target.value)} placeholder="Steel, Rose Gold" />
                 </label>
                 <label className="md:col-span-2">
                   <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-secondary">Tags</span>
                   <input className={inputClass} value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="automatic, chronograph, luxury" />
                 </label>
                 <label className="md:col-span-2">
                   <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-secondary">Editorial Description</span>
                   <textarea className={`${inputClass} min-h-[160px] resize-none`} required value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the heritage, craftsmanship, and details..." />
                 </label>
                 
                 <label className="flex items-center gap-4 rounded-xl border border-surface-border bg-bg-primary p-4 md:col-span-2">
                   <input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} className="accent-color-gold w-4 h-4" />
                   <span className="text-sm font-bold text-text-primary">Feature in Curated Selection</span>
                 </label>
               </div>
             </section>
          </div>

          <div className="space-y-8">
            <section
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              className={`bg-surface-primary border rounded-3xl p-8 text-center transition-colors duration-300 ${dragging ? 'border-color-gold bg-color-gold/5' : 'border-surface-border'}`}
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-bg-primary border border-surface-border text-color-gold">
                <UploadCloud size={24} />
              </div>
              <h2 className="text-lg font-medium text-text-primary mb-2">Visual Assets</h2>
              <p className="text-xs text-text-secondary mb-6">Drag up to 8 high-fidelity images.</p>
              
              <label className="luxury-button inline-flex cursor-pointer text-xs py-3 px-6">
                <ImagePlus size={16} className="mr-2" />
                Select Images
                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => addFiles(e.target.files)} />
              </label>
            </section>

            {previews.length > 0 && (
              <section className="bg-surface-primary border border-surface-border rounded-3xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-primary">Image Sequence</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{previews.length}/8</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {previews.map((preview, index) => (
                    <button type="button" key={preview.url} onClick={() => setThumbnailIndex(index)} className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-colors ${thumbnailIndex === index ? 'border-color-gold' : 'border-transparent'}`}>
                      <img src={preview.url} alt="Preview" className="h-full w-full object-cover" />
                      {thumbnailIndex === index && <CheckCircle2 size={16} className="absolute left-2 top-2 bg-bg-primary rounded-full text-color-gold" />}
                      <button type="button" aria-label="Remove image" onClick={(e) => { e.stopPropagation(); setFiles((prev) => prev.filter((_, i) => i !== index)); }} className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100">
                        <X size={12} />
                      </button>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-text-muted uppercase tracking-widest mt-4">Select an image to set as thumbnail.</p>
              </section>
            )}

            {/* 3D Model Upload Section */}
            <section
              onDragOver={(e) => { e.preventDefault(); setDraggingModel(true); }}
              onDragLeave={() => setDraggingModel(false)}
              onDrop={(e) => { e.preventDefault(); setDraggingModel(false); addModel(e.dataTransfer.files); }}
              className={`bg-surface-primary border rounded-3xl p-8 transition-colors duration-300 ${draggingModel ? 'border-color-gold bg-color-gold/5' : 'border-surface-border'}`}
            >
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 rounded-full bg-bg-primary border border-surface-border flex items-center justify-center text-color-gold shrink-0">
                    <Box size={18} />
                 </div>
                 <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">3D Showroom Asset</h2>
                    <p className="text-[10px] uppercase tracking-widest text-text-secondary mt-1">GLB or GLTF format</p>
                 </div>
              </div>

              {!modelFile ? (
                 <label className="block w-full text-center border border-dashed border-surface-border rounded-2xl p-6 cursor-pointer hover:border-color-gold transition-colors group">
                    <span className="text-xs font-bold uppercase tracking-widest text-text-secondary group-hover:text-color-gold transition-colors">Select .GLB File</span>
                    <input type="file" accept=".glb,.gltf" className="hidden" onChange={(e) => addModel(e.target.files)} />
                 </label>
              ) : (
                 <div className="flex items-center justify-between p-4 bg-bg-primary border border-surface-border rounded-2xl">
                    <div className="truncate pr-4 text-xs font-bold text-text-primary flex items-center gap-2">
                       <CheckCircle2 size={14} className="text-color-gold shrink-0" />
                       <span className="truncate">{modelFile.name}</span>
                    </div>
                    <button type="button" onClick={() => setModelFile(null)} className="p-2 hover:text-red-400 text-text-secondary transition-colors shrink-0">
                       <X size={16} />
                    </button>
                 </div>
              )}
              
              <div className="flex items-start gap-2 mt-4 text-[10px] text-text-muted">
                 <Info size={14} className="shrink-0 mt-0.5" />
                 <p>Providing a 3D asset enables the cinematic interactive viewer on the piece's detail page.</p>
              </div>
            </section>

            {submitting && (
              <div className="bg-surface-primary border border-surface-border rounded-3xl p-6">
                <div className="mb-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-text-primary">
                  <span>Encrypting & Uploading</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-primary">
                  <div className="h-full bg-color-gold transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <button type="submit" disabled={submitting} className="luxury-button w-full justify-center disabled:opacity-50">
              {submitting ? 'Finalizing...' : 'Offer Piece to Market'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ProductUploadPage;
