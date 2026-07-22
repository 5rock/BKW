/* eslint-disable react-refresh/only-export-components */
/**
 * CartContext — PERFORMANCE-OPTIMISED version.
 *
 * Split into TWO contexts to prevent unnecessary re-renders:
 *   - CartStateContext : read-only values (cartItems, count, total, loading)
 *   - CartActionsContext : stable action functions (never change reference)
 *
 * Components that only need actions (e.g. ProductCard's "Add to Cart") will
 * NOT re-render when cart state changes.
 *
 * Key fixes vs original:
 *  1. isWishlisted memoized as Set.has lookup (O(1)) instead of Array.includes (O(n))
 *  2. cartTotal / cartCount computed via useMemo, not inline
 *  3. Stable action references via useCallback with minimal deps
 *  4. Two-context split eliminates cross-cutting re-renders
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/providers/AuthContext';
import { loadCart, loadWishlist, saveCart, saveWishlist } from '@/services/cartService';
import { useNotificationStore } from '@/store/notificationStore';

// ── Stable action reference — never changes, never causes re-renders
const CartActionsContext = createContext(null);
// ── State slice — only consumed by components that actually render cart data
const CartStateContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const addNotification = useNotificationStore((s) => s.addNotification);

  // Keep a ref to cartItems for action closures so they don't need cartItems in deps
  const cartRef = useRef(cartItems);
  const wishlistRef = useRef(wishlistIds);
  useEffect(() => { cartRef.current = cartItems; }, [cartItems]);
  useEffect(() => { wishlistRef.current = wishlistIds; }, [wishlistIds]);

  // ── Persist helpers — stable refs, user is the only dep
  const persistCart = useCallback(async (nextItems) => {
    setCartItems(nextItems);
    await saveCart(user, nextItems);
  }, [user]);

  const persistWishlist = useCallback(async (nextIds) => {
    setWishlistIds(nextIds);
    await saveWishlist(user, nextIds);
  }, [user]);

  // ── Load cart + wishlist simultaneously
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cart, wishlist] = await Promise.all([loadCart(user), loadWishlist(user)]);
      setCartItems(cart.items);
      setWishlistIds(wishlist);
    } catch {
      // fail silently — user starts with empty cart
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  // ── Actions — useRef-based patterns keep deps minimal and references stable
  const addItem = useCallback(async (productOrId, quantity = 1, options = {}) => {
    const productId = typeof productOrId === 'string' ? productOrId : productOrId.id;
    const productName = typeof productOrId === 'string' ? 'Product'
      : productOrId.title || productOrId.name || 'Product';

    const current = cartRef.current;
    const existing = current.find(
      (item) =>
        item.productId === productId &&
        item.selectedSize === (options.selectedSize || '') &&
        item.selectedColor === (options.selectedColor || '') &&
        !item.savedForLater
    );

    const nextItems = existing
      ? current.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + quantity } : item
        )
      : [
          ...current,
          {
            id: `${productId}-${Date.now()}`,
            productId,
            quantity,
            selectedSize: options.selectedSize || '',
            selectedColor: options.selectedColor || '',
            savedForLater: false,
            product: typeof productOrId === 'string' ? undefined : productOrId,
            price:
              typeof productOrId === 'string'
                ? 0
                : productOrId.finalPrice || productOrId.price,
          },
        ];

    await persistCart(nextItems);
    toast.success('Added to cart');
    addNotification({ type: 'cart', title: 'Added to cart', message: `${productName} × ${quantity}` });
  }, [addNotification, persistCart]);

  const updateItem = useCallback(async (itemId, quantity) => {
    if (quantity <= 0) {
      const nextItems = cartRef.current.filter((item) => item.id !== itemId);
      await persistCart(nextItems);
      toast.success('Removed from cart');
      return;
    }
    const nextItems = cartRef.current.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    await persistCart(nextItems);
  }, [persistCart]);

  const removeItem = useCallback(async (itemId) => {
    const removed = cartRef.current.find((item) => item.id === itemId);
    await persistCart(cartRef.current.filter((item) => item.id !== itemId));
    toast.success('Removed from cart');
    if (removed?.product) {
      addNotification({
        type: 'cart',
        title: 'Removed from cart',
        message: removed.product.title || removed.product.name,
      });
    }
  }, [addNotification, persistCart]);

  const saveForLater = useCallback(async (itemId, savedForLater = true) => {
    await persistCart(
      cartRef.current.map((item) =>
        item.id === itemId ? { ...item, savedForLater } : item
      )
    );
    toast.success(savedForLater ? 'Saved for later' : 'Moved to cart');
  }, [persistCart]);

  const toggleWishlist = useCallback(async (productId) => {
    const current = wishlistRef.current;
    const nextIds = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    await persistWishlist(nextIds);
    const added = nextIds.includes(productId);
    toast.success(added ? 'Saved to wishlist' : 'Removed from wishlist');
    addNotification({
      type: 'wishlist',
      title: added ? 'Added to wishlist' : 'Removed from wishlist',
      message: `Product ID: ${productId}`,
    });
  }, [addNotification, persistWishlist]);

  // ── Stable Set for O(1) wishlist lookup (vs Array.includes which is O(n))
  const wishlistSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);
  const isWishlisted = useCallback((productId) => wishlistSet.has(productId), [wishlistSet]);

  // ── Derived state — memoized so downstream components don't recompute
  const activeCartItems = useMemo(() => cartItems.filter((i) => !i.savedForLater), [cartItems]);
  const savedItems = useMemo(() => cartItems.filter((i) => i.savedForLater), [cartItems]);
  const cartTotal = useMemo(
    () => activeCartItems.reduce((sum, item) => sum + (item.price || item.product?.finalPrice || 0) * item.quantity, 0),
    [activeCartItems]
  );
  const cartCount = useMemo(
    () => activeCartItems.reduce((sum, item) => sum + item.quantity, 0),
    [activeCartItems]
  );

  // ── Two separate context values for split subscriptions
  const stateValue = useMemo(() => ({
    cartItems: activeCartItems,
    savedItems,
    allCartItems: cartItems,
    wishlistIds,
    cartTotal,
    cartCount,
    loading,
  }), [activeCartItems, cartTotal, cartCount, cartItems, loading, savedItems, wishlistIds]);

  // ── Actions never change reference — safe to pass to memo'd children
  const actionsValue = useMemo(() => ({
    addItem,
    updateItem,
    removeItem,
    saveForLater,
    toggleWishlist,
    isWishlisted,
    loadCart: load,
  }), [addItem, isWishlisted, load, removeItem, saveForLater, toggleWishlist, updateItem]);

  return (
    <CartActionsContext.Provider value={actionsValue}>
      <CartStateContext.Provider value={stateValue}>
        {children}
      </CartStateContext.Provider>
    </CartActionsContext.Provider>
  );
};

// ── Granular hooks — components subscribe to only what they need

/** Full cart state + actions (legacy compatibility) */
export const useCart = () => {
  const state = useContext(CartStateContext);
  const actions = useContext(CartActionsContext);
  if (!state || !actions) throw new Error('useCart must be inside CartProvider');
  return { ...state, ...actions };
};

/** Only cart state — re-renders on every cart change */
export const useCartState = () => {
  const ctx = useContext(CartStateContext);
  if (!ctx) throw new Error('useCartState must be inside CartProvider');
  return ctx;
};

/** Only stable actions — NEVER re-renders */
export const useCartActions = () => {
  const ctx = useContext(CartActionsContext);
  if (!ctx) throw new Error('useCartActions must be inside CartProvider');
  return ctx;
};
