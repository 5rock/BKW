/* eslint-disable react-refresh/only-export-components */
/**
 * AuthContext.jsx — Firebase-first complete rewrite
 *
 * Architecture:
 *  • Firebase Auth is the SINGLE source of truth for identity
 *  • Firestore stores the user profile + role (never from frontend input)
 *  • onAuthStateChanged drives all auth state reactively
 *  • Role-based flags: isAdmin, isSeller derived from Firestore doc
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, githubProvider, facebookProvider } from '../firebase/config';
import {
  getUserProfile,
  createUserProfile,
  getOrCreateProfile,
} from '../firebase/userService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null); // Firestore doc
  const [firebaseUser, setFirebaseUser] = useState(null); // Firebase user obj
  const [loading, setLoading] = useState(true);

  // ── Reactive auth state listener — runs once on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          let profile = await getUserProfile(fbUser.uid);
          // First-time OAuth user — auto-create Firestore doc
          if (!profile) {
            const provider = fbUser.providerData[0]?.providerId?.split('.')[0] || 'email';
            profile = await createUserProfile({
              uid:           fbUser.uid,
              name:          fbUser.displayName || fbUser.email.split('@')[0],
              email:         fbUser.email,
              avatar:        fbUser.photoURL || null,
              provider,
              emailVerified: fbUser.emailVerified,
            });
          }
          setUserProfile(profile);
        } catch (err) {
          console.error('Auth state profile fetch failed:', err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ─── Helper: navigate by role (returns the path, page handles navigation)
  const getRoleRedirect = useCallback((role) => {
    if (role === 'admin')  return '/admin';
    if (role === 'seller') return '/seller';
    return '/';
  }, []);

  // ─── Email / Password Register
  const register = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Set displayName in Firebase Auth
    await updateProfile(cred.user, { displayName: name });
    // Create Firestore profile (role resolved by backend logic in userService)
    const profile = await createUserProfile({
      uid:           cred.user.uid,
      name,
      email,
      provider:      'email',
      emailVerified: false,
    });
    // Send verification email
    try {
      await sendEmailVerification(cred.user);
    } catch {
      // Verification email failures should not block account creation.
    }
    return { user: profile, redirect: getRoleRedirect(profile.role) };
  };

  // ─── Email / Password Login
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Fetch fresh role from Firestore (not from token — Firestore is truth)
    const profile = await getUserProfile(cred.user.uid);
    return { user: profile, redirect: getRoleRedirect(profile?.role || 'customer') };
  };

  // ─── Google OAuth
  const signInWithGoogle = async () => {
    const result  = await signInWithPopup(auth, googleProvider);
    const profile = await getOrCreateProfile(result.user, 'google');
    return { user: profile, redirect: getRoleRedirect(profile.role) };
  };

  // ─── GitHub OAuth
  const signInWithGithub = async () => {
    const result  = await signInWithPopup(auth, githubProvider);
    const profile = await getOrCreateProfile(result.user, 'github');
    return { user: profile, redirect: getRoleRedirect(profile.role) };
  };

  // ─── Facebook OAuth
  const signInWithFacebook = async () => {
    const result  = await signInWithPopup(auth, facebookProvider);
    const profile = await getOrCreateProfile(result.user, 'facebook');
    return { user: profile, redirect: getRoleRedirect(profile.role) };
  };

  // ─── Password Reset
  const sendPasswordReset = async (email) => sendPasswordResetEmail(auth, email);

  // ─── Resend email verification
  const resendVerification = async () => {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  };

  // ─── Logout
  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setFirebaseUser(null);
    toast.success('Signed out successfully');
  };

  // ─── Derived permission flags — from Firestore doc only
  const role     = userProfile?.role     || 'customer';
  const isAdmin  = userProfile?.isAdmin  || role === 'admin';
  const isSeller = userProfile?.isSeller || role === 'seller' || role === 'admin';

  // ─── Normalize user object — same shape as before for Navbar/other components
  const user = userProfile ? {
    uid:           userProfile.uid,
    name:          userProfile.name,
    email:         userProfile.email,
    role,
    isAdmin,
    isSeller,
    avatar:        userProfile.avatar || null,
    emailVerified: firebaseUser?.emailVerified || userProfile.emailVerified || false,
    isBlocked:     userProfile.isBlocked || false,
  } : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        role,
        isAdmin,
        isSeller,
        getRoleRedirect,
        register,
        login,
        signInWithGoogle,
        signInWithGithub,
        signInWithFacebook,
        sendPasswordReset,
        resendVerification,
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
