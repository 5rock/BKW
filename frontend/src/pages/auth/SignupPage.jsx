import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Controller, useForm, useWatch } from 'react-hook-form';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthLayout from '../../components/auth/AuthLayout';
import {
  authCheckboxClass,
  authCheckboxWrapStartClass,
  authDividerLineClass,
  authDividerTextClass,
  authErrorClass,
  authFooterLinkClass,
  authFooterWrapClass,
  authInlineIconClass,
  authInputClass,
  authLabelClass,
  authTogglePasswordClass,
} from '../../components/auth/authFieldStyles';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';
import { useAuth } from '../../context/AuthContext';

const passwordRules = {
  minLength: 'At least 8 characters',
  upper: 'One uppercase letter',
  lower: 'One lowercase letter',
  number: 'One number',
  symbol: 'One symbol',
};

const scorePassword = (password = '') =>
  [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

const SignupPage = () => {
  const { register: createAccount } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: false,
      remember: true,
    },
  });

  const password = useWatch({ control, name: 'password' });
  const strength = useMemo(() => scorePassword(password), [password]);

  const onSubmit = async (values) => {
    try {
      const result = await createAccount({
        ...values,
        phone: values.phone ? `+${values.phone.replace(/^\+/, '')}` : '',
      });
      toast.success('Your GoldMarket account is ready');
      navigate(result.redirect || '/', { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Registration failed');
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Open a verified customer profile with email, phone, and secure password protection.">
      <SocialLoginButtons mode="signup" />

      <div className="my-6 flex items-center gap-3">
        <div className={`flex-1 ${authDividerLineClass}`} />
        <span className={authDividerTextClass}>membership details</span>
        <div className={`flex-1 ${authDividerLineClass}`} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className={`mb-2 block ${authLabelClass}`}>Full Name</label>
          <div className="relative">
            <UserRound className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${authInlineIconClass}`} />
            <input
              id="name"
              autoComplete="name"
              placeholder="Aarav Mehta"
              className={`${authInputClass} pl-12 pr-4`}
              {...register('name', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
            />
          </div>
          {errors.name && <p className={authErrorClass}>{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className={`mb-2 block ${authLabelClass}`}>Email Address</label>
          <div className="relative">
            <Mail className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${authInlineIconClass}`} />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={`${authInputClass} pl-12 pr-4`}
              {...register('email', {
                required: 'Email address is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email address' },
              })}
            />
          </div>
          {errors.email && <p className={authErrorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <label className={`mb-2 block ${authLabelClass}`}>Mobile Number</label>
          <Controller
            name="phone"
            control={control}
            rules={{
              required: 'Mobile number is required',
              validate: (value) => value?.length >= 10 || 'Enter a valid mobile number',
            }}
            render={({ field }) => (
              <PhoneInput
                country="in"
                value={field.value}
                onChange={field.onChange}
                enableSearch
                inputProps={{ name: 'phone', autoComplete: 'tel' }}
                containerClass="gold-phone-container"
                inputClass="gold-phone-input"
                buttonClass="gold-phone-button"
                dropdownClass="gold-phone-dropdown"
              />
            )}
          />
          {errors.phone && <p className={authErrorClass}>{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className={`mb-2 block ${authLabelClass}`}>Password</label>
          <div className="relative">
            <LockKeyhole className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${authInlineIconClass}`} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a strong password"
              className={`${authInputClass} pl-12 pr-12`}
              {...register('password', {
                required: 'Password is required',
                validate: {
                  minLength: (value) => value.length >= 8 || passwordRules.minLength,
                  upper: (value) => /[A-Z]/.test(value) || passwordRules.upper,
                  lower: (value) => /[a-z]/.test(value) || passwordRules.lower,
                  number: (value) => /\d/.test(value) || passwordRules.number,
                  symbol: (value) => /[^A-Za-z0-9]/.test(value) || passwordRules.symbol,
                },
              })}
            />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className={`absolute right-4 top-1/2 -translate-y-1/2 ${authTogglePasswordClass}`} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <PasswordStrengthMeter password={password} />
          {errors.password && <p className={authErrorClass}>{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className={`mb-2 block ${authLabelClass}`}>Confirm Password</label>
          <div className="relative">
            <CheckCircle2 className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${authInlineIconClass}`} />
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter password"
              className={`${authInputClass} pl-12 pr-12`}
              {...register('confirmPassword', {
                required: 'Confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            <button type="button" onClick={() => setShowConfirm((value) => !value)} className={`absolute right-4 top-1/2 -translate-y-1/2 ${authTogglePasswordClass}`} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
              {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className={authErrorClass}>{errors.confirmPassword.message}</p>}
        </div>

        <label className={authCheckboxWrapStartClass}>
          <input
            type="checkbox"
            className={`mt-1 ${authCheckboxClass}`}
            {...register('terms', { required: 'You must accept the terms and conditions' })}
          />
          <span>I agree to the Terms & Conditions and Privacy Policy.</span>
        </label>
        {errors.terms && <p className={`${authErrorClass} -mt-2`}>{errors.terms.message}</p>}

        <motion.button
          type="submit"
          disabled={isSubmitting || strength < 5}
          whileTap={{ scale: 0.98 }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 font-black text-[#211504] shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:shadow-amber-400/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
          Create Secure Account
        </motion.button>
      </form>

      <p className={authFooterWrapClass}>
        Already have an account?{' '}
        <Link to="/login" className={authFooterLinkClass}>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignupPage;
