/**
 * ResetPasswordPage.jsx
 *
 * Route: /reset-password
 * Firebase handles the reset token in the URL (?oobCode=...).
 * This page confirms the new password and completes the reset.
 */

import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirebaseAuth } from '@/firebase/config';
import AuthLayout from '@/features/auth/components/AuthLayout';
import PasswordStrengthMeter from '@/features/auth/components/PasswordStrengthMeter';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const oobCode  = params.get('oobCode');

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.password)              e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'At least 8 characters required';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Must have an uppercase letter';
    else if (!/\d/.test(form.password)) e.password = 'Must include a number';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    if (!oobCode) {
      toast.error('Invalid or expired reset link. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      const [{ confirmPasswordReset, verifyPasswordResetCode }, auth] = await Promise.all([
        import('firebase/auth'),
        getFirebaseAuth(),
      ]);
      await verifyPasswordResetCode(auth, oobCode);
      await confirmPasswordReset(auth, oobCode, form.password);
      setDone(true);
    } catch (err) {
      const msg =
        err.code === 'auth/expired-action-code'
          ? 'Reset link has expired. Please request a new one.'
          : err.code === 'auth/invalid-action-code'
          ? 'Invalid reset link. Please request a new one.'
          : 'Password reset failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong password for your account.">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-emerald-500">lock_reset</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password updated!</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Your password has been successfully changed. You can now sign in with your new password.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Sign in now
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
            {!oobCode && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500 text-[20px] mt-0.5">error</span>
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">Invalid reset link</p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                    This link is invalid or has expired.{' '}
                    <Link to="/forgot-password" className="underline font-medium">Request a new one</Link>.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="reset-password" className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">
                New Password
              </label>
              <div className="relative mt-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">lock</span>
                <input
                  id="reset-password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setErrors((er) => ({ ...er, password: '' })); }}
                  placeholder="Min. 8 characters"
                  className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-gray-900 border rounded-xl text-sm dark:text-white outline-none transition-all ${
                    errors.password ? 'border-red-400' : 'border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password
                ? <p className="text-xs text-red-500 mt-1 ml-1">{errors.password}</p>
                : <PasswordStrengthMeter password={form.password} />
              }
            </div>

            <div>
              <label htmlFor="reset-confirm" className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">lock_clock</span>
                <input
                  id="reset-confirm"
                  name="confirm"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={(e) => { setForm((f) => ({ ...f, confirm: e.target.value })); setErrors((er) => ({ ...er, confirm: '' })); }}
                  placeholder="Repeat password"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border rounded-xl text-sm dark:text-white outline-none transition-all ${
                    errors.confirm ? 'border-red-400' : 'border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30'
                  }`}
                />
              </div>
              {errors.confirm && <p className="text-xs text-red-500 mt-1 ml-1">{errors.confirm}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={loading || !oobCode}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating…</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">lock_reset</span> Reset Password</>
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
