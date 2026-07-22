import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getFirebaseAuth } from '@/firebase/config';
import { createUserProfile, getOrCreateProfile, getUserProfile } from '@/firebase/userService';

const isEmail = (value = '') => /\S+@\S+\.\S+/.test(value);

const persistSession = ({ user }, remember = true) => {
  const storage = remember ? localStorage : sessionStorage;
  localStorage.removeItem('gm_user');
  sessionStorage.removeItem('gm_user');
  storage.setItem('gm_user', JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem('gm_user');
  sessionStorage.removeItem('gm_user');
};

const getRoleRedirect = (role) => {
  if (role === 'admin') return '/seller'; // Or /admin in the future
  if (role === 'seller') return '/seller';
  return '/';
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      userProfile: null,
      firebaseUser: null,
      loading: true,

      // Derived states
      get user() {
        const { userProfile, firebaseUser } = get();
        if (!userProfile) return null;
        const role = userProfile.role || 'customer';
        return {
          ...userProfile,
          uid: firebaseUser?.uid || userProfile.uid,
          role,
          isAdmin: userProfile.isAdmin || role === 'admin',
          isSeller: userProfile.isSeller || role === 'seller' || role === 'admin',
          emailVerified: firebaseUser?.emailVerified || userProfile.isVerified || false,
        };
      },

      get role() { return get().user?.role || 'customer'; },
      get isAdmin() { return get().user?.isAdmin || false; },
      get isSeller() { return get().user?.isSeller || false; },

      // Actions
      syncFirebaseUser: async () => {
        let cancelled = false;
        try {
          const [{ onAuthStateChanged }, auth] = await Promise.all([
            import('firebase/auth'),
            getFirebaseAuth(),
          ]);

          onAuthStateChanged(auth, async (fbUser) => {
            if (cancelled) return;
            set({ firebaseUser: fbUser });
            if (fbUser) {
              const profile = await getUserProfile(fbUser.uid);
              if (profile) {
                set((state) => ({ userProfile: { ...state.userProfile, ...profile } }));
              }
            }
            set({ loading: false });
          });
        } catch (error) {
          console.error('Firebase sync failed', error);
          set({ loading: false });
        }
        return () => { cancelled = true; };
      },

      register: async ({ name, email, phone, password, remember = true }) => {
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

        const { registerWithEmail } = await import('@/services/authService');
        const { data } = await registerWithEmail({ name, email, phone, password });
        persistSession(data, remember);
        set({ userProfile: data.user });
        return { user: data.user, redirect: getRoleRedirect(data.user.role) };
      },

      login: async ({ identifier, password, remember = true }) => {
        if (isEmail(identifier)) {
          try {
            const [{ signInWithEmailAndPassword }, auth] = await Promise.all([
              import('firebase/auth'),
              getFirebaseAuth(),
            ]);
            await signInWithEmailAndPassword(auth, identifier, password);
          } catch {
            // Backend fallback
          }
        }

        const { loginWithIdentifier } = await import('@/services/authService');
        const { data } = await loginWithIdentifier({ identifier, password });
        persistSession(data, remember);
        set({ userProfile: data.user });
        return { user: data.user, redirect: getRoleRedirect(data.user.role) };
      },

      handleOAuth: async (provider) => {
        const { loginWithGoogle, loginWithFacebook, loginWithGithub } = await import('@/services/authService');
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
        set({ userProfile: data.user });
        return { user: data.user, redirect: getRoleRedirect(data.user.role) };
      },

      logout: async () => {
        const { logoutApi, firebaseLogout } = await import('@/services/authService');
        await logoutApi().catch(() => {});
        await firebaseLogout().catch(() => {});
        clearSession();
        set({ userProfile: null, firebaseUser: null });
      },

      sendPasswordReset: async (email) => {
        const { sendFirebasePasswordReset, forgotPassword } = await import('@/services/authService');
        await Promise.allSettled([
          sendFirebasePasswordReset(email),
          forgotPassword(email),
        ]);
      },
    }),
    {
      name: 'goldmarket_auth_store',
      partialize: (state) => ({ userProfile: state.userProfile }), // Persist only userProfile
      onRehydrateStorage: () => (state) => {
        if (state) state.loading = true; // reset loading on boot until firebase resolves
      },
    }
  )
);

// We need to trigger sync on boot.
let authSynced = false;
export const initAuth = () => {
  if (authSynced) return;
  authSynced = true;
  useAuthStore.getState().syncFirebaseUser();
};

export default useAuthStore;
