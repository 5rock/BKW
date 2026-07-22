const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { isMockMode } = require('../utils/connectDB');
const { readDB, writeDB } = require('../utils/db');
const { mockModel } = require('../utils/db');

const MockProduct = mockModel('products');

// Helper to format cart response
const formatCartResponse = (cartItems) => {
  const total = cartItems.reduce((sum, item) => {
    if (!item.product) return sum;
    const price = item.product.price || 0;
    return sum + price * item.quantity;
  }, 0);
  return { items: cartItems, total: parseFloat(total.toFixed(2)) };
};

// GET /api/cart (protected)
const getCart = async (req, res) => {
  try {
    if (isMockMode()) {
      const db = readDB();
      const userCart = db.carts.find((c) => c.userId === req.user.id);
      if (!userCart) return res.json({ items: [], total: 0 });

      const enriched = userCart.items.map((item) => {
        const product = db.products.find((p) => p.id === item.productId || p._id === item.productId);
        return { ...item, product };
      }).filter((item) => item.product);

      return res.json(formatCartResponse(enriched));
    }

    let cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart) return res.json({ items: [], total: 0 });

    // Format for frontend
    const enriched = cart.items.map(item => ({
      id: item._id, // cart item id
      productId: item.productId._id,
      quantity: item.quantity,
      product: item.productId
    }));

    return res.json(formatCartResponse(enriched));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/cart (protected)
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required' });
    if (quantity < 1) return res.status(400).json({ message: 'quantity must be at least 1' });

    if (isMockMode()) {
      const db = readDB();
      const product = db.products.find((p) => p.id === productId || p._id === productId);
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

      const enriched = userCart.items.map((item) => {
        const prod = db.products.find((p) => p.id === item.productId || p._id === item.productId);
        return { ...item, product: prod };
      }).filter((item) => item.product);

      return res.status(201).json(formatCartResponse(enriched));
    }

    // MongoDB Mode
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    
    await cart.save();
    
    cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    const enriched = cart.items.map(item => ({
      id: item._id,
      productId: item.productId._id,
      quantity: item.quantity,
      product: item.productId
    }));
    
    return res.status(201).json(formatCartResponse(enriched));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/cart/:itemId (protected)
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (isMockMode()) {
      const db = readDB();
      const userCart = db.carts.find((c) => c.userId === req.user.id);
      if (!userCart) return res.status(404).json({ message: 'Cart not found' });

      const item = userCart.items.find((i) => i.id === req.params.itemId || i.productId === req.params.itemId);
      if (!item) return res.status(404).json({ message: 'Item not found in cart' });

      if (quantity <= 0) {
        userCart.items = userCart.items.filter((i) => i.id !== req.params.itemId && i.productId !== req.params.itemId);
      } else {
        item.quantity = quantity;
      }
      writeDB(db);
      return res.json({ message: 'Cart updated' });
    }

    // MongoDB Mode
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // ItemId from frontend might be cart item ID or product ID.
    // Since cart item _id is disabled, we just check productId.
    let itemIndex = cart.items.findIndex(item => item.productId.toString() === req.params.itemId);

    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart' });

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/cart/:itemId (protected)
const removeFromCart = async (req, res) => {
  try {
    if (isMockMode()) {
      const db = readDB();
      const userCart = db.carts.find((c) => c.userId === req.user.id);
      if (!userCart) return res.status(404).json({ message: 'Cart not found' });

      const before = userCart.items.length;
      userCart.items = userCart.items.filter((i) => i.id !== req.params.itemId && i.productId !== req.params.itemId);
      if (userCart.items.length === before) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      writeDB(db);
      return res.json({ message: 'Item removed from cart' });
    }

    // MongoDB Mode
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    let itemIndex = cart.items.findIndex(item => item.productId.toString() === req.params.itemId);

    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart' });

    cart.items.splice(itemIndex, 1);
    await cart.save();
    
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
