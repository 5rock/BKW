/**
 * AuthLayout.jsx
 *
 * Shared two-panel layout used by all auth pages:
 * - Left: premium brand panel (hidden on mobile)
 * - Right: form area (slot via children)
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  { icon: 'verified',       label: 'Verified Merchants',   desc: 'Every seller manually reviewed' },
  { icon: 'security',       label: 'Secure Escrow',        desc: 'Funds held until delivery confirmed' },
  { icon: 'workspace_premium', label: 'Premium Quality',   desc: 'Curated authentic gold products' },
  { icon: 'support_agent',  label: '24/7 Support',         desc: 'Expert help whenever you need it' },
];

const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen flex flex-col md:flex-row font-sans">
    {/* ── Left brand panel ── */}
    <div className="hidden md:flex md:w-[45%] relative overflow-hidden bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-400 items-center justify-center p-12">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-900/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-10 group">
          <span className="material-symbols-outlined text-4xl text-white">diamond</span>
          <span className="text-3xl font-black text-white tracking-tight">GoldMarket</span>
        </Link>

        <h1 className="text-4xl font-bold text-white leading-tight mb-4">
          The world's most trusted premium marketplace.
        </h1>
        <p className="text-white/80 text-lg mb-10 leading-relaxed">
          Quality meets absolute reliability — every transaction secured.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/25 hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl text-white mb-2 block">{f.icon}</span>
              <p className="text-white font-semibold text-sm">{f.label}</p>
              <p className="text-white/70 text-xs mt-0.5">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {['A', 'B', 'C'].map((l) => (
              <div key={l} className="w-8 h-8 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                {l}
              </div>
            ))}
          </div>
          <p className="text-white/80 text-sm">Join <span className="font-bold text-white">50,000+</span> verified customers</p>
        </div>
      </div>
    </div>

    {/* ── Right form panel ── */}
    <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2 justify-center mb-8">
          <span className="material-symbols-outlined text-amber-500 text-3xl">diamond</span>
          <Link to="/" className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">GoldMarket</Link>
        </div>

        {(title || subtitle) && (
          <div className="mb-8">
            {title   && <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>}
            {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{subtitle}</p>}
          </div>
        )}

        {children}
      </motion.div>
    </div>
  </div>
);

export default AuthLayout;
