import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        await register(form.name, form.email, form.password, form.role);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-primary items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/30 to-secondary/20 pointer-events-none" />
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5YSDOAsxaRKpU1t-HbOnJZTpFjajWknXj7zmzhl868f_kZtjAW0Am2LXOu-xMhnI55n4487Wcb8N7bn20nkyu1TJ8swOA8QjxIEsJnzSSpZlyzipN9PCfkbUX5YlcBMFT5C0Ps_M_Cp04YAcP-piBLUKQdWfGm-byGDVaqI9Wl1xw1VUZJ65q6mMWn7mDplmJpHQXbYRT-vCuWkHe4P07S-sTHU0l0Pk33YW_ia558YJLIX4syb6yPlePMrXmnS5KsovBvNTEjxIB"
          alt="Liquid gold"
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
        />
        <div className="relative z-10 max-w-md text-center">
          <Link to="/" className="text-5xl font-black text-white tracking-tighter block mb-4">GoldMarket</Link>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">Secure your future in every transaction.</h1>
          <p className="text-white/90 text-lg mb-10">Join the world's most trusted premium marketplace where quality meets absolute reliability.</p>
          <div className="grid grid-cols-2 gap-4">
            {[{ icon: 'verified', label: 'Verified Merchants' }, { icon: 'security', label: 'Secure Escrow' }].map((item) => (
              <div key={item.label} className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-white">
                <span className="material-symbols-outlined text-3xl mb-2 block">{item.icon}</span>
                <p className="text-sm font-semibold">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-surface dark:bg-gray-950">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-8">
            <Link to="/" className="text-3xl font-black text-primary tracking-tighter">GoldMarket</Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {mode === 'login' ? 'Please enter your details to sign in.' : 'Start your GoldMarket journey today.'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-8">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'login' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}
            >Login</button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'register' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}
            >Sign Up</button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>{error}
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-gray-500 ml-1">Full Name</label>
                <div className="relative mt-1">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">person</span>
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm dark:text-white transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-500 ml-1">Email Address</label>
              <div className="relative mt-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm dark:text-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-gray-500 ml-1">Password</label>
                {mode === 'login' && <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm dark:text-white transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined text-base">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-gray-500 ml-1">Account Type</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full mt-1 py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-xl focus:border-primary outline-none text-sm dark:text-white"
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-container text-on-primary-container font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-primary hover:text-white transition-all active:scale-95 mt-6 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Processing...</>
              ) : (
                mode === 'login' ? 'Sign In to Account' : 'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary font-semibold hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-primary font-semibold hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
