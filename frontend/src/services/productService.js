import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { buildProductSearchText, normalizeProduct } from '../utils/productUtils';
import { compressImage } from '../utils/imageCompression';

const productsRef = collection(db, 'products');

const sortMap = {
  latest: ['createdAt', 'desc'],
  newest: ['createdAt', 'desc'],
  price_asc: ['finalPrice', 'asc'],
  price_desc: ['finalPrice', 'desc'],
  best_selling: ['salesCount', 'desc'],
  top_rated: ['rating', 'desc'],
  rating: ['rating', 'desc'],
};

export const uploadProductImage = async (file, userId, onProgress) => {
  const compressed = await compressImage(file);
  const path = `products/${userId}/${Date.now()}-${compressed.name}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, compressed, {
    contentType: compressed.type,
    customMetadata: { originalName: file.name },
  });

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress?.(pct);
      },
      reject,
      async () => resolve(await getDownloadURL(task.snapshot.ref))
    );
  });
};

export const createProduct = async ({ data, files = [], thumbnailIndex = 0, user, onProgress }) => {
  if (!user?.uid) throw new Error('You must be signed in to create a product.');
  if (!user.isSeller && user.role !== 'admin') throw new Error('Only sellers and admins can create products.');

  const urls = [];
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const url = await uploadProductImage(file, user.uid, (pct) => {
      const base = (index / Math.max(files.length, 1)) * 100;
      onProgress?.(Math.round(base + pct / Math.max(files.length, 1)));
    });
    urls.push(url);
  }

  const price = Number(data.price || 0);
  const discountPrice = Number(data.discountPrice || 0);
  const finalPrice = discountPrice > 0 && discountPrice < price ? discountPrice : price;
  const payload = {
    sellerId: user.uid,
    sellerName: user.name || user.email || 'Seller',
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category,
    brand: data.brand.trim(),
    price,
    discountPrice,
    finalPrice,
    stock: Number(data.stock || 0),
    sizes: data.sizes,
    colors: data.colors,
    images: urls,
    thumbnail: urls[thumbnailIndex] || urls[0] || '',
    rating: 0,
    reviewsCount: 0,
    salesCount: 0,
    tags: data.tags,
    sku: data.sku.trim(),
    deliveryTime: data.deliveryTime.trim(),
    warrantyInfo: data.warrantyInfo.trim(),
    featured: Boolean(data.featured),
    status: data.status || 'active',
    searchText: buildProductSearchText(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(productsRef, payload);
  await updateDoc(docRef, { id: docRef.id });
  return { id: docRef.id, ...payload };
};

export const updateProduct = async (productId, data) => {
  const payload = {
    ...data,
    searchText: buildProductSearchText(data),
    updatedAt: serverTimestamp(),
  };
  await updateDoc(doc(db, 'products', productId), payload);
};

export const deleteProduct = async (productId) => deleteDoc(doc(db, 'products', productId));

export const getProductById = async (productId) => {
  const snap = await getDoc(doc(db, 'products', productId));
  if (!snap.exists()) throw new Error('Product not found');
  return normalizeProduct({ id: snap.id, ...snap.data() });
};

export const getProducts = async (filters = {}) => {
  const constraints = [];
  if (filters.status !== 'all') constraints.push(where('status', '==', filters.status || 'active'));
  if (filters.category && filters.category !== 'All') constraints.push(where('category', '==', filters.category));
  if (filters.featured) constraints.push(where('featured', '==', true));
  if (filters.sellerId) constraints.push(where('sellerId', '==', filters.sellerId));
  if (filters.cursor) constraints.push(startAfter(filters.cursor));

  const [sortField, sortDirection] = sortMap[filters.sort || 'latest'] || sortMap.latest;
  constraints.push(orderBy(sortField, sortDirection));
  constraints.push(limit(Number(filters.limit || 24)));

  const snap = await getDocs(query(productsRef, ...constraints));
  let products = snap.docs.map((item) => normalizeProduct({ id: item.id, ...item.data() }));

  const search = filters.search?.trim().toLowerCase();
  if (search) products = products.filter((p) => p.searchText?.includes(search) || p.title.toLowerCase().includes(search));
  if (filters.maxPrice) products = products.filter((p) => p.finalPrice <= Number(filters.maxPrice));
  if (filters.minRating) products = products.filter((p) => p.rating >= Number(filters.minRating));
  if (filters.brand) products = products.filter((p) => p.brand === filters.brand);
  if (filters.color) products = products.filter((p) => p.colors.includes(filters.color));
  if (filters.size) products = products.filter((p) => p.sizes.includes(filters.size));

  return {
    products,
    total: products.length,
    lastDoc: snap.docs[snap.docs.length - 1] || null,
    hasMore: snap.docs.length === Number(filters.limit || 24),
  };
};

export const getRelatedProducts = async (product, count = 8) => {
  const result = await getProducts({ category: product.category, limit: count + 1, sort: 'top_rated' });
  return result.products.filter((item) => item.id !== product.id).slice(0, count);
};
