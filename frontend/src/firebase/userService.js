/**
 * firebase/userService.js
 *
 * All Firestore operations for user profiles.
 * Roles are stored in Firestore — never trusted from the frontend input.
 *
 * Firestore structure:
 *   /users/{uid}  →  { name, email, role, avatar, emailVerified, ... }
 */

import { getFirestoreDb } from './config';

const getFirestoreApi = () => import('firebase/firestore');

// ── Role resolution — mirrors backend roleResolver.js
const ADMIN_EMAILS  = (import.meta.env.VITE_ADMIN_EMAILS  || '')
  .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
const SELLER_EMAILS = (import.meta.env.VITE_SELLER_EMAILS || '')
  .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

/**
 * Resolve role from email. Called ONLY when creating a new user doc.
 * Existing users have their role read from Firestore (admin can change it).
 */
export const resolveRole = (email = '') => {
  const e = email.trim().toLowerCase();
  if (ADMIN_EMAILS.includes(e))  return 'admin';
  if (SELLER_EMAILS.includes(e)) return 'seller';
  return 'customer';
};

/**
 * Fetch a user's Firestore profile by UID.
 * Returns null if the document does not exist.
 */
export const getUserProfile = async (uid) => {
  try {
    const [{ doc, getDoc }, db] = await Promise.all([getFirestoreApi(), getFirestoreDb()]);
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return { uid, ...snap.data() };
  } catch (err) {
    console.error('getUserProfile error:', err);
    return null;
  }
};

/**
 * Create a new user profile document in Firestore.
 * Used on registration and first OAuth login.
 */
export const createUserProfile = async ({ uid, name, email, phone, avatar, provider = 'email', emailVerified = false }) => {
  const [{ doc, setDoc, serverTimestamp }, db] = await Promise.all([getFirestoreApi(), getFirestoreDb()]);
  const role = resolveRole(email);
  const data = {
    name:          name || email.split('@')[0],
    email:         email.toLowerCase(),
    phone:         phone || null,
    role,                          // set by backend logic — not user input
    isAdmin:       role === 'admin',
    isSeller:      role === 'admin' || role === 'seller',
    verifiedSeller: false,
    isBlocked:     false,
    emailVerified,
    avatar:        avatar || null,
    provider,
    createdAt:     serverTimestamp(),
    updatedAt:     serverTimestamp(),
  };
  await setDoc(doc(db, 'users', uid), data);
  return { uid, ...data };
};

/**
 * Update safe profile fields (name, avatar).
 * Role/isAdmin/isSeller can ONLY be changed via Admin SDK / Firestore rules.
 */
export const updateUserProfile = async (uid, updates) => {
  const [{ doc, updateDoc, serverTimestamp }, db] = await Promise.all([getFirestoreApi(), getFirestoreDb()]);
  const safe = {};
  if (updates.name)   safe.name   = updates.name;
  if (updates.avatar) safe.avatar = updates.avatar;
  safe.updatedAt = serverTimestamp();
  await updateDoc(doc(db, 'users', uid), safe);
};

/**
 * Get-or-create: used on OAuth login.
 * If user exists → return existing profile (preserves admin-set role).
 * If new → create with resolved role.
 */
export const getOrCreateProfile = async (firebaseUser, provider = 'google') => {
  const existing = await getUserProfile(firebaseUser.uid);
  if (existing) return existing;
  return createUserProfile({
    uid:           firebaseUser.uid,
    name:          firebaseUser.displayName,
    email:         firebaseUser.email,
    avatar:        firebaseUser.photoURL,
    provider,
    emailVerified: firebaseUser.emailVerified,
  });
};
