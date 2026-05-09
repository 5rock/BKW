import { createContext, useContext, useState, useEffect } from 'react';
import { fetchCart, addToCart, updateCartItem, removeFromCart } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const loadCart = async () => {
    if (!user) { setCartItems([]); setCartTotal(0); return; }
    try {
      setLoading(true);
      const res = await fetchCart();
      setCartItems(res.data.items || []);
      setCartTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCart(); }, [user]);

  const addItem = async (productId, quantity = 1) => {
    if (!user) return;
    const res = await addToCart({ productId, quantity });
    setCartItems(res.data.items || []);
    setCartTotal(res.data.total || 0);
  };

  const updateItem = async (itemId, quantity) => {
    await updateCartItem(itemId, { quantity });
    await loadCart();
  };

  const removeItem = async (itemId) => {
    await removeFromCart(itemId);
    await loadCart();
  };

  return (
    <CartContext.Provider value={{ cartItems, cartTotal, cartCount, loading, addItem, updateItem, removeItem, loadCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
