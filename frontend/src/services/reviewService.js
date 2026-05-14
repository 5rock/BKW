/**
 * reviewService.js — Product reviews
 * 
 * Uses localStorage in mock mode since Firebase Firestore
 * is not available without a configured Firebase project.
 */

const REVIEWS_KEY = 'marketx_reviews';

const readReviews = () => {
  try {
    return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeReviews = (data) => {
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(data));
  } catch { /* quota exceeded */ }
};

export const getProductReviews = async (productId, count = 10) => {
  const all = readReviews();
  return (all[productId] || []).slice(0, count);
};

export const addProductReview = async (productId, user, review) => {
  if (!user?.uid) throw new Error('Sign in to review this product.');
  const all = readReviews();
  if (!all[productId]) all[productId] = [];
  all[productId].unshift({
    id: `review_${Date.now()}`,
    userId: user.uid,
    userName: user.name || 'Customer',
    rating: Number(review.rating),
    comment: review.comment.trim(),
    createdAt: new Date().toISOString(),
  });
  writeReviews(all);
};
