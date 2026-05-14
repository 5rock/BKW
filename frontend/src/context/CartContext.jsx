/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { loadCart, loadWishlist, saveCart, saveWishlist } from '../services/cartService';
import { useNotificationStore } from '../store/notificationStore';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const addNotification = useNotificationStore((s) => s.addNotification);

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
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const addItem = async (productOrId, quantity = 1, options = {}) => {
    const productId = typeof productOrId === 'string' ? productOrId : productOrId.id;
    const productName = typeof productOrId === 'string' ? 'Product' : productOrId.title || productOrId.name || 'Product';
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
    toast.success(`Added to cart`);
    addNotification({
      type: 'cart',
      title: 'Added to cart',
      message: `${productName} × ${quantity}`,
    });
  };

  const updateItem = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }
    const nextItems = cartItems.map((item) => (item.id === itemId ? { ...item, quantity } : item));
    await persistCart(nextItems);
  };

  const removeItem = async (itemId) => {
    const removed = cartItems.find((item) => item.id === itemId);
    await persistCart(cartItems.filter((item) => item.id !== itemId));
    toast.success('Removed from cart');
    if (removed?.product) {
      addNotification({
        type: 'cart',
        title: 'Removed from cart',
        message: removed.product.title || removed.product.name,
      });
    }
  };

  const saveForLater = async (itemId, savedForLater = true) => {
    await persistCart(cartItems.map((item) => (item.id === itemId ? { ...item, savedForLater } : item)));
    toast.success(savedForLater ? 'Saved for later' : 'Moved to cart');
  };

  const toggleWishlist = async (productId) => {
    const nextIds = wishlistIds.includes(productId)
      ? wishlistIds.filter((id) => id !== productId)
      : [...wishlistIds, productId];
    await persistWishlist(nextIds);
    const added = nextIds.includes(productId);
    toast.success(added ? 'Saved to wishlist' : 'Removed from wishlist');
    addNotification({
      type: 'wishlist',
      title: added ? 'Added to wishlist' : 'Removed from wishlist',
      message: `Product ID: ${productId}`,
    });
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
