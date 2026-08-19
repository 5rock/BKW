const Product = require('../models/Product');
const { isMockMode } = require('../utils/connectDB');
const { mockModel } = require('../utils/db');

const MockProduct = mockModel('products');

// FIX: Whitelist of fields allowed in product create/update — prevents mass assignment
const ALLOWED_PRODUCT_FIELDS = [
  'name', 'description', 'price', 'category', 'images', 'stock',
  'brand', 'sku', 'tags', 'sizes', 'colors', 'metadata', 'discountPrice', 'model3d'
];

/** Pick only allowed fields from an object */
const pickSafeFields = (source) => {
  const safe = {};
  for (const key of ALLOWED_PRODUCT_FIELDS) {
    if (source[key] !== undefined) {
      if (key === 'images' && Array.isArray(source[key])) {
        safe[key] = source[key].filter(url => {
          try {
            const parsed = new URL(url);
            return parsed.protocol === 'https:' || parsed.protocol === 'http:';
          } catch {
            return false; // Remove invalid URLs
          }
        });
      } else {
        safe[key] = source[key];
      }
    }
  }
  return safe;
};

const buildMongoQuery = (queryObj) => {
  const { search, category, minPrice, maxPrice } = queryObj;
  const query = {};
  
  if (typeof search === 'string' && search) {
    query.$text = { $search: String(search) };
  }
  
  if (typeof category === 'string' && category && category !== 'All') {
    query.category = String(category);
  }
  
  if (minPrice != null || maxPrice != null) {
    query.price = {};
    if (minPrice != null && !Number.isNaN(Number.parseFloat(minPrice))) {
      query.price.$gte = Number.parseFloat(minPrice);
    }
    if (maxPrice != null && !Number.isNaN(Number.parseFloat(maxPrice))) {
      query.price.$lte = Number.parseFloat(maxPrice);
    }
  }
  
  return query;
};

const buildMongoSort = (sort) => {
  const sortOption = {};
  if (sort === 'price_asc') sortOption.price = 1;
  else if (sort === 'price_desc') sortOption.price = -1;
  else if (sort === 'rating') sortOption.ratingsAverage = -1;
  else sortOption.createdAt = -1;
  return sortOption;
};

const handleMockProducts = (reqQuery, parsedLimit, skip) => {
  const { search, category, sort, minPrice, maxPrice } = reqQuery;
  const db = require('../utils/db').readDB();
  let products = [...db.products];

  if (typeof search === 'string' && search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (typeof category === 'string' && category && category !== 'All') {
    products = products.filter((p) => p.category === category);
  }

  if (minPrice != null && !Number.isNaN(Number.parseFloat(minPrice))) {
    products = products.filter((p) => p.price >= Number.parseFloat(minPrice));
  }
  if (maxPrice != null && !Number.isNaN(Number.parseFloat(maxPrice))) {
    products = products.filter((p) => p.price <= Number.parseFloat(maxPrice));
  }

  if (sort === 'price_asc') products.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (sort === 'newest') products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    products: products.slice(skip, skip + parsedLimit),
    total: products.length
  };
};

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const parsedLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
    const parsedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    let products, total;

    if (isMockMode()) {
      const result = handleMockProducts(req.query, parsedLimit, skip);
      products = result.products;
      total = result.total;
    } else {
      const query = buildMongoQuery(req.query);
      const sortOption = buildMongoSort(req.query.sort);

      [products, total] = await Promise.all([
        Product.find(query)
          .select('name price category images stock brand ratingsAverage ratingsQuantity discountPrice createdAt')
          .sort(sortOption)
          .skip(skip)
          .limit(parsedLimit),
        Product.countDocuments(query),
      ]);
    }

    const totalPages = Math.ceil(total / parsedLimit);
    res.json({
      products,
      total,
      page: parsedPage,
      totalPages,
      hasMore: parsedPage < totalPages,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const Model = isMockMode() ? MockProduct : Product;
    const product = await Model.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const Model = isMockMode() ? MockProduct : Product;
    // FIX: Only pick allowed fields — prevents mass assignment of ratingsAverage, seller, etc.
    const safeData = pickSafeFields(req.body);
    const productData = {
      ...safeData,
      seller: req.user.id,
    };
    const product = await Model.create(productData);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const Model = isMockMode() ? MockProduct : Product;
    const product = await Model.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // FIX: Owner authorization — only the seller who created the product (or admin) can update it
    const sellerId = product.seller?.toString?.() || product.sellerId;
    if (sellerId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized — you can only update your own products' });
    }

    // FIX: Only merge allowed fields — prevents overwriting seller, ratings, etc.
    const safeData = pickSafeFields(req.body);
    Object.assign(product, safeData);

    if (isMockMode()) {
      await MockProduct.save(product);
    } else {
      await product.save();
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    if (isMockMode()) {
      const db = require('../utils/db').readDB();
      const product = db.products.find(p => p.id === req.params.id || p._id === req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      // FIX: Owner authorization for mock mode
      const sellerId = product.seller || product.sellerId;
      if (sellerId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized — you can only delete your own products' });
      }

      db.products = db.products.filter(p => p.id !== req.params.id && p._id !== req.params.id);
      require('../utils/db').writeDB(db);
    } else {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      // FIX: Owner authorization for MongoDB mode
      if (product.seller?.toString() !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized — you can only delete your own products' });
      }

      await Product.findByIdAndDelete(req.params.id);
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
