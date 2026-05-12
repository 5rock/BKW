/**
 * firebase/config.js
 *
 * Single source of truth for Firebase initialization.
 * Exports: auth, db (Firestore), and all OAuth providers.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'YOUR_API_KEY',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'your-app.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'your-project-id',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'your-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:123:web:abc',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db   = getFirestore(app);
export const storage = getStorage(app);

// Persist login across browser sessions
setPersistence(auth, browserLocalPersistence).catch(() => {});

// OAuth Providers
export const googleProvider   = new GoogleAuthProvider();
export const githubProvider   = new GithubAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

googleProvider.addScope('email');
googleProvider.addScope('profile');
facebookProvider.addScope('email');
