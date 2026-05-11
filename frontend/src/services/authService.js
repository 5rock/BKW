/**
 * authService.js
 *
 * All authentication API calls to the backend.
 * This is the single source of truth for auth network requests.
 */

import api from './api';
import {
  signInWithPopup,
  signInWithEmailAndPassword as firebaseEmailLogin,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider, githubProvider } from './firebase';

// ─── Email / Password ────────────────────────────────────────────────────────

/** Register new user — sends only name/email/password — NO role */
export const registerWithEmail = (name, email, password) =>
  api.post('/auth/register', { name, email, password });

/** Login with email and password */
export const loginWithEmail = (email, password) =>
  api.post('/auth/login', { email, password });

/** Exchange a refresh token for a new access token */
export const refreshAccessToken = (refreshToken) =>
  api.post('/auth/refresh', { refreshToken });

/** Logout (clears server-side state if any) */
export const logoutApi = () => api.post('/auth/logout');

// ─── Firebase OAuth helpers ──────────────────────────────────────────────────

/** Generic popup flow: open provider popup → get Firebase ID token → send to backend */
const oAuthWithPopup = async (provider) => {
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  const providerName = provider.providerId.split('.')[0]; // 'google', 'facebook', 'github'
  return api.post('/auth/firebase', { idToken, provider: providerName });
};

export const loginWithGoogle   = () => oAuthWithPopup(googleProvider);
export const loginWithFacebook = () => oAuthWithPopup(facebookProvider);
export const loginWithGithub   = () => oAuthWithPopup(githubProvider);

// ─── Password management ─────────────────────────────────────────────────────

/** Send Firebase password reset email */
export const sendPasswordReset = (email) => sendPasswordResetEmail(auth, email);

/** Resend email verification to current Firebase user */
export const resendVerificationEmail = async () => {
  const firebaseUser = auth.currentUser;
  if (firebaseUser) await sendEmailVerification(firebaseUser);
};

/** Firebase sign out (clears Firebase session) */
export const firebaseLogout = () => firebaseSignOut(auth);

// ─── Profile ─────────────────────────────────────────────────────────────────

/** Fetch the authenticated user's own profile */
export const fetchMyProfile = () => api.get('/users/me');
