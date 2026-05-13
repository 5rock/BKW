import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, Phone, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthLayout from '../../components/auth/AuthLayout';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
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
        <div className="h-px flex-1 bg-white/12" />
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/60">secure login</span>
        <div className="h-px flex-1 bg-white/12" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="identifier" className="mb-2 block text-sm font-semibold text-amber-50/80">
            Email or Mobile Number
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-200/70" />
            <Phone className="absolute left-10 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-200/40" />
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              placeholder="you@example.com or +91 98765 43210"
              className="h-[52px] w-full rounded-lg border border-white/12 bg-black/25 py-3.5 pl-16 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-amber-300 focus:bg-black/35 focus:ring-4 focus:ring-amber-300/10"
              {...register('identifier', {
                required: 'Email or mobile number is required',
                validate: (value) => {
                  const trimmed = value.trim();
                  const phone = /^\+?[1-9]\d{7,14}$/.test(trimmed.replace(/\s|-/g, ''));
                  const email = /\S+@\S+\.\S+/.test(trimmed);
                  return email || phone || 'Enter a valid email or mobile number';
                },
              })}
            />
          </div>
          {errors.identifier && <p className="mt-1 text-xs text-red-300">{errors.identifier.message}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-semibold text-amber-50/80">Password</label>
            <Link to="/forgot-password" className="text-xs font-semibold text-amber-200 hover:text-amber-100">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-200/70" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-[52px] w-full rounded-lg border border-white/12 bg-black/25 py-3.5 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-amber-300 focus:bg-black/35 focus:ring-4 focus:ring-amber-300/10"
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-100/60 transition hover:text-amber-100"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-300">{errors.password.message}</p>}
        </div>

        <label className="flex items-center gap-3 text-sm text-amber-50/70">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-white/20 bg-black/30 text-amber-400 focus:ring-amber-300"
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

      <p className="mt-6 text-center text-sm text-amber-50/65">
        New to GoldMarket?{' '}
        <Link to="/signup" className="font-bold text-amber-200 hover:text-amber-100">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
