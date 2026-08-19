import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import Eye from 'lucide-react/dist/esm/icons/eye';
import EyeOff from 'lucide-react/dist/esm/icons/eye-off';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import LockKeyhole from 'lucide-react/dist/esm/icons/lock-keyhole';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Phone from 'lucide-react/dist/esm/icons/phone';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import toast from 'react-hot-toast';
import AuthLayout from '@/features/auth/components/AuthLayout';
import {
  authCheckboxClass,
  authCheckboxWrapClass,
  authDividerLineClass,
  authDividerTextClass,
  authErrorClass,
  authFooterLinkClass,
  authFooterWrapClass,
  authInlineIconClass,
  authInputClass,
  authLabelClass,
  authLinkClass,
  authTogglePasswordClass,
} from '@/features/auth/components/authFieldStyles';
import SocialLoginButtons from '@/features/auth/components/SocialLoginButtons';
import useAuthStore from '@/store/authStore';

const LoginPage = () => {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onChange',
    defaultValues: { identifier: '', password: '', remember: true },
  });

  const onSubmit = async (values) => {
    try {
      const result = await login(values);
      toast.success('Welcome back to GoldMarket');
      navigate(result.redirect || from, { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Invalid email, mobile number, or password');
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Access your premium marketplace account with email or mobile number.">
      <SocialLoginButtons mode="login" />

      <div className="my-6 flex items-center gap-3">
        <div className={`flex-1 ${authDividerLineClass}`} />
        <span className={authDividerTextClass}>secure login</span>
        <div className={`flex-1 ${authDividerLineClass}`} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="identifier" className={`mb-2 block ${authLabelClass}`}>
            Email or Mobile Number
          </label>
          <div className="relative">
            <Mail className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${authInlineIconClass}`} />
            <Phone className="absolute left-10 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-900/35 dark:text-amber-200/45" />
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              placeholder="you@example.com or +91 98765 43210"
              className={`${authInputClass} pl-16 pr-4`}
              {...register('identifier', {
                required: 'Email or mobile number is required',
                validate: (value) => {
                  const trimmed = value.trim();
                  const phone = /^\+?[1-9]\d{7,14}$/.test(trimmed.replace(/\s|-/g, ''));
                  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
                  return email || phone || 'Enter a valid email or mobile number';
                },
              })}
            />
          </div>
          {errors.identifier && <p className={authErrorClass}>{errors.identifier.message}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className={authLabelClass}>Password</label>
            <Link to="/forgot-password" className={authLinkClass}>
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockKeyhole className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${authInlineIconClass}`} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className={`${authInputClass} pl-12 pr-12`}
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 ${authTogglePasswordClass}`}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className={authErrorClass}>{errors.password.message}</p>}
        </div>

        <label className={authCheckboxWrapClass}>
          <input
            type="checkbox"
            className={authCheckboxClass}
            {...register('remember')}
          />
          Remember me on this device
        </label>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={{ scale: 0.98 }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 font-black text-[#211504] shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:shadow-amber-400/30 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
          Sign In Securely
        </motion.button>
      </form>

      <p className={authFooterWrapClass}>
        New to GoldMarket?{' '}
        <Link to="/signup" className={authFooterLinkClass}>
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
