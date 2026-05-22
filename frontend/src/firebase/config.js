const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123:web:abc',
};

let appPromise;
let authPromise;
let firestorePromise;
let storagePromise;
let providersPromise;

export const getFirebaseApp = async () => {
  if (!appPromise) {
    appPromise = import('firebase/app').then(({ initializeApp, getApps, getApp }) =>
      getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    );
  }
  return appPromise;
};

export const getFirebaseAuth = async () => {
  if (!authPromise) {
    authPromise = Promise.all([getFirebaseApp(), import('firebase/auth')]).then(
      async ([app, { getAuth, setPersistence, browserLocalPersistence }]) => {
        const auth = getAuth(app);
        await setPersistence(auth, browserLocalPersistence).catch(() => {});
        return auth;
      }
    );
  }
  return authPromise;
};

export const getFirestoreDb = async () => {
  if (!firestorePromise) {
    firestorePromise = Promise.all([getFirebaseApp(), import('firebase/firestore')]).then(
      ([app, { getFirestore }]) => getFirestore(app)
    );
  }
  return firestorePromise;
};

export const getFirebaseStorage = async () => {
  if (!storagePromise) {
    storagePromise = Promise.all([getFirebaseApp(), import('firebase/storage')]).then(
      ([app, { getStorage }]) => getStorage(app)
    );
  }
  return storagePromise;
};

export const getOAuthProviders = async () => {
  if (!providersPromise) {
    providersPromise = import('firebase/auth').then(({ GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider }) => {
      const googleProvider = new GoogleAuthProvider();
      const githubProvider = new GithubAuthProvider();
      const facebookProvider = new FacebookAuthProvider();

      googleProvider.addScope('email');
      googleProvider.addScope('profile');
      facebookProvider.addScope('email');

      return { googleProvider, githubProvider, facebookProvider };
    });
  }
  return providersPromise;
};
