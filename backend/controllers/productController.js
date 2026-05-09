const { readDB, writeDB } = require('../utils/db');

// GET /api/products
const getProducts = (req, res) => {
  const db = readDB();
  let products = [...db.products];

  const { search, category, sort, minPrice, maxPrice } = req.query;

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'All') {
    products = products.filter((p) => p.category === category);
  }

  if (minPrice) {
    products = products.filter((p) => p.price >= parseFloat(minPrice));
  }

  if (maxPrice) {
    products = products.filter((p) => p.price <= parseFloat(maxPrice));
  }

  if (sort === 'price_asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json({ products, total: products.length });
};

// GET /api/products/:id
const getProductById = (req, res) => {
  const db = readDB();
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

// POST /api/products (auth + seller)
const createProduct = (req, res) => {
  const db = readDB();
  const newProduct = {
    id: `p${Date.now()}`,
    ...req.body,
    sellerId: req.user.id,
    rating: 0,
    reviews: 0,
    createdAt: new Date().toISOString(),
  };
  db.products.push(newProduct);
  writeDB(db);
  res.status(201).json(newProduct);
};

// PUT /api/products/:id (auth + seller)
const updateProduct = (req, res) => {
  const db = readDB();
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Product not found' });

  db.products[idx] = { ...db.products[idx], ...req.body, id: req.params.id };
  writeDB(db);
  res.json(db.products[idx]);
};

// DELETE /api/products/:id (auth + seller)
const deleteProduct = (req, res) => {
  const db = readDB();
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Product not found' });

  db.products.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'Product deleted' });
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
