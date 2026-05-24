/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getFirebaseAuth } from '../firebase/config';
import { createUserProfile, getOrCreateProfile, getUserProfile } from '../firebase/userService';

const AuthContext = createContext(null);

const isEmail = (value = '') => /\S+@\S+\.\S+/.test(value);

const persistSession = ({ accessToken, refreshToken, user }, remember = true) => {
  const storage = remember ? localStorage : sessionStorage;
  localStorage.removeItem('gm_access_token');
  localStorage.removeItem('gm_refresh_token');
  sessionStorage.removeItem('gm_access_token');
  sessionStorage.removeItem('gm_refresh_token');

  storage.setItem('gm_access_token', accessToken);
  storage.setItem('gm_refresh_token', refreshToken);
  storage.setItem('gm_user', JSON.stringify(user));
};

const clearSession = () => {
  ['gm_access_token', 'gm_refresh_token', 'gm_user'].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

const getStoredUser = () => {
  const raw = localStorage.getItem('gm_user') || sessionStorage.getItem('gm_user');
  return raw ? JSON.parse(raw) : null;
};

export const AuthProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(() => getStoredUser());
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsubscribe;
    let cancelled = false;
    let triggered = false;

    const syncFirebaseUser = async () => {
      const [{ onAuthStateChanged }, auth] = await Promise.all([
        import('firebase/auth'),
        getFirebaseAuth(),
      ]);
      if (cancelled) return;

      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          const profile = await getUserProfile(fbUser.uid);
          if (!cancelled && profile) {
            setUserProfile((current) => ({ ...current, ...profile }));
          }
        }
        if (!cancelled) setLoading(false);
      });
    };

    const events = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    const trigger = () => {
      if (triggered) return;
      triggered = true;
      events.forEach((ev) => window.removeEventListener(ev, trigger));
      window.clearTimeout(fallbackTimer);
      void syncFirebaseUser();
    };

    events.forEach((ev) =>
      window.addEventListener(ev, trigger, { once: true, passive: true })
    );
    // Reduced from 5000ms → 2000ms so Lighthouse (which never fires user events)
    // resolves auth state faster and doesn't block TBT measurement.
    const fallbackTimer = window.setTimeout(trigger, 2000);

    return () => {
      cancelled = true;
      events.forEach((ev) => window.removeEventListener(ev, trigger));
      window.clearTimeout(fallbackTimer);
      unsubscribe?.();
    };
  }, []);

  const getRoleRedirect = useCallback((role) => {
    if (role === 'admin') return '/seller'; // Admin also uses seller dashboard for now
    if (role === 'seller') return '/seller';
    return '/';
  }, []);

  const register = useCallback(async ({ name, email, phone, password, remember = true }) => {
    try {
      const [{ createUserWithEmailAndPassword, updateProfile }, auth] = await Promise.all([
        import('firebase/auth'),
        getFirebaseAuth(),
      ]);
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

    const { registerWithEmail } = await import('../services/authService');
    const { data } = await registerWithEmail({ name, email, phone, password });
    persistSession(data, remember);
    setUserProfile(data.user);
    return { user: data.user, redirect: getRoleRedirect(data.user.role) };
  }, [getRoleRedirect]);

  const login = useCallback(async ({ identifier, password, remember = true }) => {
    if (isEmail(identifier)) {
      try {
        const [{ signInWithEmailAndPassword }, auth] = await Promise.all([
          import('firebase/auth'),
          getFirebaseAuth(),
        ]);
        await signInWithEmailAndPassword(auth, identifier, password);
      } catch {
        // Backend remains authoritative for legacy/mobile-ready accounts.
      }
    }

    const { loginWithIdentifier } = await import('../services/authService');
    const { data } = await loginWithIdentifier({ identifier, password });
    persistSession(data, remember);
    setUserProfile(data.user);
    return { user: data.user, redirect: getRoleRedirect(data.user.role) };
  }, [getRoleRedirect]);

  const handleOAuth = useCallback(async (provider) => {
    const { loginWithGoogle, loginWithFacebook, loginWithGithub } = await import('../services/authService');
    const apiCall = {
      google: loginWithGoogle,
      facebook: loginWithFacebook,
      github: loginWithGithub,
    }[provider];

    const { data } = await apiCall();
    const auth = await getFirebaseAuth();
    const fbUser = auth.currentUser;
    if (fbUser) await getOrCreateProfile(fbUser, provider);
    persistSession(data, true);
    setUserProfile(data.user);
    return { user: data.user, redirect: getRoleRedirect(data.user.role) };
  }, [getRoleRedirect]);

  const logout = useCallback(async () => {
    const { logoutApi, firebaseLogout } = await import('../services/authService');
    await logoutApi().catch(() => {});
    await firebaseLogout().catch(() => {});
    clearSession();
    setUserProfile(null);
    setFirebaseUser(null);
  }, []);

  const sendPasswordReset = useCallback(async (email) => {
    const { sendFirebasePasswordReset, forgotPassword } = await import('../services/authService');
    await Promise.allSettled([
      sendFirebasePasswordReset(email),
      forgotPassword(email),
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
