export const PRODUCT_CATEGORIES = [
  'Fashion & Apparel',
  'Electronics',
  'Sneakers',
  'Watches',
  'Accessories',
  'Home Decor',
  'Beauty',
  'Sports',
  'Books',
];

export const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'price_asc', label: 'Price Low to High' },
  { value: 'price_desc', label: 'Price High to Low' },
  { value: 'best_selling', label: 'Best Selling' },
  { value: 'top_rated', label: 'Top Rated' },
];

export const money = (value = 0) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));

export const normalizeProduct = (product = {}) => {
  const price = Number(product.price || 0);
  const discountPrice = Number(product.discountPrice || product.salePrice || 0);
  const finalPrice = discountPrice > 0 && discountPrice < price ? discountPrice : price;
  const discountPercent = price > finalPrice ? Math.round(((price - finalPrice) / price) * 100) : Number(product.discount || 0);
  const title = product.title || product.name || 'Untitled product';
  const images = product.images?.length ? product.images : [product.thumbnail].filter(Boolean);

  return {
    ...product,
    id: product.id || product._id,
    title,
    name: title,
    brand: product.brand || 'Marketplace',
    price,
    finalPrice,
    discountPrice,
    originalPrice: price,
    discountPercent,
    discount: discountPercent,
    stock: Number(product.stock || 0),
    rating: Number(product.rating || 0),
    reviewsCount: Number(product.reviewsCount || product.reviews || 0),
    reviews: Number(product.reviewsCount || product.reviews || 0),
    images,
    thumbnail: product.thumbnail || images[0] || '',
    tags: Array.isArray(product.tags) ? product.tags : splitList(product.tags),
    sizes: Array.isArray(product.sizes) ? product.sizes : splitList(product.sizes),
    colors: Array.isArray(product.colors) ? product.colors : splitList(product.colors),
  };
};

export const splitList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
};

export const getInventoryLabel = (stock = 0) => {
  if (stock <= 0) return { label: 'Out of stock', className: 'text-red-500' };
  if (stock <= 5) return { label: `Only ${stock} left`, className: 'text-red-500' };
  if (stock <= 15) return { label: 'Low stock', className: 'text-amber-500' };
  return { label: 'In stock', className: 'text-emerald-500' };
};

export const buildProductSearchText = (data) =>
  [
    data.title,
    data.description,
    data.category,
    data.brand,
    data.sku,
    ...(data.tags || []),
    ...(data.colors || []),
    ...(data.sizes || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
