import { create } from 'zustand';
import toast from 'react-hot-toast';
import { loadCart, loadWishlist, saveCart, saveWishlist } from '@/services/cartService';
import { useNotificationStore } from '@/store/notificationStore';
import useAuthStore from '@/store/authStore';

const useCartStore = create((set, get) => ({
  cartItems: [],
  wishlistIds: [],
  loading: true,

  // Derived state (selectors are better to be used directly in components, but we provide getters here)
  get activeCartItems() {
    return get().cartItems.filter((i) => !i.savedForLater);
  },
  get savedItems() {
    return get().cartItems.filter((i) => i.savedForLater);
  },
  get cartTotal() {
    return get().activeCartItems.reduce((sum, item) => sum + (item.price || item.product?.finalPrice || 0) * item.quantity, 0);
  },
  get cartCount() {
    return get().activeCartItems.reduce((sum, item) => sum + item.quantity, 0);
  },
  isWishlisted: (productId) => get().wishlistIds.includes(productId),

  // Actions
  loadCart: async () => {
    set({ loading: true });
    try {
      const user = useAuthStore.getState().user;
      const [cart, wishlist] = await Promise.all([loadCart(user), loadWishlist(user)]);
      set({ cartItems: cart.items, wishlistIds: wishlist });
    } catch {
      // fail silently
    } finally {
      set({ loading: false });
    }
  },

  persistCart: async (nextItems) => {
    set({ cartItems: nextItems });
    const user = useAuthStore.getState().user;
    await saveCart(user, nextItems);
  },

  persistWishlist: async (nextIds) => {
    set({ wishlistIds: nextIds });
    const user = useAuthStore.getState().user;
    await saveWishlist(user, nextIds);
  },

  addItem: async (productOrId, quantity = 1, options = {}) => {
    const { cartItems, persistCart } = get();
    const addNotification = useNotificationStore.getState().addNotification;

    const productId = typeof productOrId === 'string' ? productOrId : productOrId.id;
    const productName = typeof productOrId === 'string' ? 'Product'
      : productOrId.title || productOrId.name || 'Product';

    const existing = cartItems.find(
      (item) =>
        item.productId === productId &&
        item.selectedSize === (options.selectedSize || '') &&
        item.selectedColor === (options.selectedColor || '') &&
        !item.savedForLater
    );

    const nextItems = existing
      ? cartItems.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + quantity } : item
        )
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
            price:
              typeof productOrId === 'string'
                ? 0
                : productOrId.finalPrice || productOrId.price,
          },
        ];

    await persistCart(nextItems);
    toast.success('Added to cart');
    addNotification({ type: 'cart', title: 'Added to cart', message: `${productName} × ${quantity}` });
  },

  updateItem: async (itemId, quantity) => {
    const { cartItems, persistCart } = get();
    if (quantity <= 0) {
      const nextItems = cartItems.filter((item) => item.id !== itemId);
      await persistCart(nextItems);
      toast.success('Removed from cart');
      return;
    }
    const nextItems = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    await persistCart(nextItems);
  },

  removeItem: async (itemId) => {
    const { cartItems, persistCart } = get();
    const addNotification = useNotificationStore.getState().addNotification;
    
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
  },

  saveForLater: async (itemId, savedForLater = true) => {
    const { cartItems, persistCart } = get();
    await persistCart(
      cartItems.map((item) =>
        item.id === itemId ? { ...item, savedForLater } : item
      )
    );
    toast.success(savedForLater ? 'Saved for later' : 'Moved to cart');
  },

  toggleWishlist: async (productId) => {
    const { wishlistIds, persistWishlist } = get();
    const addNotification = useNotificationStore.getState().addNotification;

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
  },
}));

export default useCartStore;
