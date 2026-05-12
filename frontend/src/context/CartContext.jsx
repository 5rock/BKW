/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { loadCart, loadWishlist, saveCart, saveWishlist } from '../services/cartService';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const persistCart = useCallback(
    async (nextItems) => {
      setCartItems(nextItems);
      await saveCart(user, nextItems);
    },
    [user]
  );

  const persistWishlist = useCallback(
    async (nextIds) => {
      setWishlistIds(nextIds);
      await saveWishlist(user, nextIds);
    },
    [user]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cart, wishlist] = await Promise.all([loadCart(user), loadWishlist(user)]);
      setCartItems(cart.items);
      setWishlistIds(wishlist);
    } catch (error) {
      console.error('Failed to load shopping state', error);
      toast.error('Unable to load cart right now.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const addItem = async (productOrId, quantity = 1, options = {}) => {
    const productId = typeof productOrId === 'string' ? productOrId : productOrId.id;
    const existing = cartItems.find(
      (item) =>
        item.productId === productId &&
        item.selectedSize === (options.selectedSize || '') &&
        item.selectedColor === (options.selectedColor || '') &&
        !item.savedForLater
    );
    const nextItems = existing
      ? cartItems.map((item) => (item === existing ? { ...item, quantity: item.quantity + quantity } : item))
      : [
          ...cartItems,
          {
            id: `${productId}-${Date.now()}`,
            productId,
            quantity,
            selectedSize: options.selectedSize || '',
            selectedColor: options.selectedColor || '',
            savedForLater: false,
            product: typeof productOrId === 'string' ? undefined : productOrId,
            price: typeof productOrId === 'string' ? 0 : productOrId.finalPrice || productOrId.price,
          },
        ];
    await persistCart(nextItems);
    toast.success('Added to cart');
  };

  const updateItem = async (itemId, quantity) => {
    const nextItems = cartItems.map((item) => (item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item));
    await persistCart(nextItems);
  };

  const removeItem = async (itemId) => {
    await persistCart(cartItems.filter((item) => item.id !== itemId));
    toast.success('Removed from cart');
  };

  const saveForLater = async (itemId, savedForLater = true) => {
    await persistCart(cartItems.map((item) => (item.id === itemId ? { ...item, savedForLater } : item)));
  };

  const toggleWishlist = async (productId) => {
    const nextIds = wishlistIds.includes(productId)
      ? wishlistIds.filter((id) => id !== productId)
      : [...wishlistIds, productId];
    await persistWishlist(nextIds);
    toast.success(nextIds.includes(productId) ? 'Saved to wishlist' : 'Removed from wishlist');
  };

  const activeCartItems = useMemo(() => cartItems.filter((item) => !item.savedForLater), [cartItems]);
  const savedItems = useMemo(() => cartItems.filter((item) => item.savedForLater), [cartItems]);
  const cartTotal = activeCartItems.reduce((sum, item) => sum + (item.price || item.product?.finalPrice || 0) * item.quantity, 0);
  const cartCount = activeCartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems: activeCartItems,
        savedItems,
        allCartItems: cartItems,
        wishlistIds,
        cartTotal,
        cartCount,
        loading,
        addItem,
        updateItem,
        removeItem,
        saveForLater,
        toggleWishlist,
        isWishlisted: (productId) => wishlistIds.includes(productId),
        loadCart: load,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
