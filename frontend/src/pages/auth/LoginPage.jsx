/**
 * LoginPage.jsx  (dedicated — no longer combined with signup)
 *
 * Routes: /login
 * Features: email/password, Google, Facebook, GitHub, remember me,
 *           show/hide password, forgot password link, animated transitions
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErr, setFieldErr] = useState({});

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFieldErr((f) => ({ ...f, [e.target.name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!form.email)    errors.email    = 'Email is required';
    if (!form.password) errors.password = 'Password is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErr(errors); return; }

    setLoading(true);
    const tid = toast.loading('Signing you in…');
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!', { id: tid });
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid email or password';
      toast.error(msg, { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your GoldMarket account">
      {/* Social buttons */}
      <SocialLoginButtons mode="login" />

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs text-gray-400 font-medium">or continue with email</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">
            Email Address
          </label>
          <div className="relative mt-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@company.com"
              className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border rounded-xl text-sm dark:text-white outline-none transition-all
                ${fieldErr.email ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30'}`}
            />
          </div>
          {fieldErr.email && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErr.email}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="login-password" className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">Password</label>
            <Link to="/forgot-password" className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">lock</span>
            <input
              id="login-password"
              name="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-gray-900 border rounded-xl text-sm dark:text-white outline-none transition-all
                ${fieldErr.password ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30'}`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              <span className="material-symbols-outlined text-[20px]">{showPw ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
          {fieldErr.password && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErr.password}</p>}
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-2 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white font-bold rounded-xl shadow-lg hover:shadow-amber-200/50 dark:hover:shadow-amber-900/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</>
          ) : (
            <><span className="material-symbols-outlined text-[18px]">login</span> Sign In</>
          )}
        </motion.button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Don't have an account?{' '}
        <Link to="/signup" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
          Create one free
        </Link>
      </p>

      <p className="text-center text-xs text-gray-400 mt-4">
        By signing in, you agree to our{' '}
        <a href="#" className="text-amber-600 hover:underline">Terms</a> and{' '}
        <a href="#" className="text-amber-600 hover:underline">Privacy Policy</a>.
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
