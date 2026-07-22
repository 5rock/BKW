const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const { isMockMode } = require('../utils/connectDB');
const { mockModel } = require('../utils/db');

const MockProduct = mockModel('products');



// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search, category, sort, minPrice, maxPrice, limit = 20 } = req.query;

    if (isMockMode()) {
      const db = require('../utils/db').readDB();
      let products = [...db.products];

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

      if (minPrice) products = products.filter((p) => p.price >= parseFloat(minPrice));
      if (maxPrice) products = products.filter((p) => p.price <= parseFloat(maxPrice));

      if (sort === 'price_asc') products.sort((a, b) => a.price - b.price);
      else if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);
      else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
      else if (sort === 'newest') products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.json({ products: products.slice(0, parseInt(limit)), total: products.length });
    }

    // MongoDB Mode
    const query = {};
    if (search) query.$text = { $search: search };
    if (category && category !== 'All') query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else if (sort === 'rating') sortOption.ratingsAverage = -1;
    else sortOption.createdAt = -1;

    const products = await Product.find(query).sort(sortOption).limit(parseInt(limit, 10));
    const total = await Product.countDocuments(query);
    res.json({ products, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const Model = isMockMode() ? MockProduct : Product;
    const product = await Model.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const Model = isMockMode() ? MockProduct : Product;
    const productData = {
      ...req.body,
      seller: req.user.id,
      sellerId: req.user.id,
    };
    const product = await Model.create(productData);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const Model = isMockMode() ? MockProduct : Product;
    const product = await Model.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    Object.assign(product, req.body);
    
    if (isMockMode()) {
      await MockProduct.save(product);
    } else {
      await product.save();
    }
    
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const Model = isMockMode() ? MockProduct : Product;
    if (isMockMode()) {
      const db = require('../utils/db').readDB();
      db.products = db.products.filter(p => p.id !== req.params.id && p._id !== req.params.id);
      require('../utils/db').writeDB(db);
    } else {
      await Product.findByIdAndDelete(req.params.id);
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
