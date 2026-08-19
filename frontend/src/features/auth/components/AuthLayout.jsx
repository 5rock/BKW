import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BadgeCheck from 'lucide-react/dist/esm/icons/badge-check';
import Gem from 'lucide-react/dist/esm/icons/gem';
import LockKeyhole from 'lucide-react/dist/esm/icons/lock-keyhole';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';

const trustItems = [
  { icon: ShieldCheck, label: 'Bank-grade security' },
  { icon: BadgeCheck, label: 'Verified sellers' },
  { icon: LockKeyhole, label: 'Protected checkout' },
];

const AuthLayout = ({ children, title, subtitle }) => (
  <main className="theme-page relative min-h-screen overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(184,120,54,0.16),transparent_34%),linear-gradient(135deg,#f4ece4_0%,#ead8c8_48%,#f1e7dc_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.24),transparent_34%),linear-gradient(135deg,#090704_0%,#221507_46%,#0d0b09_100%)]" />
    <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(61,47,38,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(61,47,38,0.05)_1px,transparent_1px)] [background-size:64px_64px] dark:[background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)]" />

    {new Array(18).fill(null).map((_, index) => (
      <motion.span
        key={`sparkle-${index}`}
        className="absolute h-1 w-1 rounded-full bg-amber-200/70"
        style={{
          left: `${8 + ((index * 47) % 86)}%`,
          top: `${10 + ((index * 31) % 78)}%`,
        }}
        animate={{ opacity: [0.15, 0.85, 0.15], y: [0, -18, 0] }}
        transition={{ duration: 4 + (index % 5), repeat: Infinity, delay: index * 0.2 }}
      />
    ))}

    <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
      <section className="hidden px-10 py-10 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex w-fit items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-300/30 bg-amber-300/15">
            <Gem className="h-7 w-7 text-amber-800 dark:text-amber-200" />
          </span>
          <span className="text-2xl font-black tracking-[0.18em] text-[#2d2926] dark:text-amber-50">GOLDMARKET</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl"
        >
          <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-amber-700/20 bg-amber-800/10 px-4 py-2 text-sm text-amber-900 dark:border-amber-200/20 dark:bg-black/20 dark:text-amber-100">
            <Sparkles className="h-4 w-4" />
            Premium gold commerce, secured end to end
          </div>
          <h1 className="theme-text text-5xl font-black leading-tight tracking-normal">
            A private vault entrance for serious buyers and trusted sellers.
          </h1>
          <p className="theme-muted mt-6 max-w-lg text-lg leading-8">
            Sign in to manage orders, wishlists, seller tools, and high-value transactions with a polished authentication flow.
          </p>
        </motion.div>

        <div className="grid max-w-2xl grid-cols-3 gap-3">
          {trustItems.map(({ icon: Icon, label }) => (
            <div key={label} className="theme-card rounded-lg p-4">
              <Icon className="mb-3 h-5 w-5 text-amber-800 dark:text-amber-300" />
              <p className="theme-text text-sm font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="theme-card-strong w-full max-w-[480px] rounded-lg p-5 sm:p-8"
        >
          <div className="mb-7 lg:hidden">
            <Link to="/" className="flex items-center justify-center gap-2">
              <Gem className="h-8 w-8 text-amber-800 dark:text-amber-200" />
              <span className="theme-text text-xl font-black tracking-[0.16em]">GOLDMARKET</span>
            </Link>
          </div>

          {(title || subtitle) && (
            <div className="mb-7">
              {title && <h2 className="theme-text text-3xl font-black tracking-normal">{title}</h2>}
              {subtitle && <p className="theme-muted mt-2 text-sm leading-6">{subtitle}</p>}
            </div>
          )}

          {children}
        </motion.div>
      </section>
    </div>
  </main>
);

export default AuthLayout;
