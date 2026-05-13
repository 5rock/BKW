/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUserProfile, getOrCreateProfile, getUserProfile } from '../firebase/userService';
import {
  clearSession,
  firebaseLogout,
  getStoredUser,
  loginWithFacebook,
  loginWithGithub,
  loginWithGoogle,
  loginWithIdentifier,
  logoutApi,
  persistSession,
  registerWithEmail,
  sendFirebasePasswordReset,
} from '../services/authService';

const AuthContext = createContext(null);

const isEmail = (value = '') => /\S+@\S+\.\S+/.test(value);

export const AuthProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(() => getStoredUser());
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const profile = await getUserProfile(fbUser.uid);
        if (profile) {
          setUserProfile((current) => ({ ...current, ...profile }));
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getRoleRedirect = useCallback((role) => {
    if (role === 'admin') return '/seller'; // Admin also uses seller dashboard for now
    if (role === 'seller') return '/seller';
    return '/';
  }, []);

  const register = useCallback(async ({ name, email, phone, password, remember = true }) => {
    try {
      const firebaseCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(firebaseCredential.user, { displayName: name });
      await createUserProfile({
        uid: firebaseCredential.user.uid,
        name,
        email,
        phone,
        provider: 'email',
        emailVerified: false,
      });
    } catch (error) {
      if (!String(error?.code || '').includes('auth/email-already-in-use')) throw error;
    }

    const { data } = await registerWithEmail({ name, email, phone, password });
    persistSession(data, remember);
    setUserProfile(data.user);
    return { user: data.user, redirect: getRoleRedirect(data.user.role) };
  }, [getRoleRedirect]);

  const login = useCallback(async ({ identifier, password, remember = true }) => {
    if (isEmail(identifier)) {
      try {
        await signInWithEmailAndPassword(auth, identifier, password);
      } catch {
        // Backend remains authoritative for legacy/mobile-ready accounts.
      }
    }

    const { data } = await loginWithIdentifier({ identifier, password });
    persistSession(data, remember);
    setUserProfile(data.user);
    return { user: data.user, redirect: getRoleRedirect(data.user.role) };
  }, [getRoleRedirect]);

  const handleOAuth = useCallback(async (provider) => {
    const apiCall = {
      google: loginWithGoogle,
      facebook: loginWithFacebook,
      github: loginWithGithub,
    }[provider];

    const { data } = await apiCall();
    const fbUser = auth.currentUser;
    if (fbUser) await getOrCreateProfile(fbUser, provider);
    persistSession(data, true);
    setUserProfile(data.user);
    return { user: data.user, redirect: getRoleRedirect(data.user.role) };
  }, [getRoleRedirect]);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Local sign-out should still succeed if the API is unreachable.
    }
    await firebaseLogout().catch(() => {});
    clearSession();
    setUserProfile(null);
    setFirebaseUser(null);
  }, []);

  const sendPasswordReset = useCallback(async (email) => {
    await Promise.allSettled([
      sendFirebasePasswordReset(email),
      import('../services/authService').then(({ forgotPassword }) => forgotPassword(email)),
    ]);
  }, []);

  const role = userProfile?.role || 'customer';
  const value = useMemo(() => ({
    user: userProfile ? {
      ...userProfile,
      uid: firebaseUser?.uid || userProfile.uid,
      role,
      isAdmin: userProfile.isAdmin || role === 'admin',
      isSeller: userProfile.isSeller || role === 'seller' || role === 'admin',
      emailVerified: firebaseUser?.emailVerified || userProfile.isVerified || false,
    } : null,
    firebaseUser,
    loading,
    role,
    isAdmin: role === 'admin',
    isSeller: role === 'seller' || role === 'admin',
    getRoleRedirect,
    register,
    login,
    signInWithGoogle: () => handleOAuth('google'),
    signInWithFacebook: () => handleOAuth('facebook'),
    signInWithGithub: () => handleOAuth('github'),
    sendPasswordReset,
    logout,
  }), [firebaseUser, getRoleRedirect, handleOAuth, loading, login, logout, register, role, sendPasswordReset, userProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
