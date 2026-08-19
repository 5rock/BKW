const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { isMockMode } = require('../utils/connectDB');
const { readDB, writeDB } = require('../utils/db');

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
const getCart = async (req, res, next) => {
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

    // FIX: Format for frontend — use productId as both the item identifier and the product ref
    // Cart items have _id: false, so we use productId as the stable identifier
    const enriched = cart.items.map(item => ({
      id: item.productId._id?.toString() || item.productId.toString(), // Use product ID as cart item ID
      productId: item.productId._id || item.productId,
      quantity: item.quantity,
      product: item.productId
    }));

    return res.json(formatCartResponse(enriched));
  } catch (err) {
    next(err);
  }
};

// POST /api/cart (protected)
const addToCart = async (req, res, next) => {
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
      id: item.productId._id?.toString() || item.productId.toString(),
      productId: item.productId._id || item.productId,
      quantity: item.quantity,
      product: item.productId
    }));
    
    return res.status(201).json(formatCartResponse(enriched));
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart/:itemId (protected)
const updateCartItem = async (req, res, next) => {
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

    // FIX: Since cart item _id is disabled, match by productId
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
    next(err);
  }
};

// DELETE /api/cart/:itemId (protected)
const removeFromCart = async (req, res, next) => {
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

    // FIX: Match by productId since _id is disabled
    let itemIndex = cart.items.findIndex(item => item.productId.toString() === req.params.itemId);

    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart' });

    cart.items.splice(itemIndex, 1);
    await cart.save();
    
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
