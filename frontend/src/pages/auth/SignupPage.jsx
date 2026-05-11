/**
 * SignupPage.jsx  (dedicated — no role selection)
 *
 * Route: /signup
 * Collects ONLY: Full Name, Email, Password
 * Role is decided entirely by the backend.
 * Features: password strength meter, social signup, field validation, toast
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';

const SignupPage = () => {
  const { register } = useAuth();
  const navigate      = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [fieldErr, setFieldErr] = useState({});

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFieldErr((f) => ({ ...f, [e.target.name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim())            errors.name     = 'Full name is required';
    if (!form.email)                  errors.email    = 'Email is required';
    if (!form.password)               errors.password = 'Password is required';
    else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(form.password)) errors.password = 'Must contain at least one uppercase letter';
    else if (!/[0-9]/.test(form.password)) errors.password = 'Must contain at least one number';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErr(errors); return; }

    setLoading(true);
    const tid = toast.loading('Creating your account…');
    try {
      // ✅ NO role sent — backend decides based on email
      await register(form.name.trim(), form.email, form.password);
      toast.success('Account created! Welcome to GoldMarket 🎉', { id: tid, duration: 4000 });
      navigate('/');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg, { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join GoldMarket — it's free">
      {/* Social signup */}
      <SocialLoginButtons mode="signup" />

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <div>
          <label htmlFor="signup-name" className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">
            Full Name
          </label>
          <div className="relative mt-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">person</span>
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border rounded-xl text-sm dark:text-white outline-none transition-all
                ${fieldErr.name ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30'}`}
            />
          </div>
          {fieldErr.name && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErr.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">
            Email Address
          </label>
          <div className="relative mt-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
            <input
              id="signup-email"
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
          <label htmlFor="signup-password" className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">
            Password
          </label>
          <div className="relative mt-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">lock</span>
            <input
              id="signup-password"
              name="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
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
          {fieldErr.password
            ? <p className="text-xs text-red-500 mt-1 ml-1">{fieldErr.password}</p>
            : <PasswordStrengthMeter password={form.password} />
          }
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-2 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white font-bold rounded-xl shadow-lg hover:shadow-amber-200/50 dark:hover:shadow-amber-900/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account…</>
          ) : (
            <><span className="material-symbols-outlined text-[18px]">person_add</span> Create Free Account</>
          )}
        </motion.button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
        By creating an account, you agree to our{' '}
        <a href="#" className="text-amber-600 hover:underline">Terms of Service</a> and{' '}
        <a href="#" className="text-amber-600 hover:underline">Privacy Policy</a>.
      </p>
    </AuthLayout>
  );
};

export default SignupPage;
