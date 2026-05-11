/**
 * SocialLoginButtons.jsx
 *
 * Google, Facebook, and GitHub OAuth login buttons.
 * Handles loading state and error toast per provider.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PROVIDERS = [
  {
    key:   'google',
    label: 'Continue with Google',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    bg:     'bg-white dark:bg-gray-800',
    border: 'border border-gray-200 dark:border-gray-700',
    text:   'text-gray-700 dark:text-gray-200',
  },
  {
    key:   'facebook',
    label: 'Continue with Facebook',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    bg:     'bg-[#1877F2]',
    border: '',
    text:   'text-white',
  },
  {
    key:   'github',
    label: 'Continue with GitHub',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    ),
    bg:     'bg-gray-900 dark:bg-gray-700',
    border: '',
    text:   'text-white',
  },
];

const SocialLoginButtons = ({ mode = 'login' }) => {
  const { signInWithGoogle, signInWithFacebook, signInWithGithub } = useAuth();
  const navigate  = useNavigate();
  const [busy, setBusy] = useState(null); // key of loading provider

  const handlers = {
    google:   signInWithGoogle,
    facebook: signInWithFacebook,
    github:   signInWithGithub,
  };

  const handleOAuth = async (key) => {
    setBusy(key);
    try {
      await handlers[key]();
      navigate('/');
    } catch (err) {
      const msg = err?.message || `${key} sign-in failed. Please try again.`;
      // Firebase: account-exists-with-different-credential
      if (err?.code === 'auth/account-exists-with-different-credential') {
        toast.error('An account already exists with a different sign-in method.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        toast('Sign-in cancelled', { icon: '👋' });
      } else {
        toast.error(msg);
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Divider */}
      <div className="flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs text-gray-400 font-medium">or {mode === 'login' ? 'sign in' : 'sign up'} with</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      {PROVIDERS.map(({ key, label, icon, bg, border, text }) => (
        <button
          key={key}
          type="button"
          onClick={() => handleOAuth(key)}
          disabled={!!busy}
          className={`
            w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-sm
            transition-all duration-200 hover:opacity-90 hover:shadow-md active:scale-[0.98]
            disabled:opacity-60 disabled:cursor-not-allowed
            ${bg} ${border} ${text}
          `}
        >
          {busy === key ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : icon}
          <span>{busy === key ? 'Connecting…' : label}</span>
        </button>
      ))}
    </div>
  );
};

export default SocialLoginButtons;
