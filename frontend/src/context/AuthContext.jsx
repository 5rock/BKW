/**
 * AuthContext.jsx  (refactored)
 *
 * Provides auth state and actions to the entire app.
 * - Persists session via localStorage (access + refresh tokens)
 * - Validates session against backend on app load
 * - Exposes backend-set permission flags (isAdmin, isSeller)
 * - Never trusts frontend-determined roles
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchMyProfile, logoutApi, firebaseLogout } from '../services/authService';
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  loginWithFacebook,
  loginWithGithub,
} from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const TOKEN_KEY   = 'gm_access_token';
const REFRESH_KEY = 'gm_refresh_token';
const USER_KEY    = 'gm_user';

const persistSession = (accessToken, refreshToken, user) => {
  localStorage.setItem(TOKEN_KEY,   accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(USER_KEY,    JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── On mount: restore session then validate with backend
  useEffect(() => {
    const restore = async () => {
      const storedUser  = localStorage.getItem(USER_KEY);
      const accessToken = localStorage.getItem(TOKEN_KEY);

      if (storedUser && accessToken) {
        setUser(JSON.parse(storedUser)); // optimistic UI restore
        try {
          const { data } = await fetchMyProfile();
          setUser(data); // replace with fresh backend data
          localStorage.setItem(USER_KEY, JSON.stringify(data));
        } catch {
          // Token expired or invalid — api.js interceptor will attempt refresh
          // If refresh also fails, interceptor redirects to /login
        }
      }
      setLoading(false);
    };
    restore();
  }, []);

  // ─── Session helpers ────────────────────────────────────────────────────────

  const handleAuthResponse = useCallback(({ data }) => {
    const { accessToken, refreshToken, user: u } = data;
    persistSession(accessToken, refreshToken, u);
    setUser(u);
    return u;
  }, []);

  // ─── Actions ────────────────────────────────────────────────────────────────

  /** Email/password signup — sends NO role field */
  const register = async (name, email, password) => {
    const res = await registerWithEmail(name, email, password);
    return handleAuthResponse(res);
  };

  /** Email/password login */
  const login = async (email, password) => {
    const res = await loginWithEmail(email, password);
    return handleAuthResponse(res);
  };

  /** Google OAuth */
  const signInWithGoogle = async () => {
    const res = await loginWithGoogle();
    return handleAuthResponse(res);
  };

  /** Facebook OAuth */
  const signInWithFacebook = async () => {
    const res = await loginWithFacebook();
    return handleAuthResponse(res);
  };

  /** GitHub OAuth */
  const signInWithGithub = async () => {
    const res = await loginWithGithub();
    return handleAuthResponse(res);
  };

  /** Logout — clears both Firebase session and backend session */
  const logout = async () => {
    try {
      await Promise.allSettled([logoutApi(), firebaseLogout()]);
    } finally {
      clearSession();
      setUser(null);
      toast.success('Signed out successfully');
    }
  };

  // ── Derived permission flags — from backend-set user object, NEVER frontend logic
  const isAdmin  = user?.isAdmin  ?? false;
  const isSeller = user?.isSeller ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isSeller,
        register,
        login,
        signInWithGoogle,
        signInWithFacebook,
        signInWithGithub,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
