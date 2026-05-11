/**
 * firebase.js
 *
 * Firebase SDK initialization and provider instances.
 * Replace the firebaseConfig values with your actual Firebase project settings.
 * Get them from: Firebase Console → Project Settings → Your Apps → Web app
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';

// 🔧 Replace with your actual Firebase config
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'YOUR_API_KEY',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'your-app.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'your-project-id',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'your-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:123456789:web:abc',
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

// OAuth providers
const googleProvider   = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const githubProvider   = new GithubAuthProvider();

// Request email scope for providers that need it
googleProvider.addScope('email');
googleProvider.addScope('profile');
facebookProvider.addScope('email');

export { auth, googleProvider, facebookProvider, githubProvider };
