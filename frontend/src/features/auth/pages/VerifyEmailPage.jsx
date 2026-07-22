/**
 * VerifyEmailPage.jsx
 *
 * Route: /verify-email
 * Shown after registration when emailVerified === false.
 * Allows resending the verification email.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { resendVerificationEmail } from '@/services/authService';
import useAuthStore from '@/store/authStore';
import AuthLayout from '@/features/auth/components/AuthLayout';

const VerifyEmailPage = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate          = useNavigate();
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setSending(true);
    try {
      await resendVerificationEmail();
      toast.success('Verification email sent! Check your inbox.');
      // 60-second cooldown
      let secs = 60;
      setCooldown(secs);
      const timer = setInterval(() => {
        secs -= 1;
        setCooldown(secs);
        if (secs <= 0) clearInterval(timer);
      }, 1000);
    } catch {
      toast.error('Failed to resend. Please try again in a moment.');
    } finally {
      setSending(false);
    }
  };

  const handleContinue = () => navigate('/');

  return (
    <AuthLayout title="Verify your email" subtitle="Almost there — one more step.">
      <div className="text-center py-4">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="w-24 h-24 mx-auto mb-6 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-6xl text-amber-500">forward_to_inbox</span>
        </motion.div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
          We've sent a verification link to:
        </p>
        <p className="font-bold text-gray-900 dark:text-white text-base mb-6">
          {user?.email || 'your email address'}
        </p>

        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left mb-6">
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">info</span>
            What to do next
          </p>
          <ol className="text-xs text-amber-700 dark:text-amber-400 space-y-1 list-decimal list-inside">
            <li>Open the email from GoldMarket</li>
            <li>Click the verification link</li>
            <li>Return here and click "I've verified"</li>
          </ol>
        </div>

        <button
          onClick={handleContinue}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white font-bold rounded-xl shadow-lg transition-all mb-3 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          I've verified — Continue
        </button>

        <button
          onClick={handleResend}
          disabled={sending || cooldown > 0}
          className="w-full py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 text-sm"
        >
          {sending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
        </button>

        <button
          onClick={logout}
          className="mt-4 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors underline"
        >
          Sign out and use a different account
        </button>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
