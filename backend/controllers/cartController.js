const { readDB, writeDB } = require('../utils/db');

// GET /api/cart (protected)
const getCart = (req, res) => {
  const db = readDB();
  const userCart = db.carts.find((c) => c.userId === req.user.id);
  if (!userCart) return res.json({ items: [], total: 0 });

  // Enrich with product data
  const enriched = userCart.items.map((item) => {
    const product = db.products.find((p) => p.id === item.productId);
    return { ...item, product };
  }).filter((item) => item.product);

  const total = enriched.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  res.json({ items: enriched, total: parseFloat(total.toFixed(2)) });
};

// POST /api/cart (protected)
const addToCart = (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId is required' });

  const db = readDB();
  const product = db.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  let userCart = db.carts.find((c) => c.userId === req.user.id);

  if (!userCart) {
    userCart = { userId: req.user.id, items: [] };
    db.carts.push(userCart);
  }

  const existingItem = userCart.items.find((i) => i.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    userCart.items.push({ id: `ci${Date.now()}`, productId, quantity });
  }

  writeDB(db);

  // Return enriched cart
  const enriched = userCart.items.map((item) => {
    const prod = db.products.find((p) => p.id === item.productId);
    return { ...item, product: prod };
  });
  const total = enriched.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  res.status(201).json({ items: enriched, total: parseFloat(total.toFixed(2)) });
};

// PUT /api/cart/:itemId (protected)
const updateCartItem = (req, res) => {
  const { quantity } = req.body;
  const db = readDB();
  const userCart = db.carts.find((c) => c.userId === req.user.id);
  if (!userCart) return res.status(404).json({ message: 'Cart not found' });

  const item = userCart.items.find((i) => i.id === req.params.itemId);
  if (!item) return res.status(404).json({ message: 'Item not found in cart' });

  if (quantity <= 0) {
    userCart.items = userCart.items.filter((i) => i.id !== req.params.itemId);
  } else {
    item.quantity = quantity;
  }

  writeDB(db);
  res.json({ message: 'Cart updated' });
};

// DELETE /api/cart/:itemId (protected)
const removeFromCart = (req, res) => {
  const db = readDB();
  const userCart = db.carts.find((c) => c.userId === req.user.id);
  if (!userCart) return res.status(404).json({ message: 'Cart not found' });

  const before = userCart.items.length;
  userCart.items = userCart.items.filter((i) => i.id !== req.params.itemId);
  if (userCart.items.length === before) {
    return res.status(404).json({ message: 'Item not found in cart' });
  }

  writeDB(db);
  res.json({ message: 'Item removed from cart' });
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
