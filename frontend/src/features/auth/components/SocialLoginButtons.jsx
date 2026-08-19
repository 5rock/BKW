import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      fill="#1877F2"
      d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.414c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.263h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
    />
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.3c0 .32.21.7.83.58A12 12 0 0 0 12 .3Z" />
  </svg>
);

const providers = [
  { key: 'google', label: 'Google', icon: <GoogleIcon /> },
  { key: 'facebook', label: 'Facebook', icon: <FacebookIcon /> },
  { key: 'github', label: 'GitHub', icon: <GithubIcon /> },
];

const SocialLoginButtons = ({ mode = 'login' }) => {
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signInWithFacebook = useAuthStore((s) => s.signInWithFacebook);
  const signInWithGithub = useAuthStore((s) => s.signInWithGithub);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);

  const handlers = {
    google: signInWithGoogle,
    facebook: signInWithFacebook,
    github: signInWithGithub,
  };

  const handleOAuth = async (key) => {
    setBusy(key);
    try {
      const result = await handlers[key]();
      toast.success(`${mode === 'login' ? 'Signed in' : 'Account connected'} successfully`);
      navigate(result.redirect || '/', { replace: true });
    } catch (error) {
      if (error?.code === 'auth/popup-closed-by-user') {
        toast.info('Sign-in cancelled');
      } else {
        toast.error(error?.response?.data?.message || error?.message || `${key} sign-in failed`);
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {providers.map(({ key, label, icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => handleOAuth(key)}
          disabled={Boolean(busy)}
          className="group flex h-12 items-center justify-center gap-2 rounded-lg border border-black/[0.1] bg-white text-sm font-semibold text-[#1a1a1a] shadow-sm transition hover:-translate-y-0.5 hover:border-amber-600/35 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-none dark:hover:border-amber-300/45 dark:hover:bg-white/15"
          aria-label={`${mode === 'login' ? 'Sign in' : 'Sign up'} with ${label}`}
          title={label}
        >
          {busy === key ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default SocialLoginButtons;
