import { getFirestoreDb } from '@/firebase/config';
import { getProductById } from '@/services/productService';

const GUEST_CART_KEY = 'marketx_guest_cart';
const WISHLIST_KEY = 'marketx_guest_wishlist';

const readLocal = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const writeLocal = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const getFirestoreRefs = async () => {
  const [{ doc, getDoc, serverTimestamp, setDoc }, db] = await Promise.all([
    import('firebase/firestore'),
    getFirestoreDb(),
  ]);
  return {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    cartDoc: (uid) => doc(db, 'carts', uid),
    wishlistDoc: (uid) => doc(db, 'wishlists', uid),
  };
};

const hydrateItems = async (items = []) => {
  const hydrated = await Promise.all(
    items.map(async (item) => {
      try {
        const product = await getProductById(item.productId);
        return { ...item, product, price: product.finalPrice };
      } catch {
        return null;
      }
    })
  );
  return hydrated.filter(Boolean);
};

export const loadCart = async (user) => {
  if (!user?.uid) {
    const items = await hydrateItems(readLocal(GUEST_CART_KEY));
    return {
      items,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };
  }

  const { getDoc, cartDoc } = await getFirestoreRefs();
  const raw = user?.uid
    ? (await getDoc(cartDoc(user.uid))).data()?.items || []
    : readLocal(GUEST_CART_KEY);
  const items = await hydrateItems(raw);
  return {
    items,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
};

export const saveCart = async (user, items) => {
  const compact = items.map(({ productId, quantity, savedForLater = false, selectedSize = '', selectedColor = '' }) => ({
    productId,
    quantity,
    savedForLater,
    selectedSize,
    selectedColor,
  }));
  if (user?.uid) {
    const { setDoc, serverTimestamp, cartDoc } = await getFirestoreRefs();
    await setDoc(cartDoc(user.uid), { userId: user.uid, items: compact, updatedAt: serverTimestamp() }, { merge: true });
  } else {
    writeLocal(GUEST_CART_KEY, compact);
  }
};

export const loadWishlist = async (user) => {
  if (!user?.uid) return readLocal(WISHLIST_KEY);

  const { getDoc, wishlistDoc } = await getFirestoreRefs();
  const ids = user?.uid
    ? (await getDoc(wishlistDoc(user.uid))).data()?.productIds || []
    : readLocal(WISHLIST_KEY);
  return ids;
};

export const saveWishlist = async (user, productIds) => {
  if (user?.uid) {
    const { setDoc, serverTimestamp, wishlistDoc } = await getFirestoreRefs();
    await setDoc(wishlistDoc(user.uid), { userId: user.uid, productIds, updatedAt: serverTimestamp() }, { merge: true });
  } else {
    writeLocal(WISHLIST_KEY, productIds);
  }
};
