import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const getProductReviews = async (productId, count = 10) => {
  const ref = collection(db, 'products', productId, 'reviews');
  const snap = await getDocs(query(ref, orderBy('createdAt', 'desc'), limit(count)));
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const addProductReview = async (productId, user, review) => {
  if (!user?.uid) throw new Error('Sign in to review this product.');
  const ref = collection(db, 'products', productId, 'reviews');
  await addDoc(ref, {
    userId: user.uid,
    userName: user.name || 'Customer',
    rating: Number(review.rating),
    comment: review.comment.trim(),
    createdAt: serverTimestamp(),
  });
};
