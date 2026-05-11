/**
 * ForgotPasswordPage.jsx
 *
 * Route: /forgot-password
 * Sends a Firebase password reset email.
 * Shows success state — no sensitive info leaked.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { sendPasswordReset } from '../../services/authService';
import AuthLayout from '../../components/auth/AuthLayout';

const ForgotPasswordPage = () => {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address'); return; }
    setLoading(true);
    setError('');
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      // Generic message — don't confirm whether email exists
      if (err?.code === 'auth/user-not-found') {
        setSent(true); // security: don't reveal email existence
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you reset instructions."
    >
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-emerald-500">mark_email_read</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your inbox</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              If <span className="font-semibold text-gray-700 dark:text-gray-200">{email}</span> is
              registered, you'll receive a reset link in the next few minutes.
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Didn't receive it? Check your spam folder or{' '}
              <button
                onClick={() => setSent(false)}
                className="text-amber-600 font-semibold hover:underline"
              >
                try again
              </button>.
            </p>
            <Link to="/login" className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 hover:underline">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to sign in
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4"
          >
            <div>
              <label htmlFor="forgot-email" className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">
                Email Address
              </label>
              <div className="relative mt-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="name@company.com"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border rounded-xl text-sm dark:text-white outline-none transition-all
                    ${error ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30'}`}
                />
              </div>
              {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">send</span> Send Reset Link</>
              )}
            </motion.button>

            <div className="text-center mt-4">
              <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to sign in
              </Link>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
