import api from './api';
import { getFirebaseAuth, getOAuthProviders } from '../firebase/config';

export const persistSession = ({ accessToken, refreshToken, user }, remember = true) => {
  const storage = remember ? localStorage : sessionStorage;
  localStorage.removeItem('gm_access_token');
  localStorage.removeItem('gm_refresh_token');
  sessionStorage.removeItem('gm_access_token');
  sessionStorage.removeItem('gm_refresh_token');

  storage.setItem('gm_access_token', accessToken);
  storage.setItem('gm_refresh_token', refreshToken);
  storage.setItem('gm_user', JSON.stringify(user));
};

export const clearSession = () => {
  ['gm_access_token', 'gm_refresh_token', 'gm_user'].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const getStoredUser = () => {
  const raw = localStorage.getItem('gm_user') || sessionStorage.getItem('gm_user');
  return raw ? JSON.parse(raw) : null;
};

export const registerWithEmail = ({ name, email, phone, password }) =>
  api.post('/auth/register', { name, email, phone, password });

export const loginWithIdentifier = ({ identifier, password }) =>
  api.post('/auth/login', { identifier, password });

export const refreshAccessToken = (refreshToken) =>
  api.post('/auth/refresh', { refreshToken });

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = ({ token, password, confirmPassword }) =>
  api.patch(`/auth/reset-password/${token}`, { password, confirmPassword });

export const logoutApi = () => api.post('/auth/logout');

const oAuthWithPopup = async (provider) => {
  const [{ signInWithPopup }, auth] = await Promise.all([
    import('firebase/auth'),
    getFirebaseAuth(),
  ]);
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  const providerName = provider.providerId.split('.')[0];
  return api.post('/auth/firebase', { idToken, provider: providerName });
};

export const loginWithGoogle = async () => {
  const { googleProvider } = await getOAuthProviders();
  return oAuthWithPopup(googleProvider);
};

export const loginWithFacebook = async () => {
  const { facebookProvider } = await getOAuthProviders();
  return oAuthWithPopup(facebookProvider);
};

export const loginWithGithub = async () => {
  const { githubProvider } = await getOAuthProviders();
  return oAuthWithPopup(githubProvider);
};

export const sendFirebasePasswordReset = async (email) => {
  const [{ sendPasswordResetEmail }, auth] = await Promise.all([
    import('firebase/auth'),
    getFirebaseAuth(),
  ]);
  return sendPasswordResetEmail(auth, email);
};
export const sendPasswordReset = sendFirebasePasswordReset;

export const resendVerificationEmail = async () => {
  const [{ sendEmailVerification }, auth] = await Promise.all([
    import('firebase/auth'),
    getFirebaseAuth(),
  ]);
  if (auth.currentUser) await sendEmailVerification(auth.currentUser);
};

export const firebaseLogout = async () => {
  const [{ signOut }, auth] = await Promise.all([
    import('firebase/auth'),
    getFirebaseAuth(),
  ]);
  return signOut(auth);
};
